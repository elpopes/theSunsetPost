class ArchiveBirthdayCampaign < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
      UPDATE ad_campaigns
      SET active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'birthday'
    SQL
  end

  def down
    execute <<~SQL
      UPDATE ad_campaigns
      SET active = TRUE, updated_at = CURRENT_TIMESTAMP
      WHERE key = 'birthday'
    SQL
  end
end
