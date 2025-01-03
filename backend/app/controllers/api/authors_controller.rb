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
      author = Author.new(author_params)
      if params[:image].present?
        author.image.attach(params[:image])
      end
  
      if author.save
        render json: author_json(author), status: :created
      else
        render json: { errors: author.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    private
  
    def author_json(author)
        locale = I18n.locale.to_s
        {
          id: author.id,
          name: author.name,
          bio: author.translated_bio(locale),
          image_url: author.image.attached? ? url_for(author.image) : nil,
          stories: author.stories.map { |story| { id: story.id, title: story.title } }
        }
    end
      
      
  
    def author_params
      params.permit(:name, :bio)
    end
end
  