class Api::AuthorsController < ApplicationController
    def index
      authors = Author.all
      render json: authors.map { |author| author_json(author) }
    end
  
    def show
      author = Author.find(params[:id])
      render json: author_json(author)
    end
  
    def create
      author = Author.new(name: params[:name])
  
      # Parse and save multilingual bios
      if params[:translations].present?
        begin
          translations = JSON.parse(params[:translations])
  
          translations.each do |translation|
            author.author_translations.build(
              language: translation["language"],
              bio: translation["bio"]
            )
          end
        rescue JSON::ParserError => e
          render json: { error: "Invalid translations format" }, status: :unprocessable_entity
          return
        end
      elsif params[:bio].present?
        # Default to English bio if no translations are provided
        author.author_translations.build(language: 'en', bio: params[:bio])
      end
  
      # Attach image if provided
      if params[:image].present?
        author.image.attach(params[:image])
      end
  
      # Attempt to save the author and translations
      if author.save
        render json: author_json(author), status: :created
      else
        render json: { errors: author.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    private
  
    def author_json(author)
      {
        id: author.id,
        name: author.name,
        bio: author.translated_bio(I18n.locale.to_s),
        image_url: author.image.attached? ? url_for(author.image) : nil,
        stories: author.stories.map { |story| { id: story.id, title: story.title } },
        translations: author.author_translations.map do |translation|
          {
            language: translation.language,
            bio: translation.bio
          }
        end
      }
    end
  
    def author_params
      params.permit(:name, :bio, :image, translations: [:language, :bio])
    end
end
  