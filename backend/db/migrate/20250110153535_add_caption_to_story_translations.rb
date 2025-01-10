class AddCaptionToStoryTranslations < ActiveRecord::Migration[7.1]
  def change
    add_column :story_translations, :caption, :text
  end
end
