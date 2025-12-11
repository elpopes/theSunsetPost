# app/controllers/api/search_controller.rb
class Api::SearchController < ApplicationController
  skip_before_action :authenticate_admin!, only: [:index], raise: false

  # GET /api/search?q=query[&limit=20][&language=en]
  def index
    query = params[:q].to_s.strip
    limit = params[:limit].presence&.to_i
    lang  = params[:language].presence

    return render json: { results: [] } if query.blank?

    # sane story limit
    limit = 20 if limit.nil? || limit <= 0 || limit > 50

    trimmed_query = query[0, 200]

    # ---- tokenise query: "events august" -> ["events", "august"] ----
    tokens = trimmed_query.split(/\s+/).reject(&:blank?).uniq.first(5)
    return render json: { results: [] } if tokens.empty?

    # 1) Find matching translations ordered by newest story first
    matches = StoryTranslation
      .left_joins(story: :authors)
      .where(build_token_sql(tokens), build_token_params(tokens))
      .order("stories.created_at DESC")
      .limit(limit * 3)  # small safety margin for duplicates

    # 2) Extract unique story_ids in order and cap to `limit`
    story_ids = matches.map(&:story_id).uniq.first(limit)

    # 3) Load those stories with all translations + authors
    stories = Story
      .includes(:story_translations, :authors)
      .where(id: story_ids)
      .order(created_at: :desc)

    results = stories.map { |story| serialize_story(story, lang) }

    render json: { results: results }
  rescue => e
    Rails.logger.error("Search error: #{e.class} - #{e.message}")
    render json: { error: "Search is temporarily unavailable." }, status: :internal_server_error
  end

  private

  def build_token_sql(tokens)
    tokens.each_with_index.map do |_, idx|
      key = "w#{idx}"
      <<~SQL.squish
        (
          story_translations.title ILIKE :#{key}
          OR story_translations.content ILIKE :#{key}
          OR story_translations.meta_description ILIKE :#{key}
          OR story_translations.caption ILIKE :#{key}
          OR authors.name ILIKE :#{key}
        )
      SQL
    end.join(" AND ")
  end

  def build_token_params(tokens)
    params = {}
    tokens.each_with_index do |term, idx|
      params[:"w#{idx}"] = "%#{term}%"
    end
    params
  end

  def serialize_story(story, lang_param = nil)
    lang = lang_param.presence

    preferred_tr =
      if lang
        story.story_translations.find { |tr| tr.language == lang }
      end

    effective_title =
      preferred_tr&.title.presence ||
      story.story_translations.find { |tr| tr.language == "en" }&.title.presence ||
      story.story_translations.first&.title.presence ||
      story.slug.to_s.tr("-", " ").capitalize

    {
      id:   story.id,
      slug: story.slug,
      url:  story_url_for(story),
      title: effective_title,
      image_url: story_image_url(story),
      translations: story.story_translations.map do |tr|
        {
          id:               tr.id,
          language:         tr.language,
          title:            tr.title,
          content:          tr.content,
          meta_description: tr.meta_description,
          caption:          tr.caption
        }
      end,
      authors: story.authors.map { |a| { id: a.id, name: a.name } }
    }
  end

  def story_url_for(story)
    slug_or_id = story.slug.presence || story.id
    "/stories/#{slug_or_id}"
  end

  def story_image_url(story)
    return nil unless story.respond_to?(:image) && story.image.attached?
    url_for(story.image)
  end
end
