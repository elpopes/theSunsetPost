class Api::StoriesController < ApplicationController
    # GET /api/stories
    def index
      Rails.logger.debug "Fetching all stories"
      @stories = Story.all
      Rails.logger.debug "Fetched #{@stories.size} stories"
      
      render json: @stories.map { |story| story_json(story) }
    end
  
    # POST /api/stories
    def create
        Rails.logger.debug "Current environment: #{Rails.env}"

      Rails.logger.debug "Params received: #{params.inspect}"
      Rails.logger.debug "Active Storage service: #{Rails.application.config.active_storage.service}" # Log the Active Storage service
  
      @story = Story.new(story_params)
      Rails.logger.debug "Story created with attributes: #{@story.inspect}"
  
      if params[:image].present?
        Rails.logger.debug "Image param detected. Attempting to attach image..."
        @story.image.attach(params[:image])
        Rails.logger.debug "Image attachment status: #{@story.image.attached? ? 'Success' : 'Failure'}"
      else
        Rails.logger.debug "No image param found."
      end
  
      if @story.save
        Rails.logger.debug "Story saved successfully. Image attached? #{@story.image.attached?}"
        if @story.image.attached?
          Rails.logger.debug "Image URL: #{url_for(@story.image)}"
        end
        render json: @story, status: :created
      else
        Rails.logger.debug "Failed to save story: #{@story.errors.full_messages.join(', ')}"
        render json: @story.errors, status: :unprocessable_entity
      end
    end
  
    private
  
    def story_params
      permitted_params = params.permit(:title, :content, :language, :image)
      Rails.logger.debug "Permitted parameters: #{permitted_params.inspect}"
      permitted_params
    end
  
    def story_json(story)
      {
        id: story.id,
        title: story.title,
        content: story.content,
        language: story.language,
        image_url: story.image.attached? ? url_for(story.image) : nil
      }
    end
  end
  
  