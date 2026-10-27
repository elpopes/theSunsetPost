require "test_helper"

class StoryNavigationTest < ActionDispatch::IntegrationTest
  setup do
    @stories = (1..3).map { |day|
      Story.create!(slug: "navigation-#{day}", created_at: Time.utc(2026, 7, day),
                    story_translations: %w[en es zh].map { |language|
                      StoryTranslation.new(language: language, title: "#{language} title #{day}",
                                           content: "Full story content", meta_description: "#{language} summary #{day}")
                    })
    }
  end

  test "returns the current article and compact localized neighbor previews together" do
    @stories.first.image.attach(io: StringIO.new("preview image"),
                                filename: "preview.txt", content_type: "text/plain")
    %w[en es zh].each do |language|
      get "/api/stories/#{@stories[1].slug}", params: { navigation_language: language }
      assert_response :success
      body = response.parsed_body
      assert_equal @stories[1].id, body["id"]
      assert_equal "Full story content", body["translations"].first["content"]
      navigation = body.fetch("navigation")
      assert_equal language, navigation["language"]
      assert_equal @stories.first.id, navigation["previous"]["id"]
      assert_equal @stories.last.id, navigation["next"]["id"]
      assert_equal "#{language} summary 1", navigation["previous"]["meta_description"]
      assert_match %r{/rails/active_storage/}, navigation["previous"]["image_url"]
      assert_equal %w[id image_url meta_description slug], navigation["previous"].keys.sort
      assert_equal %w[id image_url meta_description slug], navigation["next"].keys.sort
    end
  end

  test "supports numeric identifiers and regional language variants" do
    get "/api/stories/#{@stories[1].id}", params: { navigation_language: "zh-TW" }
    assert_response :success
    assert_equal "zh", response.parsed_body.dig("navigation", "language")
  end

  test "keeps the original show response unchanged without an opt-in" do
    get "/api/stories/#{@stories[1].slug}"
    assert_response :success
    assert_not response.parsed_body.key?("navigation")
  end

  test "rejects unsupported navigation languages" do
    get "/api/stories/#{@stories[1].slug}", params: { navigation_language: "fr" }
    assert_response :unprocessable_entity
    assert_equal "Unsupported language", response.parsed_body["error"]
  end

  test "returns 404 for missing stories" do
    get "/api/stories/no-such-story", params: { navigation_language: "en" }
    assert_response :not_found
  end
end
