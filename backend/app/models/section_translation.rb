class SectionTranslation < ApplicationRecord
    belongs_to :section
    validates :language, presence: true, inclusion: { in: ['en', 'es', 'zh'] }
end
  