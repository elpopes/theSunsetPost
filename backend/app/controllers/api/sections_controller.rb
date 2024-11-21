class Api::SectionsController < ApplicationController
    def index
      sections = Section.all
      render json: sections.map { |section| section_json(section) }
    end
  
    def show
      section = Section.find(params[:id])
      render json: {
        id: section.id,
        name: section.name,
        description: section.description,
        stories: section.stories.map { |story| story_json(story) }
      }
    end
  
    private
  
    def section_json(section)
      {
        id: section.id,
        name: section.name,
        description: section.description
      }
    end
  
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
  