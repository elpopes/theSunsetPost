class Story < ApplicationRecord
    has_many :story_translations, dependent: :destroy
    has_one_attached :image
end
  