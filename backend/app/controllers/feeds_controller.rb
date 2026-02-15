# app/controllers/feeds_controller.rb
class FeedsController < ApplicationController
  MAX_ITEMS = 30
  SITE_URL = "https://www.sunsetpost.org"

  skip_before_action :authenticate_request, raise: false
  skip_before_action :require_admin!, raise: false

    def rss
        @lang = normalize_lang(params[:lang] || "en")

        @stories = Story
            .includes(:story_translations, :authors, :sections, image_attachment: :blob)
            .joins(:story_translations)
            .where(story_translations: { language: @lang })
            .distinct
            .order(created_at: :desc)
            .limit(MAX_ITEMS)

        expires_in 10.minutes, public: true

        render "feeds/rss", formats: :xml
    end


  private

  def normalize_lang(lng)
    s = lng.to_s.downcase
    return "es" if s.start_with?("es")
    return "zh" if s.start_with?("zh")
    "en"
  end
end
