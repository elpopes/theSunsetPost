require "test_helper"

class AdCampaignTest < ActiveSupport::TestCase
  test "resolves known frontend campaign keys" do
    campaign = AdCampaign.resolve_default("beyondcare")

    assert_equal "Beyond Care", campaign.name
    assert_equal "paid", campaign.campaign_type
    assert_equal "beyondcare", campaign.key
  end

  test "returns an existing campaign instead of creating a duplicate" do
    existing = AdCampaign.create!(
      key: "beyondcare",
      name: "Beyond Care",
      advertiser: "Beyond Care Childcare Cooperative",
      campaign_type: "paid",
      destination_url: "https://beyondcare.coop/"
    )

    resolved = AdCampaign.resolve_default("beyondcare")

    assert_equal existing.id, resolved.id
    assert_equal 1, AdCampaign.where(key: "beyondcare").count
  end

  test "rejects unknown public campaign keys" do
    assert_nil AdCampaign.resolve_default("made-up-campaign")
    assert_equal 0, AdCampaign.where(key: "made-up-campaign").count
  end
end
