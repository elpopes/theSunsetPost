class CreateAuthorTranslations < ActiveRecord::Migration[7.1]
    def change
      create_table :author_translations do |t|
        t.references :author, null: false, foreign_key: true
        t.text :bio
        t.string :language, null: false
  
        t.timestamps
      end
    end
end
  