class StoryTranslation < ApplicationRecord
    belongs_to :story
    validates :language, presence: true, inclusion: { in: ['en', 'es', 'zh'] }
end
