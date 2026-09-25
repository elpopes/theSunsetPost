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


  test "reports partner-specific UTM attribution for a story" do
    2.times do |index|
      @story.story_views.create!(
        visitor_token: "newsletter-reader-#{index}",
        language: "en",
        path: "/en/stories/analytics-test",
        source_type: "newsletter",
        utm_source: "district38",
        utm_medium: "newsletter",
        utm_campaign: "2026-10",
        utm_content: "askmo_target-en",
        engaged_seconds: 20,
        max_scroll_percent: 40,
        viewed_at: Time.current
      )
    end

    result = AdminAnalyticsQuery.new(
      start_date: Date.current.iso8601,
      end_date: Date.current.iso8601
    ).story(@story.id)

    row = result[:utm_links].find do |link|
      link[:source] == "district38" &&
        link[:medium] == "newsletter" &&
        link[:campaign] == "2026-10"
    end

    assert_not_nil row
    assert_equal "askmo_target-en", row[:utm_content]
    assert_equal "en", row[:target_language]
    assert_equal 2, row[:views]
    assert_equal 2, row[:approximate_readers]
  end
end
