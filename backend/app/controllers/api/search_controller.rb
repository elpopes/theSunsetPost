# app/controllers/api/search_controller.rb
class Api::SearchController < ApplicationController
  skip_before_action :authenticate_admin!, only: [:index], raise: false

  # GET /api/search?q=query[&limit=20]
  def index
    query = params[:q].to_s.strip
    limit = params[:limit].presence&.to_i

    return render json: { results: [] } if query.blank?

    # sane story limit
    limit = 20 if limit.nil? || limit <= 0 || limit > 50

    trimmed_query = query[0, 200]

    # First, find matching story_ids via translations + authors
    story_ids = StoryTranslation
      .left_joins(story: :authors)
      .where(search_sql, q: "%#{trimmed_query}%")
      .distinct
      .limit(limit)
      .pluck(:story_id)

    # Then load those stories with all translations + authors
    stories = Story
      .includes(:story_translations, :authors)
      .where(id: story_ids)

    results = stories.map { |story| serialize_story(story) }

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

  def serialize_story(story)
    {
      id:    story.id,
      slug:  story.slug,
      url:   story_url_for(story),
      image_url: story_image_url(story),
      translations: story.story_translations.map do |tr|
        {
          id:              tr.id,
          language:        tr.language,
          title:           tr.title,
          content:         tr.content,
          meta_description: tr.meta_description,
          caption:         tr.caption
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
