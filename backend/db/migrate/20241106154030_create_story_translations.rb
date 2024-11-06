class CreateStoryTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :story_translations do |t|
      t.references :story, null: false, foreign_key: true
      t.string :title
      t.text :content
      t.string :language

      t.timestamps
    end
  end
end
