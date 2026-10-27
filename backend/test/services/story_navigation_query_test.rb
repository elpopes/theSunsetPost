require "test_helper"

class StoryNavigationQueryTest < ActiveSupport::TestCase
  def create_story(name, date, languages: %w[en es zh])
    Story.create!(
      slug: name,
      created_at: date,
      story_translations: languages.map { |language|
        StoryTranslation.new(language: language, title: "#{language} #{name}",
                             content: "Full article body", meta_description: "#{language} summary")
      }
    )
  end

  setup do
    @older = create_story("older", Time.utc(2026, 7, 1))
    @current = create_story("current", Time.utc(2026, 7, 3))
    @newer = create_story("newer", Time.utc(2026, 7, 5))
  end

  test "returns the two closest stories with only the requested description" do
    %w[en es zh].each do |language|
      result = StoryNavigationQuery.new(story: @current, language: language).call
      assert_equal @older.id, result[:previous].id
      assert_equal @newer.id, result[:next].id
      assert_equal "#{language} summary", result[:previous].navigation_meta_description
      assert_not result[:previous].association(:story_translations).loaded?
    end
  end

  test "skips untranslated stories and classifieds even with multiple sections" do
    create_story("english-only", Time.utc(2026, 7, 2), languages: ["en"])
    classified = create_story("classified", Time.utc(2026, 7, 4))
    classified.sections << Section.create!(name: "cLaSsIfIeDs")
    classified.sections << Section.create!(name: "People")

    result = StoryNavigationQuery.new(story: @current, language: "es").call
    assert_equal @older.id, result[:previous].id
    assert_equal @newer.id, result[:next].id
  end

  test "uses ID to break ties in publication time in both directions" do
    before = create_story("same-time-before", Time.utc(2026, 8, 1))
    current = create_story("same-time-current", before.created_at)
    after = create_story("same-time-after", before.created_at)

    result = StoryNavigationQuery.new(story: current, language: "en").call
    assert_equal before.id, result[:previous].id
    assert_equal after.id, result[:next].id
  end

  test "returns null at archive boundaries without wrapping around" do
    oldest = StoryNavigationQuery.new(story: @older, language: "en").call
    newest = StoryNavigationQuery.new(story: @newer, language: "en").call
    assert_nil oldest[:previous]
    assert_equal @current.id, oldest[:next].id
    assert_nil newest[:next]
    assert_equal @current.id, newest[:previous].id
  end

  test "does not navigate from a classified or an unavailable translation" do
    @current.sections << Section.create!(name: "Classifieds")
    assert_equal({ previous: nil, next: nil },
                 StoryNavigationQuery.new(story: @current, language: "en").call)
    english = create_story("untranslated", Time.utc(2026, 7, 2), languages: ["en"])
    assert_equal({ previous: nil, next: nil },
                 StoryNavigationQuery.new(story: english, language: "es").call)
  end

  test "preserves neighbors with missing descriptions and skips blank translated titles" do
    @older.story_translations.find_by!(language: "en").update!(meta_description: nil)
    blank = create_story("legacy-blank-title", Time.utc(2026, 7, 4))
    blank.story_translations.find_by!(language: "en").update_column(:title, "   ")
    result = StoryNavigationQuery.new(story: @current, language: "en").call
    assert_equal @older.id, result[:previous].id
    assert_nil result[:previous].navigation_meta_description
    assert_equal @newer.id, result[:next].id
  end
end
