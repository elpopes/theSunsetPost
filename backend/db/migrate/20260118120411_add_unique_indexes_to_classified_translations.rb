class AddUniqueIndexesToClassifiedTranslations < ActiveRecord::Migration[7.1]
  def change
    add_index :classified_translations, [:classified_id, :language], unique: true
    add_index :classified_category_translations, [:classified_category_id, :language], unique: true
    add_index :classified_subcategory_translations, [:classified_subcategory_id, :language], unique: true
  end
end
