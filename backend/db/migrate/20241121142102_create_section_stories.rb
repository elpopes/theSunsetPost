class CreateSectionStories < ActiveRecord::Migration[7.1]
  def change
    create_table :section_stories do |t|
      t.references :story, null: false, foreign_key: true
      t.references :section, null: false, foreign_key: true

      t.timestamps
    end
  end
end
