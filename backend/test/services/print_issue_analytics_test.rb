require "test_helper"

class PrintIssueAnalyticsTest < ActiveSupport::TestCase
  test "keeps registered zero-scan placements in the report" do
    story = Story.create!(
      slug: "zero-scan-story",
      story_translations: [
        StoryTranslation.new(
          language: "en",
          title: "Zero scan story",
          content: "Test content"
        )
      ]
    )
    issue = PrintIssue.create!(
      code: "2026-08",
      name: "August 2026",
      copies_printed: 4_000
    )
    issue.print_story_placements.create!(
      story: story,
      page_number: 4,
      print_language: "en",
      target_language: "en"
    )

    report = PrintIssueAnalytics.new(issue).as_json

    assert_equal 1, report[:placements].size
    assert_equal 0, report[:placements].first[:scans]
    assert_equal 0, report[:metrics][:scans]
  end
end
