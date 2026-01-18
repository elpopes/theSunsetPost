class CreateClassifiedCategories < ActiveRecord::Migration[7.1]
  def change
    create_table :classified_categories do |t|
      t.string :slug
      t.integer :position
      t.boolean :active

      t.timestamps
    end
  end
end
