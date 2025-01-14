class MoveEnglishFieldsToTranslations < ActiveRecord::Migration[7.1]
    def up
      # 1) Migrate existing data
      Story.find_each do |story|
        # Skip if there's no top-level content
        next if story.title.blank? && story.content.blank?
  
        # Check if this story already has an 'en' translation
        existing_en = story.story_translations.find_by(language: 'en')
  
        # Only create a new English translation if none exists
        unless existing_en
          story.story_translations.create!(
            language: 'en',
            title: story.title.presence || "Untitled",
            content: story.content.presence || "",
            meta_description: "", # or a default/fallback
            caption: ""           # or a default/fallback
          )
        end
      end
  
      # 2) Now remove the old columns from the stories table
      remove_column :stories, :title, :string
      remove_column :stories, :content, :text
      remove_column :stories, :language, :string
    end
  
    def down
      # In case of rollback, we re-add the columns
      add_column :stories, :title, :string
      add_column :stories, :content, :text
      add_column :stories, :language, :string, default: "en"
  
      # NOTE: We won't automatically move data back into top-level fields,
      # because that can be tricky. But at least the columns come back.
    end
end
  