class Api::StoriesController < ApplicationController
    before_action :authenticate_request, only: [:create]
  
    # GET /api/stories
    def index
      Rails.logger.debug "Fetching all stories with translations"
      @stories = Story.includes(:story_translations).all
      Rails.logger.debug "Fetched #{@stories.size} stories with translations"
      render json: @stories.map { |story| story_json(story) }
    end
  
    # GET /api/stories/:id
    def show
      Rails.logger.debug "Fetching story with ID: #{params[:id]}"
      @story = Story.includes(:story_translations).find_by(id: params[:id])
  
      if @story
        Rails.logger.debug "Story found: #{@story.title}"
        render json: story_json(@story)
      else
        Rails.logger.error "Story not found with ID: #{params[:id]}"
        render json: { error: "Story not found" }, status: :not_found
      end
    end
  
    # POST /api/stories
    def create
        Rails.logger.debug "Params received: #{params.inspect}"
      
        @story = Story.new
      
        # Attach image if provided
        if params[:image].present?
          @story.image.attach(params[:image])
          Rails.logger.debug "Image attachment status: #{@story.image.attached? ? 'Success' : 'Failure'}"
        else
          Rails.logger.debug "No image param found."
        end
      
        # Parse translations from JSON string
        begin
          translations = JSON.parse(params[:translations])
          Rails.logger.debug "Parsed translations: #{translations.inspect}"
        rescue JSON::ParserError => e
          Rails.logger.error "Failed to parse translations: #{e.message}"
          return render json: { error: "Invalid translations format" }, status: :unprocessable_entity
        end
      
        # Use the first translation as primary attributes for the story
        primary_translation = translations.first
        if primary_translation
          @story.title = primary_translation["title"]
          @story.content = primary_translation["content"]
          @story.language = primary_translation["language"]
          Rails.logger.debug "Primary attributes set: #{@story.title}, #{@story.content}, #{@story.language}"
        else
          Rails.logger.debug "No primary translation found. Skipping primary attribute assignment."
        end
      
        # Add additional translations
        translations.each do |translation|
          Rails.logger.debug "Processing translation: #{translation.inspect}"
          @story.story_translations.build(
            title: translation["title"],
            content: translation["content"],
            language: translation["language"]
          )
        end
      
        # Save the story
        if @story.save
          Rails.logger.debug "Story saved successfully. ID: #{@story.id}"
          render json: story_json(@story), status: :created
        else
          Rails.logger.error "Failed to save story: #{@story.errors.full_messages.join(', ')}"
          render json: { errors: @story.errors.full_messages }, status: :unprocessable_entity
        end
    end
      
      
  
    private
  
    # Authenticate JWT token and set @current_user
    def authenticate_request
      header = request.headers['Authorization']
      token = header.split(' ').last if header
  
      begin
        decoded = JWT.decode(token, JWT_SECRET_KEY, true, { algorithm: 'HS256' })
        @current_user = User.find(decoded[0]['user_id'])
        Rails.logger.debug "Authenticated user: #{@current_user.email}"
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        Rails.logger.debug "Unauthorized access: Invalid token"
        render json: { error: "Unauthorized access" }, status: :unauthorized
      end
    end
  
    # Format story for JSON response
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
  