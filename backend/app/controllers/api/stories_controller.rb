class Api::StoriesController < ApplicationController
    before_action :authenticate_request, only: [:create, :update, :destroy]
  
    # GET /api/stories
    def index
      Rails.logger.debug "Fetching all stories with translations and authors"
      @stories = Story.includes(:story_translations, :authors, :sections).order(created_at: :desc)
      Rails.logger.info "Fetched #{@stories.size} stories"
      render json: @stories.map { |story| story_json(story) }
    end
  
    # GET /api/stories/:id
    def show
      Rails.logger.debug "Fetching story with ID: #{params[:id]}"
      @story = Story.includes(:story_translations, :authors, :sections).find_by(id: params[:id])
  
      if @story
        Rails.logger.info "Story found: #{@story.id}"
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
      @story.image.attach(params[:image]) if params[:image].present?
  
      # Parse and add translations
      begin
        translations = JSON.parse(params[:translations])
        translations.each do |translation|
          @story.story_translations.build(
            title: translation["title"],
            content: translation["content"],
            meta_description: translation["meta_description"],
            language: translation["language"]
          )
        end
      rescue JSON::ParserError => e
        Rails.logger.error "Failed to parse translations: #{e.message}"
        render json: { error: "Invalid translations format" }, status: :unprocessable_entity
        return
      end
  
      # Assign authors and sections
      @story.authors = Author.where(id: JSON.parse(params[:author_ids])) if params[:author_ids].present?
      @story.sections = Section.where(id: JSON.parse(params[:section_ids])) if params[:section_ids].present?
  
      if @story.save
        Rails.logger.info "Story created successfully with ID: #{@story.id}"
        render json: story_json(@story), status: :created
      else
        Rails.logger.error "Failed to save story: #{@story.errors.full_messages.join(', ')}"
        render json: { errors: @story.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # PATCH/PUT /api/stories/:id
    def update
      @story = Story.find_by(id: params[:id])
      return render json: { error: "Story not found" }, status: :not_found unless @story
  
      # Update translations
      if params[:translations].present?
        @story.story_translations.destroy_all
        begin
          translations = JSON.parse(params[:translations])
          translations.each do |translation|
            @story.story_translations.build(
              title: translation["title"],
              content: translation["content"],
              meta_description: translation["meta_description"],
              language: translation["language"]
            )
          end
        rescue JSON::ParserError => e
          render json: { error: "Invalid translations format" }, status: :unprocessable_entity
          return
        end
      end
  
      if @story.update(image: params[:image])
        render json: story_json(@story), status: :ok
      else
        render json: { errors: @story.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # DELETE /api/stories/:id
    def destroy
      @story = Story.find_by(id: params[:id])
      if @story
        @story.destroy
        render json: { message: "Story deleted successfully" }, status: :ok
      else
        render json: { error: "Story not found" }, status: :not_found
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
        render json: { error: "Unauthorized access" }, status: :unauthorized
      end
    end
  
    # Format story for JSON response
    def story_json(story)
      {
        id: story.id,
        image_url: story.image.attached? ? url_for(story.image) : nil,
        translations: story.story_translations.map do |translation|
          {
            id: translation.id,
            title: translation.title,
            content: translation.content,
            meta_description: translation.meta_description,
            language: translation.language
          }
        end,
        authors: story.authors.map do |author|
          {
            id: author.id,
            name: author.name,
            bio: author.bio
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
  