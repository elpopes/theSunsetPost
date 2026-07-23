require "test_helper"

class AdCampaignTest < ActiveSupport::TestCase
  test "resolves known frontend campaign keys" do
    campaign = AdCampaign.resolve_default("beyondcare")

    assert_equal "Beyond Care", campaign.name
    assert_equal "paid", campaign.campaign_type
    assert_equal "beyondcare", campaign.key
  end

  test "rejects unknown public campaign keys" do
    assert_nil AdCampaign.resolve_default("made-up-campaign")
    assert_equal 0, AdCampaign.where(key: "made-up-campaign").count
  end
end
