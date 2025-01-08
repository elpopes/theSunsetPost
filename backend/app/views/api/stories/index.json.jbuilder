json.array! @stories do |story|
    json.extract! story, :id
    json.image_url story.image.attached? ? url_for(story.image) : nil
  
    # Include translations with meta_description
    json.translations story.story_translations.map { |translation|
      {
        id: translation.id,
        title: translation.title,
        content: translation.content,
        meta_description: translation.meta_description,
        language: translation.language
      }
    }
  
    # Include authors
    json.authors story.authors.map { |author|
      {
        id: author.id,
        name: author.name,
        bio: author.bio,
        image_url: author.image.attached? ? url_for(author.image) : nil
      }
    }
  
    # Include sections
    json.sections story.sections.map { |section|
      {
        id: section.id,
        name: section.name,
        description: section.description
      }
    }
end
  