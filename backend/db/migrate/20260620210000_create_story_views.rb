class CreateStoryViews < ActiveRecord::Migration[7.1]
  def change
    create_table :story_views do |t|
      t.references :story, null: false, foreign_key: true

      t.string :visitor_token, null: false
      t.string :language, null: false
      t.string :path, null: false
      t.text :query_string
      t.text :referrer
      t.text :user_agent

      t.string :utm_source
      t.string :utm_medium
      t.string :utm_campaign
      t.string :utm_content
      t.string :source_type, null: false, default: "unknown"

      t.string :ip_hash
      t.integer :engaged_seconds, null: false, default: 0
      t.integer :max_scroll_percent, null: false, default: 0
      t.datetime :viewed_at, null: false

      t.timestamps
    end

    add_index :story_views, [:story_id, :viewed_at]
    add_index :story_views, [:language, :viewed_at]
    add_index :story_views,
              [:visitor_token, :story_id, :viewed_at],
              name: "index_story_views_on_visitor_story_and_viewed_at"
    add_index :story_views, [:utm_campaign, :viewed_at]
    add_index :story_views, [:source_type, :viewed_at]
    add_index :story_views, [:ip_hash, :viewed_at]
  end
end
