class AddConstraintsToClassifiedsSlug < ActiveRecord::Migration[7.1]
  def change
    change_column_null :classifieds, :slug, false
    add_index :classifieds, :slug, unique: true
  end
end

