class ClassifiedTranslation < ApplicationRecord
  belongs_to :classified

  validates :language, presence: true, inclusion: { in: %w[en es zh] }
  validates :language, uniqueness: { scope: :classified_id }

  validates :title, length: { maximum: 60 }, allow_blank: true
  validates :body, length: { maximum: 250 }, allow_blank: true
end
