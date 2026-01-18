class MakeClassifiedSubcategoryOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :classifieds, :classified_subcategory_id, true
  end
end
