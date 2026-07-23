class CreateAdminAnalytics < ActiveRecord::Migration[7.1]
  def change
    create_table :ad_campaigns do |t|
      t.string :key, null: false
      t.string :name, null: false
      t.string :advertiser
      t.string :campaign_type, null: false, default: "paid"
      t.text :destination_url
      t.date :starts_on
      t.date :ends_on
      t.boolean :active, null: false, default: true

      t.timestamps
    end

    add_index :ad_campaigns, :key, unique: true
    add_index :ad_campaigns, [:campaign_type, :active]

    create_table :ad_events do |t|
      t.references :ad_campaign, null: false, foreign_key: true
      t.string :event_type, null: false
      t.string :slot, null: false
      t.string :language, null: false
      t.string :device_type, null: false, default: "unknown"
      t.text :path, null: false
      t.text :destination_url
      t.string :visitor_token
      t.text :user_agent
      t.datetime :event_at, null: false

      t.timestamps
    end

    add_index :ad_events, [:ad_campaign_id, :event_at]
    add_index :ad_events, [:event_type, :event_at]
    add_index :ad_events, [:language, :event_at]
    add_index :ad_events, [:device_type, :event_at]

    create_table :print_issues do |t|
      t.string :code, null: false
      t.string :name, null: false
      t.date :publication_date
      t.integer :copies_printed

      t.timestamps
    end

    add_index :print_issues, :code, unique: true
    add_index :print_issues, :publication_date

    create_table :print_story_placements do |t|
      t.references :print_issue, null: false, foreign_key: true
      t.references :story, null: false, foreign_key: true
      t.integer :page_number
      t.string :position_label
      t.string :print_language, null: false
      t.string :target_language, null: false
      t.string :utm_content

      t.timestamps
    end

    add_index :print_story_placements,
              [:print_issue_id, :story_id, :print_language, :target_language],
              unique: true,
              name: "index_print_placements_on_issue_story_and_languages"
    add_index :print_story_placements, [:print_issue_id, :page_number]
    add_index :print_story_placements, :utm_content
  end
end
