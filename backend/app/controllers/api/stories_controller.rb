class Api::StoriesController < ApplicationController
    def create
        @story = Story.new(story_params)
        @story.image.attach(params[:image]) if params[:image].present? # Attach image
      
        if @story.save
            render json: @story, status: :created
        else
            render json: @story.errors, status: :unprocessable_entity
        end
    end

    def index
        @stories = Story.all
        render json: @stories.map { |story| story_json(story) }
    end
      
      private
      
    def story_json(story)
        {
            id: story.id,
            title: story.title,
            content: story.content,
            language: story.language,
            image_url: story.image.attached? ? url_for(story.image) : nil # Include the image URL
        }
    end
      
  
    private
  
    def story_params
        params.require(:story).permit(:title, :content, :language, :image) # Permit image parameter
    end
end
  
  