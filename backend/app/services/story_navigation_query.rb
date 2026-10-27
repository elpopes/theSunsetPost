class StoryNavigationQuery
  def initialize(story:, language:)
    @story = story
    @language = language
  end

  def call
    return { previous: nil, next: nil } unless navigable_story?

    # Filter and limit in SQL; never load the archive's article bodies.
    classified_ids = Story.joins(:sections)
                          .where("LOWER(sections.name) = ?", "classifieds")
                          .select(:id)
    candidates = Story.joins(:story_translations)
                      .where(story_translations: { language: @language })
                      .where("BTRIM(story_translations.title) <> ''")
                      .where.not(id: classified_ids)
                      .select("stories.*, story_translations.meta_description AS navigation_meta_description")
                      .with_attached_image

    {
      previous: candidates
        .where("(stories.created_at, stories.id) < (?, ?)", @story.created_at, @story.id)
        .order(created_at: :desc, id: :desc).first,
      next: candidates
        .where("(stories.created_at, stories.id) > (?, ?)", @story.created_at, @story.id)
        .order(created_at: :asc, id: :asc).first
    }
  end

  private

  def navigable_story?
    @story.story_translations.any? { |translation|
      translation.language == @language && translation.title.present?
    } && !@story.sections.any? { |section| section.name.to_s.downcase == "classifieds" }
  end
end
