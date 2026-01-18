class ClassifiedSubcategory < ApplicationRecord
  belongs_to :classified_category

  has_many :classified_subcategory_translations, dependent: :destroy
  has_many :classifieds, dependent: :destroy

  accepts_nested_attributes_for :classified_subcategory_translations, allow_destroy: true

  validates :slug, presence: true, uniqueness: { scope: :classified_category_id }
  validates :position, numericality: { only_integer: true }, allow_nil: true

  scope :active, -> { where(active: true).order(position: :asc, created_at: :asc) }

  def name_for(lang)
    lang = normalize_lang(lang)
    classified_subcategory_translations.find { |t| normalize_lang(t.language) == lang }&.name ||
      classified_subcategory_translations.find { |t| normalize_lang(t.language) == "en" }&.name ||
      classified_subcategory_translations.first&.name
  end

  private

  def normalize_lang(lng)
    return "en" if lng.blank?
    s = lng.to_s
    return "es" if s.start_with?("es")
    return "zh" if s.start_with?("zh")
    "en"
  end
end
