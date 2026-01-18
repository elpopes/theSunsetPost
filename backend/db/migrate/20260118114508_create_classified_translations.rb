class CreateClassifiedTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :classified_translations do |t|
      t.references :classified, null: false, foreign_key: true
      t.string :language
      t.string :title
      t.text :body

      t.timestamps
    end
  end
end
