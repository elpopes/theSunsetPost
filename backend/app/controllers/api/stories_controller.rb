class Api::StoriesController < ApplicationController
    # GET /api/stories
    def index
        Rails.logger.debug "Fetching all stories with translations"
        @stories = Story.includes(:story_translations)
        Rails.logger.debug "Fetched #{@stories.size} stories"
    
        render json: @stories.map { |story| story_json(story) }
    end
  
    # POST /api/stories
    def create
        Rails.logger.debug "Current environment: #{Rails.env}"
        Rails.logger.debug "Params received: #{params.inspect}"
        Rails.logger.debug "Active Storage service: #{Rails.application.config.active_storage.service}" # Log the Active Storage service
    
        @story = Story.new
        Rails.logger.debug "Story created with attributes: #{@story.inspect}"
    
        # Attach image if provided
        if params[:image].present?
            Rails.logger.debug "Image param detected. Attempting to attach image..."
            @story.image.attach(params[:image])
            Rails.logger.debug "Image attachment status: #{@story.image.attached? ? 'Success' : 'Failure'}"
        else
            Rails.logger.debug "No image param found."
        end
    
        # Loop through translations provided in params and build each translation for the story
        translations = params[:translations] || []
        translations.each do |translation_params|
            Rails.logger.debug "Processing translation params: #{translation_params.inspect}"
            @story.story_translations.build(translation_params.permit(:title, :content, :language))
        end
    
        if @story.save
            Rails.logger.debug "Story and translations saved successfully. Image attached? #{@story.image.attached?}"
            if @story.image.attached?
            Rails.logger.debug "Image URL: #{url_for(@story.image)}"
            end
            render json: story_json(@story), status: :created
        else
            Rails.logger.debug "Failed to save story or translations: #{@story.errors.full_messages.join(', ')}"
            render json: @story.errors, status: :unprocessable_entity
        end
    end
  
    private
  
    def story_json(story)
        {
            id: story.id,
            image_url: story.image.attached? ? url_for(story.image) : nil,
            translations: story.story_translations.map do |translation|
            {
                language: translation.language,
                title: translation.title,
                content: translation.content
            }
            end
        }
    end
end
  