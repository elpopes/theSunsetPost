class Story < ApplicationRecord
    # Associations
    has_many :author_stories, dependent: :destroy
    has_many :authors, through: :author_stories
  
    has_many :section_stories, dependent: :destroy
    has_many :sections, through: :section_stories
  
    has_many :story_translations, dependent: :destroy
    accepts_nested_attributes_for :story_translations, allow_destroy: true
  
    has_one_attached :image # Featured image (used for social sharing)
  
    # Validations
    validates :story_translations, presence: true
  
    # Slug generation
    before_save :generate_slug
  
    def generate_slug
      return if slug.present?
  
      default_title = story_translations.find_by(language: 'en')&.title || story_translations.first&.title
      self.slug = default_title.to_s.parameterize if default_title.present?
    end
  
    # Fallback finder
    def self.find_by_identifier(id_or_slug)
      find_by(slug: id_or_slug) || find_by(id: id_or_slug)
    end
end
  