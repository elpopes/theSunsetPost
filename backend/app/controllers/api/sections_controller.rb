class Api::SectionsController < ApplicationController
    # GET /api/sections
    def index
      Rails.logger.debug "Fetching all sections with translations"
      sections = Section.includes(:section_translations).all
      Rails.logger.info "Fetched #{sections.size} sections"
      render json: sections.map { |section| section_json(section) }
    end
  
    # GET /api/sections/:id
    def show
      Rails.logger.debug "Fetching section with ID: #{params[:id]}"
      section = Section.includes(:section_translations, stories: [:story_translations]).find_by(id: params[:id])
  
      if section
        Rails.logger.info "Section found: #{section.name}"
        render json: section_json(section, include_stories: true)
      else
        Rails.logger.error "Section not found with ID: #{params[:id]}"
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
  