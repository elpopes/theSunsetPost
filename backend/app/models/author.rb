class Author < ApplicationRecord
    has_many :author_stories, dependent: :destroy
    has_many :stories, through: :author_stories
  
    has_one_attached :image
  
    validates :name, presence: true
  end
  