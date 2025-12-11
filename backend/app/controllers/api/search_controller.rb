# app/controllers/api/search_controller.rb
class Api::SearchController < ApplicationController
  skip_before_action :authenticate_admin!, only: [:index], raise: false

  # GET /api/search?q=query[&language=en][&limit=5]
  def index
    query    = params[:q].to_s.strip
    language = params[:language].presence
    limit    = params[:limit].presence&.to_i

    return render json: { results: [] } if query.blank?

    # keep limit within a sane range
    limit = 50 if limit.nil? || limit <= 0 || limit > 50

    trimmed_query = query[0, 200]

    translations = StoryTranslation
      .includes(story: :authors) # eager-load stories + authors
      .left_joins(story: :authors) # so we can search authors.name
      .where.not(title: [nil, ""])
      .yield_self { |rel| language ? rel.where(language: language) : rel }
      .where(search_sql, q: "%#{trimmed_query}%")
      .order(created_at: :desc)
      .distinct # avoid duplicates when multiple authors match
      .limit(limit)

    results = translations.map { |t| serialize_translation(t) }

    render json: { results: results }
  rescue => e
    Rails.logger.error("Search error: #{e.class} - #{e.message}")
    render json: { error: "Search is temporarily unavailable." }, status: :internal_server_error
  end

  private

  # Search in multiple text fields on story_translations + author name.
  def search_sql
    <<~SQL.squish
      story_translations.title ILIKE :q
      OR story_translations.content ILIKE :q
      OR story_translations.meta_description ILIKE :q
      OR story_translations.caption ILIKE :q
      OR authors.name ILIKE :q
    SQL
  end

  def serialize_translation(translation)
    story = translation.story

    {
      id:           story.id,
      type:         "story",
      title:        translation.title,
      language:     translation.language,
      slug:         story.slug,
      url:          story_url_for(story),
      published_at: story.created_at,
      snippet:      build_snippet(translation),
      image_url:    story_image_url(story)
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

  def build_snippet(translation)
    raw = translation.content.to_s
    text = ActionView::Base.full_sanitizer.sanitize(raw).squish
    return "" if text.blank?
    text.length > 200 ? "#{text[0, 197]}..." : text
  end
end
