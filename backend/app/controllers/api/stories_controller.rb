class Api::StoriesController < ApplicationController
    def create
        @story = Story.new(story_params)
        @story.image.attach(params[:image]) if params[:image].present?
  
        if @story.save
            render :show, status: :created 
        else
            render json: @story.errors, status: :unprocessable_entity
        end
    end
  
    def index
        @stories = Story.all
        render :index 
    end
  
    private
  
    def story_params
        params.require(:story).permit(:title, :content, :language, :image)
    end
end
  