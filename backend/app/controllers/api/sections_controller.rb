class Api::SectionsController < ApplicationController
    # GET /api/sections
    def index
      sections = Section.includes(:section_translations).all
      render json: sections.map { |section| section_json(section) }
    end
  
    # GET /api/sections/:name
    def show_by_name
      section = Section
        .includes(:section_translations, stories: [:story_translations])
        .find_by("LOWER(name) = ?", params[:name].downcase)
  
      if section
        render json: section_json(section, include_stories: true)
      else
        render json: { error: "Section not found" }, status: :not_found
      end
    end
  
    private
  
    # Format section for JSON response
    def section_json(section, include_stories: false)
      {
        id: section.id,
        name: section.translated_name(I18n.locale.to_s),
        description: section.translated_description(I18n.locale.to_s),
        translations: section.section_translations.map do |translation|
          {
            language: translation.language,
            name: translation.name,
            description: translation.description
          }
        end,
        stories: include_stories ? ordered_stories(section) : nil
      }.compact
    end
  
    # Helper to format and order stories
    def ordered_stories(section)
      section.stories.order(created_at: :desc).map { |story| story_json(story) }
    end
  
    # Format story for JSON response (same logic as in StoriesController)
    def story_json(story)
      {
        id: story.id,
        slug: story.slug,
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
  