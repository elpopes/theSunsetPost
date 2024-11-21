class Section < ApplicationRecord
    has_many :section_stories, dependent: :destroy
    has_many :stories, through: :section_stories
  
    validates :name, presence: true, uniqueness: true
  end
  