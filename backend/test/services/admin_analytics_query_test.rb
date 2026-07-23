require "test_helper"

class AdminAnalyticsQueryTest < ActiveSupport::TestCase
  setup do
    @story = Story.create!(
      slug: "analytics-test",
      story_translations: [
        StoryTranslation.new(
          language: "en",
          title: "Analytics test",
          content: "Test content"
        )
      ]
    )

    @story.story_views.create!(
      visitor_token: "reader-1",
      language: "en",
      path: "/en/stories/analytics-test",
      source_type: "direct",
      engaged_seconds: 45,
      max_scroll_percent: 70,
      viewed_at: Time.current
    )
    @story.story_views.create!(
      visitor_token: "reader-2",
      language: "en",
      path: "/en/stories/analytics-test",
      source_type: "search",
      engaged_seconds: 10,
      max_scroll_percent: 20,
      viewed_at: Time.current
    )
  end

  test "reports the documented engaged-read definition" do
    result = AdminAnalyticsQuery.new(
      start_date: Date.current.iso8601,
      end_date: Date.current.iso8601
    ).overview

    assert_equal 2, result[:metrics][:story_views]
    assert_equal 2, result[:metrics][:approximate_readers]
    assert_equal 1, result[:metrics][:engaged_reads]
    assert_equal 50.0, result[:metrics][:engagement_rate]
  end
end
