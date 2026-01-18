class CreateClassifieds < ActiveRecord::Migration[7.1]
  def change
    create_table :classifieds do |t|
      t.string :slug
      t.integer :status
      t.datetime :posted_at
      t.datetime :expires_at
      t.string :submitter_email
      t.text :admin_notes
      t.references :classified_category, null: false, foreign_key: true
      t.references :classified_subcategory, null: false, foreign_key: true

      t.timestamps
    end
  end
end
