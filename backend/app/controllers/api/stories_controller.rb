class Api::StoriesController < ApplicationController
    # GET /api/stories
    def index
        Rails.logger.debug "Fetching all stories with translations"
        @stories = Story.includes(:story_translations).all
        Rails.logger.debug "Fetched #{@stories.size} stories with translations"
        render json: @stories.map { |story| story_json(story) }
    end
  
    # POST /api/stories
    def create
        Rails.logger.debug "Current environment: #{Rails.env}"
        Rails.logger.debug "Params received: #{params.inspect}"
        Rails.logger.debug "Active Storage service: #{Rails.application.config.active_storage.service}"
      
        # Initialize a new Story instance
        @story = Story.new
      
        # Attach image if provided
        if params[:image].present?
            Rails.logger.debug "Image param detected. Attempting to attach image..."
            @story.image.attach(params[:image])
            Rails.logger.debug "Image attachment status: #{@story.image.attached? ? 'Success' : 'Failure'}"
        else
            Rails.logger.debug "No image param found."
        end
      
        # Convert `translations` from a hash to an array of values
        translations = params[:translations].is_a?(ActionController::Parameters) ? params[:translations].values : []
      
        # Use the first translation as primary attributes for the story, if it exists
        primary_translation = translations.first
        if primary_translation
            @story.title = primary_translation[:title]
            @story.content = primary_translation[:content]
            @story.language = primary_translation[:language]
        end
      
        # Build additional translations for the story
        translations.each do |translation_params|
            Rails.logger.debug "Processing translation for language: #{translation_params[:language]}"
            if translation_params.is_a?(ActionController::Parameters)
                Rails.logger.debug "Processing translation params: #{translation_params.inspect}"
                permitted_translation_params = translation_params.permit(:title, :content, :language)
                @story.story_translations.build(permitted_translation_params)
            else
                Rails.logger.debug "Skipping invalid translation params: #{translation_params.inspect}"
            end
        end
      
        # Save the story with translations
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
            title: story.title,
            content: story.content,
            language: story.language,
            image_url: story.image.attached? ? url_for(story.image) : nil,
            translations: story.story_translations.map do |translation|
                {
                    id: translation.id,
                    title: translation.title,
                    content: translation.content,
                    language: translation.language
                }
            end
        }
    end
end
  