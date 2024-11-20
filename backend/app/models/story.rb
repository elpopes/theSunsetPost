class Story < ApplicationRecord
    has_many :author_stories, dependent: :destroy
    has_many :authors, through: :author_stories
    has_one_attached :image
    has_many :story_translations, dependent: :destroy
    accepts_nested_attributes_for :story_translations
    validates :title, :content, :language, presence: true
end
  