class Section < ApplicationRecord
    has_many :section_translations, dependent: :destroy
    has_many :section_stories, dependent: :destroy
    has_many :stories, through: :section_stories
  
    validates :name, presence: true, uniqueness: true

    def translated_name(language)
        section_translations.find_by(language: language)&.name || section_translations.find_by(language: 'en')&.name || name
    end
      
    def translated_description(language)
        section_translations.find_by(language: language)&.description || section_translations.find_by(language: 'en')&.description || description
    end
end
  