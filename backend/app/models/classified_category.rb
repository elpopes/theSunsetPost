class ClassifiedCategory < ApplicationRecord
  has_many :classified_category_translations, dependent: :destroy
  has_many :classified_subcategories, dependent: :destroy
  has_many :classifieds, dependent: :destroy

  accepts_nested_attributes_for :classified_category_translations, allow_destroy: true

  validates :slug, presence: true, uniqueness: true
  validates :position, numericality: { only_integer: true }, allow_nil: true

  scope :active, -> { where(active: true).order(position: :asc, created_at: :asc) }

  def name_for(lang)
    lang = normalize_lang(lang)
    classified_category_translations.find { |t| normalize_lang(t.language) == lang }&.name ||
      classified_category_translations.find { |t| normalize_lang(t.language) == "en" }&.name ||
      classified_category_translations.first&.name
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
