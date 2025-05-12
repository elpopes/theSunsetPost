class PreviewsController < ApplicationController
    def story
      @story = Story.includes(:story_translations).find_by(slug: params[:slug])
  
      if @story.nil?
        render plain: "Story not found", status: :not_found
        return
      end
  
      # Detect known crawler user agents
      user_agent = request.user_agent.to_s.downcase
      is_bot = user_agent.include?("facebook") ||
               user_agent.include?("twitter") ||
               user_agent.include?("whatsapp") ||
               user_agent.include?("discordbot") ||
               user_agent.include?("linkedin") ||
               user_agent.include?("slack") ||
               user_agent.include?("embedly") ||
               user_agent.include?("bot")
  
      Rails.logger.info "User-Agent: #{user_agent}"
      Rails.logger.info "Bot? #{is_bot}"
  
      unless is_bot
        frontend_url = Rails.env.production? ? "https://sunsetpost.org" : "http://localhost:5000"
        redirect_to "#{frontend_url}/stories/#{@story.slug}" and return
      end
  
      @translation = @story.story_translations.find { |t| t.language == "en" } || @story.story_translations.first
      @image_url = @story.image.attached? ? url_for(@story.image) : view_context.asset_url("default-preview.jpg")
  
      render layout: false
    end
  end
  