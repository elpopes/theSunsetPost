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
    validates :story_translations, presence: true # Ensure at least one translation
end
  
  