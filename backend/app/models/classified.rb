class Classified < ApplicationRecord
  has_many :classified_translations, dependent: :destroy
  accepts_nested_attributes_for :classified_translations, allow_destroy: true

  belongs_to :classified_category
  belongs_to :classified_subcategory, optional: true

  has_one_attached :photo

  enum status: {
    draft: 0,
    pending: 1,
    published: 2,
    archived: 3
  }

  validates :slug, presence: true, uniqueness: true
  validates :status, presence: true
  validates :submitter_email, presence: true
  validates :classified_category, presence: true

  validate :subcategory_belongs_to_category
  validate :photo_size_under_1mb

  before_validation :ensure_slug, on: :create

  scope :published_now, -> {
    published
      .where("expires_at IS NULL OR expires_at > ?", Time.current)
      .order(posted_at: :desc, created_at: :desc)
  }

  def expired?
    expires_at.present? && expires_at <= Time.current
  end

  def translation_for(lang)
    lang = normalize_lang(lang)
    classified_translations.find { |t| normalize_lang(t.language) == lang } ||
      classified_translations.find { |t| normalize_lang(t.language) == "en" } ||
      classified_translations.first
  end

  private

  def ensure_slug
    return if slug.present?

    title =
      classified_translations.find { |t| normalize_lang(t.language) == "en" }&.title ||
      classified_translations.first&.title

    base = title.to_s.parameterize
    base = "classified" if base.blank?

    time =
      posted_at ||
      created_at ||
      Time.current

    timestamp = time.strftime("%Y-%m-%d-%H%M")

    candidate = "#{base}-#{timestamp}"

    # Extremely unlikely, but guarantees uniqueness
    if Classified.exists?(slug: candidate)
      candidate = "#{candidate}-#{SecureRandom.hex(2)}"
    end

    self.slug = candidate
  end

  def subcategory_belongs_to_category
    return if classified_subcategory.nil?
    if classified_subcategory.classified_category_id != classified_category_id
      errors.add(:classified_subcategory, "must belong to the same category")
    end
  end

  def photo_size_under_1mb
    return unless photo.attached?
    if photo.blob.byte_size > 1.megabyte
      errors.add(:photo, "must be under 1 MB")
    end
  end

  def normalize_lang(lng)
    return "en" if lng.blank?
    s = lng.to_s
    return "es" if s.start_with?("es")
    return "zh" if s.start_with?("zh")
    "en"
  end
end
