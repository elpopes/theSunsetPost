class Author < ApplicationRecord
  has_many :author_stories, dependent: :destroy
  has_many :stories, through: :author_stories
  has_many :author_translations, dependent: :destroy
  has_one_attached :image

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  accepts_nested_attributes_for :author_translations

  before_validation :normalize_slug
  before_validation :generate_slug

  def translated_bio(language)
    author_translations.find_by(language: language)&.bio || bio
  end

  def normalize_slug
    self.slug = slug.to_s.parameterize if slug.present?
  end

  def generate_slug
    return if slug.present?

    self.slug = self.class.unique_slug_for(name, self)
  end

  def self.find_by_identifier(id_or_slug)
    identifier = id_or_slug.to_s
    return nil if identifier.blank?

    if identifier.match?(/\A\d+\z/)
      find_by(id: identifier)
    else
      find_by(slug: identifier)
    end
  end

  def self.unique_slug_for(source, author = nil)
    base_slug = source.to_s.parameterize.presence || "author"
    candidate = base_slug
    suffix = 2
    scope = all
    scope = scope.where.not(id: author.id) if author&.id

    while scope.exists?(slug: candidate)
      candidate = "#{base_slug}-#{suffix}"
      suffix += 1
    end

    candidate
  end
end
