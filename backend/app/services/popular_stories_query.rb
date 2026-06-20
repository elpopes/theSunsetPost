class PopularStoriesQuery
  DEFAULT_LIMIT = 3
  DEFAULT_WINDOW = 48.hours

  def initialize(language:, limit: DEFAULT_LIMIT, window: DEFAULT_WINDOW)
    @language = language
    @limit = limit
    @window = window
  end

  def call
    language_rankings = rankings(view_language: language, limit: limit).map do |ranking|
      ranking.merge(ranking_scope: "language")
    end

    remaining = limit - language_rankings.length
    return language_rankings if remaining <= 0

    fallback_rankings = rankings(
      exclude_story_ids: language_rankings.pluck(:story_id),
      limit: remaining
    ).map do |ranking|
      ranking.merge(ranking_scope: "overall")
    end

    language_rankings + fallback_rankings
  end

  private

  attr_reader :language, :limit, :window

  def rankings(view_language: nil, exclude_story_ids: [], limit:)
    eligible_story_ids = StoryTranslation
                         .where(language: language)
                         .select(:story_id)

    scope = StoryView
            .joins(:story)
            .where(story_id: eligible_story_ids)
            .where(viewed_at: (Time.current - window)..Time.current)

    scope = scope.where(language: view_language) if view_language
    scope = scope.where.not(story_id: exclude_story_ids) if exclude_story_ids.any?

    scope
      .select("story_views.story_id, COUNT(story_views.id) AS recent_views")
      .group("story_views.story_id", "stories.created_at")
      .order(Arel.sql("COUNT(story_views.id) DESC, stories.created_at DESC"))
      .limit(limit)
      .map do |record|
        {
          story_id: record.story_id,
          recent_views: record.read_attribute(:recent_views).to_i
        }
      end
  end
end
