class ClassifiedSubcategoryTranslation < ApplicationRecord
  belongs_to :classified_subcategory

  validates :language, presence: true, inclusion: { in: %w[en es zh] }
  validates :name, presence: true

  validates :language, uniqueness: { scope: :classified_subcategory_id }
end
