class Author < ApplicationRecord
    has_many :author_stories, dependent: :destroy
    has_many :stories, through: :author_stories
    has_many :author_translations, dependent: :destroy
    has_one_attached :image
  
    validates :name, presence: true
    
    def translated_bio(language)
        author_translations.find_by(language: language)&.bio || bio
    end
end
  