class CreateSectionTranslations < ActiveRecord::Migration[7.1]
    def change
      create_table :section_translations do |t|
        t.references :section, null: false, foreign_key: true
        t.string :name, null: false
        t.text :description
        t.string :language, null: false
  
        t.timestamps
      end
    end
end
  