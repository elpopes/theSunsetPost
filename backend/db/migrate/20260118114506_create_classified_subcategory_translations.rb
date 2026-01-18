class CreateClassifiedSubcategoryTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :classified_subcategory_translations do |t|
      t.references :classified_subcategory, null: false, foreign_key: true
      t.string :language
      t.string :name

      t.timestamps
    end
  end
end
