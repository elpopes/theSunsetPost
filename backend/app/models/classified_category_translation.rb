class ClassifiedCategoryTranslation < ApplicationRecord
  belongs_to :classified_category

  validates :language, presence: true, inclusion: { in: %w[en es zh] }
  validates :name, presence: true

  validates :language, uniqueness: { scope: :classified_category_id }
end
