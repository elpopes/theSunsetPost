class Api::StoriesController < ApplicationController
    before_action :authenticate_request, only: [:create, :update, :destroy]
  
    # GET /api/stories
    def index
      @stories = Story.includes(:story_translations, :authors, :sections).order(created_at: :desc)
      render json: @stories.map { |story| story_json(story) }
    end
  
    # GET /api/stories/:id_or_slug
    def show
      @story = Story.includes(:story_translations, :authors, :sections).find_by_identifier(params[:id])
      if @story
        render json: story_json(@story)
      else
        render json: { error: "Story not found" }, status: :not_found
      end
    end
  
    # POST /api/stories
    def create
      @story = Story.new
  
      @story.image.attach(params[:image]) if params[:image].present?
  
      begin
        translations = JSON.parse(params[:translations])
        translations.each do |translation|
          @story.story_translations.build(
            title: translation["title"],
            content: translation["content"],
            meta_description: translation["meta_description"],
            caption: translation["caption"],
            language: translation["language"]
          )
        end
      rescue JSON::ParserError
        return render json: { error: "Invalid translations format" }, status: :unprocessable_entity
      end
  
      @story.authors = Author.where(id: JSON.parse(params[:author_ids])) if params[:author_ids].present?
      @story.sections = Section.where(id: JSON.parse(params[:section_ids])) if params[:section_ids].present?
  
      if @story.save
        render json: story_json(@story), status: :created
      else
        render json: { errors: @story.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # PATCH/PUT /api/stories/:id_or_slug
    def update
      @story = Story.find_by_identifier(params[:id])
      return render json: { error: "Story not found" }, status: :not_found unless @story
  
      if params[:translations].present?
        @story.story_translations.destroy_all
        begin
          translations = JSON.parse(params[:translations])
          translations.each do |translation|
            @story.story_translations.build(
              title: translation["title"],
              content: translation["content"],
              meta_description: translation["meta_description"],
              caption: translation["caption"],
              language: translation["language"]
            )
          end
        rescue JSON::ParserError
          return render json: { error: "Invalid translations format" }, status: :unprocessable_entity
        end
      end
  
      @story.image.attach(params[:image]) if params[:image].present?
  
      if @story.save
        render json: story_json(@story), status: :ok
      else
        render json: { errors: @story.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # DELETE /api/stories/:id_or_slug
    def destroy
      @story = Story.find_by_identifier(params[:id])
      if @story
        @story.destroy
        render json: { message: "Story deleted successfully" }, status: :ok
      else
        render json: { error: "Story not found" }, status: :not_found
      end
    end
  
    private
  
    def authenticate_request
      header = request.headers['Authorization']
      token = header.split(' ').last if header
  
      begin
        decoded = JWT.decode(token, JWT_SECRET_KEY, true, algorithm: 'HS256')
        @current_user = User.find(decoded[0]['user_id'])
      rescue JWT::DecodeError, ActiveRecord::RecordNotFound
        render json: { error: "Unauthorized access" }, status: :unauthorized
      end
    end
  
    def story_json(story)
      {
        id: story.id,
        slug: story.slug,
        image_url: story.image.attached? ? url_for(story.image) : nil,
        translations: story.story_translations.map do |tr|
          {
            id: tr.id,
            title: tr.title,
            content: tr.content,
            meta_description: tr.meta_description,
            caption: tr.caption,
            language: tr.language
          }
        end,
        authors: story.authors.map do |author|
          {
            id: author.id,
            name: author.name,
            bio: author.translated_bio(I18n.locale.to_s),
            image_url: author.image.attached? ? url_for(author.image) : nil,
            translations: author.author_translations.map do |tr|
              { language: tr.language, bio: tr.bio }
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
  