class Api::SectionsController < ApplicationController
    def index
        sections = Section.all
        render json: sections.map do |section|
          {
            id: section.id,
            name: section.translated_name(I18n.locale.to_s),
            description: section.translated_description(I18n.locale.to_s)
          }
        end
    end
    
  
    def show
      section = Section.find(params[:id])
      render json: {
        id: section.id,
        name: section.translated_name(I18n.locale.to_s),
        description: section.translated_description(I18n.locale.to_s),
        stories: section.stories.map { |story| story_json(story) }
      }
    end
  
    private
  
    def section_json(section)
      {
        id: section.id,
        name: section.translated_name(I18n.locale.to_s),
        description: section.translated_description(I18n.locale.to_s)
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
  