class StoryView < ApplicationRecord
  DEDUPLICATION_WINDOW = 30.minutes
  LANGUAGES = %w[en es zh].freeze
  SOURCE_TYPES = %w[
    direct
    internal
    search
    social
    newsletter
    print_qr
    referral
    unknown
  ].freeze

  belongs_to :story

  validates :visitor_token, :language, :path, :viewed_at, presence: true
  validates :language, inclusion: { in: LANGUAGES }
  validates :source_type, inclusion: { in: SOURCE_TYPES }
  validates :engaged_seconds, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :max_scroll_percent,
            numericality: {
              only_integer: true,
              greater_than_or_equal_to: 0,
              less_than_or_equal_to: 100
            }
end
