class AddMetaDescriptionToStoryTranslations < ActiveRecord::Migration[7.1]
  def change
    add_column :story_translations, :meta_description, :text
  end
end
