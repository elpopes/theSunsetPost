json.extract! @story, :id, :title, :content, :language
json.image_url @story.image.attached? ? url_for(@story.image) : nil
