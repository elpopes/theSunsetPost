class Story < ApplicationRecord
  # Associations
  has_many :author_stories, dependent: :destroy
  has_many :authors, through: :author_stories

  has_many :section_stories, dependent: :destroy
  has_many :sections, through: :section_stories

  has_many :story_translations, dependent: :destroy
  has_many :story_views, dependent: :destroy
  accepts_nested_attributes_for :story_translations, allow_destroy: true

  has_one_attached :image # Featured image (used for social sharing)

  # Validations
  validates :story_translations, presence: true
  validates :slug, uniqueness: true, allow_blank: true

  # Slug generation
  before_validation :normalize_slug
  before_validation :generate_slug

  def normalize_slug
    self.slug = slug.to_s.parameterize if slug.present?
  end

  def generate_slug
    return if slug.present?

    default_title = story_translations.find_by(language: "en")&.title || story_translations.first&.title
    self.slug = default_title.to_s.parameterize if default_title.present?
  end

  # Fallback finder. Numeric route params are IDs; all other params are slugs.
  def self.find_by_identifier(id_or_slug)
    identifier = id_or_slug.to_s
    return nil if identifier.blank?

    if identifier.match?(/\A\d+\z/)
      find_by(id: identifier)
    else
      find_by(slug: identifier)
    end
  end
end
