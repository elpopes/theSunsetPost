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
        @story = Story.find_by(id: params[:id])
        unless @story
            return render json: { error: "Story not found" }, status: :not_found
        end
    
        # 1. Destroy old translations and rebuild if translations are provided
        if params[:translations].present?
            @story.story_translations.destroy_all
            begin
                translations = JSON.parse(params[:translations])
                translations.each_with_index do |translation, idx|
                    @story.story_translations.build(
                        title: translation["title"],
                        content: translation["content"],
                        meta_description: translation["meta_description"],
                        caption: translation["caption"],
                        language: translation["language"]
                    )
                end
            rescue JSON::ParserError => e
                return render json: { error: "Invalid translations format" }, status: :unprocessable_entity
            end
        end
    
        # 2. Only update the image if a new one is provided
        if params[:image].present?
            @story.image.attach(params[:image])
        end
    
        # 3. Generate a slug if it's missing
        if @story.slug.blank?
            default_title = @story.story_translations.find_by(language: 'en')&.title || @story.story_translations.first&.title
            @story.slug = default_title.to_s.parameterize if default_title.present?
        end
    
        # 4. Save and return updated story
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
  