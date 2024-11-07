class Story < ApplicationRecord
    has_many :story_translations, dependent: :destroy
    has_one_attached :image
    accepts_nested_attributes_for :story_translations
end
  