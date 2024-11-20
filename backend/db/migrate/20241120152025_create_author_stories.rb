class CreateAuthorStories < ActiveRecord::Migration[7.1]
  def change
    create_table :author_stories do |t|
      t.references :story, null: false, foreign_key: true
      t.references :author, null: false, foreign_key: true

      t.timestamps
    end
  end
end
