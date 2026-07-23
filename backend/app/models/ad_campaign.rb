class AdCampaign < ApplicationRecord
  CAMPAIGN_TYPES = %w[paid house].freeze

  DEFAULTS = {
    "beyondcare" => {
      name: "Beyond Care",
      advertiser: "Beyond Care Childcare Cooperative",
      campaign_type: "paid",
      destination_url: "https://beyondcare.coop/"
    },
    "subscription" => {
      name: "Sunset Post subscription",
      advertiser: "The Sunset Post",
      campaign_type: "house",
      destination_url: "https://buy.stripe.com/9B65kDcIjdtvg16cCZbQY04"
    },
    "venmo" => {
      name: "Support local journalism",
      advertiser: "The Sunset Post",
      campaign_type: "house"
    },
    "newsletter" => {
      name: "Email newsletter",
      advertiser: "The Sunset Post",
      campaign_type: "house"
    },
    "localreach" => {
      name: "Advertise with the Sunset Post",
      advertiser: "The Sunset Post",
      campaign_type: "house"
    }
  }.freeze

  has_many :ad_events, dependent: :destroy

  validates :key, :name, :campaign_type, presence: true
  validates :key, uniqueness: true
  validates :campaign_type, inclusion: { in: CAMPAIGN_TYPES }

  def self.resolve_default(key)
    normalized_key = key.to_s.strip.downcase
    attributes = DEFAULTS[normalized_key]
    return unless attributes

    create_or_find_by!(key: normalized_key) do |campaign|
      campaign.assign_attributes(attributes)
    end
  end

  def running_on?(date = Date.current)
    active? &&
      (starts_on.blank? || starts_on <= date) &&
      (ends_on.blank? || ends_on >= date)
  end
end
