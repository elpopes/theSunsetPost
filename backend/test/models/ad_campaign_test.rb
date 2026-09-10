require "test_helper"

class AdCampaignTest < ActiveSupport::TestCase
  test "resolves known frontend campaign keys" do
    campaign = AdCampaign.resolve_default("beyondcare")

    assert_equal "Beyond Care", campaign.name
    assert_equal "paid", campaign.campaign_type
    assert_equal "beyondcare", campaign.key
  end

  test "resolves YMCA tracking key" do
    campaign = AdCampaign.resolve_default("ymca")

    assert_equal "YMCA", campaign.name
    assert_equal "YMCA of Greater New York", campaign.advertiser
    assert_equal "paid", campaign.campaign_type
    assert_equal "ymca", campaign.key
  end

  test "resolves Young Dancers tracking key" do
    campaign = AdCampaign.resolve_default("youngdancers")

    assert_equal "Young Dancers in Repertory", campaign.name
    assert_equal "Young Dancers in Repertory", campaign.advertiser
    assert_equal "paid", campaign.campaign_type
    assert_equal "youngdancers", campaign.key
    assert_equal "https://youngdancersinrep.org/center-for-dance-studies-2/", campaign.destination_url
  end

  test "resolves birthday tracking key" do
    campaign = AdCampaign.resolve_default("birthday")

    assert_equal "Sunset Post 1st Birthday", campaign.name
    assert_equal "The Sunset Post", campaign.advertiser
    assert_equal "house", campaign.campaign_type
    assert_equal "birthday", campaign.key
    assert_equal "https://givebutter.com/sunsetpost", campaign.destination_url
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
