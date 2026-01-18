class CreateClassifiedCategoryTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :classified_category_translations do |t|
      t.references :classified_category, null: false, foreign_key: true
      t.string :language
      t.string :name

      t.timestamps
    end
  end
end
