class HardenClassifiedCategoryConstraints < ActiveRecord::Migration[7.1]
  def change
    # Categories
    change_column_null :classified_categories, :slug, false
    change_column_null :classified_categories, :active, false
    change_column_null :classified_categories, :position, false

    # Subcategories
    change_column_null :classified_subcategories, :slug, false
    change_column_null :classified_subcategories, :active, false
    change_column_null :classified_subcategories, :position, false
  end
end
