class Api::StoriesController < ApplicationController
    before_action :authenticate_request, only: [:create]
  
    # GET /api/stories
    def index
      Rails.logger.debug "Fetching all stories with translations and authors"
      @stories = Story.includes(:story_translations, :authors).all
      Rails.logger.info "Fetched #{@stories.size} stories"
      render json: @stories.map { |story| story_json(story) }
    end
  
    # GET /api/stories/:id
    def show
      Rails.logger.debug "Fetching story with ID: #{params[:id]}"
      @story = Story.includes(:story_translations, :authors).find_by(id: params[:id])
  
      if @story
        Rails.logger.info "Story found: #{@story.title}"
        render json: story_json(@story)
      else
        Rails.logger.error "Story not found with ID: #{params[:id]}"
        render json: { error: "Story not found" }, status: :not_found
      end
    end
  
    # POST /api/stories
    def create
        Rails.logger.debug "Creating a new story with params: #{params.inspect}"
        @story = Story.new
    
        # Attach image if provided
        if params[:image].present?
            @story.image.attach(params[:image])
            Rails.logger.debug "Image attachment status: #{@story.image.attached? ? 'Success' : 'Failure'}"
        end
    
        # Parse translations from JSON string
        begin
            translations = JSON.parse(params[:translations])
            Rails.logger.info "Parsed #{translations.size} translations"
        rescue JSON::ParserError => e
            Rails.logger.error "Failed to parse translations: #{e.message}"
            render json: { error: "Invalid translations format" }, status: :unprocessable_entity
            return
        end
    
        # Use the first translation as primary attributes for the story
        primary_translation = translations.first
        if primary_translation
            @story.assign_attributes(
                title: primary_translation["title"],
                content: primary_translation["content"],
                language: primary_translation["language"]
            )
            Rails.logger.debug "Primary attributes set: title=#{@story.title}, language=#{@story.language}"
        else
            Rails.logger.warn "No primary translation found; primary attributes not set."
        end
    
        # Add additional translations
        translations.each do |translation|
            @story.story_translations.build(
                title: translation["title"],
                content: translation["content"],
                language: translation["language"]
            )
        end
    
        # Assign authors if provided
        if params[:author_ids].present?
            author_ids = JSON.parse(params[:author_ids])
            @story.authors = Author.where(id: author_ids)
            Rails.logger.info "Assigned authors: #{author_ids.join(', ')}"
        else
            Rails.logger.warn "No authors provided for the story."
        end
    
        # Assign sections if provided
        if params[:section_ids].present?
            section_ids = JSON.parse(params[:section_ids])
            @story.sections = Section.where(id: section_ids)
            Rails.logger.info "Assigned sections: #{section_ids.join(', ')}"
        end
    
        # Save the story
        if @story.save
            Rails.logger.info "Story created successfully with ID: #{@story.id}"
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
        Rails.logger.info "Authenticated user: #{@current_user.email}"
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        Rails.logger.warn "Unauthorized access: Invalid token"
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
        end,
        authors: story.authors.map do |author|
            {
              id: author.id,
              name: author.name,
              bio: author.bio,
              image_url: author.image.attached? ? url_for(author.image) : nil,
              translations: author.author_translations.map do |translation|
                {
                  language: translation.language,
                  bio: translation.bio
                }
              end
            }
        end,
        sections: story.sections.map do |section|
            {
              id: section.id,
              name: section.name,
              description: section.description
            }
        end
      }
    end
  end
  