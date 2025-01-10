class StoryTranslation < ApplicationRecord
    belongs_to :story
    validates :language, presence: true, inclusion: { in: ['en', 'es', 'zh'] }

    validates :meta_description, length: { maximum: 160 }, allow_blank: true
    validates :title, :content, :caption, presence: true
end
