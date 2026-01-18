class CreateClassifiedSubcategories < ActiveRecord::Migration[7.1]
  def change
    create_table :classified_subcategories do |t|
      t.references :classified_category, null: false, foreign_key: true
      t.string :slug
      t.integer :position
      t.boolean :active

      t.timestamps
    end
  end
end
