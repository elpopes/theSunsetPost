class AdEvent < ApplicationRecord
  EVENT_TYPES = %w[view click].freeze
  LANGUAGES = %w[en es zh].freeze
  DEVICE_TYPES = %w[desktop mobile unknown].freeze

  belongs_to :ad_campaign

  validates :event_type, :slot, :language, :path, :event_at, presence: true
  validates :event_type, inclusion: { in: EVENT_TYPES }
  validates :language, inclusion: { in: LANGUAGES }
  validates :device_type, inclusion: { in: DEVICE_TYPES }
end
