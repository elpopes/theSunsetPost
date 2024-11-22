require "open-uri"

# Clear existing data
puts "Clearing existing data..."
SectionTranslation.destroy_all
AuthorTranslation.destroy_all
SectionStory.destroy_all
AuthorStory.destroy_all
StoryTranslation.destroy_all
Story.destroy_all
Section.destroy_all
Author.destroy_all

# Seed sections with translations
puts "Seeding sections with translations..."
sections = [
  { 
    name: "Business", 
    description: "Stories about businesses and entrepreneurs in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Negocios", description: "Historias sobre negocios y emprendedores en Sunset Park, Brooklyn." },
      { language: "zh", name: "商业", description: "关于布鲁克林日落公园企业和企业家的故事。" }
    ]
  },
  { 
    name: "Food", 
    description: "The latest in food and dining in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Comida", description: "Lo último en comida y gastronomía en Sunset Park, Brooklyn." },
      { language: "zh", name: "美食", description: "关于布鲁克林日落公园美食和餐饮的最新资讯。" }
    ]
  },
  { 
    name: "People", 
    description: "Profiles and stories of residents in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Gente", description: "Perfiles e historias de residentes en Sunset Park, Brooklyn." },
      { language: "zh", name: "人物", description: "关于布鲁克林日落公园居民的故事和简介。" }
    ]
  },
  { 
    name: "Politics", 
    description: "Political news and stories in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Política", description: "Noticias y relatos políticos en Sunset Park, Brooklyn." },
      { language: "zh", name: "政治", description: "关于布鲁克林日落公园政治新闻和故事。" }
    ]
  },
  { 
    name: "Sports", 
    description: "Sports events and activities in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Deportes", description: "Eventos y actividades deportivas en Sunset Park, Brooklyn." },
      { language: "zh", name: "运动", description: "关于布鲁克林日落公园的运动赛事和活动。" }
    ]
  },
  { 
    name: "Environment", 
    description: "Stories on environmental issues in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Medio Ambiente", description: "Historias sobre problemas ambientales en Sunset Park, Brooklyn." },
      { language: "zh", name: "环境", description: "关于布鲁克林日落公园环境问题的故事。" }
    ]
  },
  { 
    name: "Transit", 
    description: "Transit news and updates in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Transporte", description: "Noticias y actualizaciones de transporte en Sunset Park, Brooklyn." },
      { language: "zh", name: "交通", description: "关于布鲁克林日落公园的交通新闻和更新。" }
    ]
  },
  { 
    name: "Culture", 
    description: "Cultural stories and events in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Cultura", description: "Historias y eventos culturales en Sunset Park, Brooklyn." },
      { language: "zh", name: "文化", description: "关于布鲁克林日落公园文化的故事和活动。" }
    ]
  },
  { 
    name: "Crime", 
    description: "Crime news and reports in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Crimen", description: "Noticias e informes de crímenes en Sunset Park, Brooklyn." },
      { language: "zh", name: "犯罪", description: "关于布鲁克林日落公园犯罪新闻和报道。" }
    ]
  },
  { 
    name: "Opinion", 
    description: "Opinions and editorials about Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Opinión", description: "Opiniones y editoriales sobre Sunset Park, Brooklyn." },
      { language: "zh", name: "观点", description: "关于布鲁克林日落公园的意见和社论。" }
    ]
  },
  { 
    name: "Classifieds", 
    description: "Classified ads for the Sunset Park, Brooklyn community.", 
    translations: [
      { language: "es", name: "Clasificados", description: "Anuncios clasificados para la comunidad de Sunset Park, Brooklyn." },
      { language: "zh", name: "分类广告", description: "关于布鲁克林日落公园社区的分类广告。" }
    ]
  },
  { 
    name: "Events", 
    description: "Upcoming events in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Eventos", description: "Próximos eventos en Sunset Park, Brooklyn." },
      { language: "zh", name: "活动", description: "关于布鲁克林日落公园的即将举行的活动。" }
    ]
  },
  { 
    name: "Education", 
    description: "Education news and stories in Sunset Park, Brooklyn.", 
    translations: [
      { language: "es", name: "Educación", description: "Noticias e historias educativas en Sunset Park, Brooklyn." },
      { language: "zh", name: "教育", description: "关于布鲁克林日落公园的教育新闻和故事。" }
    ]
  }
]

sections.each do |section_data|
  section = Section.find_or_create_by(name: section_data[:name], description: section_data[:description])
  section_data[:translations].each do |translation|
    section.section_translations.find_or_create_by(language: translation[:language], name: translation[:name], description: translation[:description])
  end
end
puts "Seeded #{sections.size} sections with translations."

# Seed authors with translations
puts "Seeding authors with translations..."
authors = [
  { 
    name: "Jane Doe", 
    bio: "Award-winning journalist covering politics.", 
    translations: [
      { language: "es", bio: "Periodista galardonada que cubre política." },
      { language: "zh", bio: "获奖记者，报道政治。" }
    ],
    image: "jane_doe.jpg"
  },
  { 
    name: "John Smith", 
    bio: "Food enthusiast and critic.", 
    translations: [
      { language: "es", bio: "Entusiasta de la comida y crítico gastronómico." },
      { language: "zh", bio: "美食爱好者和评论家。" }
    ],
    image: "john_smith.jpg"
  },
  { 
    name: "Emily Zhang", 
    bio: "Environmental reporter and advocate.", 
    translations: [
      { language: "es", bio: "Reportera ambiental y defensora." },
      { language: "zh", bio: "环境记者和倡导者。" }
    ],
    image: "emily_zhang.jpg"
  }
]

authors.each do |author_data|
  author = Author.find_or_create_by(name: author_data[:name], bio: author_data[:bio])
  author_data[:translations].each do |translation|
    author.author_translations.find_or_create_by(language: translation[:language], bio: translation[:bio])
  end
  # Attach author image
  if author_data[:image].present?
    image_path = Rails.root.join("db/seeds/images/#{author_data[:image]}")
    author.image.attach(io: File.open(image_path), filename: author_data[:image], content_type: "image/jpeg")
  end
end
puts "Seeded #{authors.size} authors with translations and images."

# Seed stories with images
puts "Seeding stories with images..."
stories = [
  {
    title: "Local Businesses Thrive on 5th Avenue",
    content: "Small businesses along 5th Avenue in Sunset Park are seeing a surge in sales, with residents showing strong support for local shops.",
    language: "en",
    translations: [
      { language: "es", title: "Negocios locales prosperan en la Quinta Avenida", content: "Los pequeños negocios a lo largo de la Quinta Avenida en Sunset Park están viendo un aumento en las ventas, con los residentes apoyando fuertemente a los comercios locales." },
      { language: "zh", title: "第五大道本地商家蓬勃发展", content: "日落公园第五大道的小企业销量激增，居民们大力支持当地商店。" }
    ],
    image: "market_high.jpg",
    sections: ["Business"],
    authors: ["Jane Doe", "Emily Zhang"]
  },
  {
    title: "Sunset Park’s Food Scene Booms in 2024",
    content: "New restaurants and bakeries are opening in Sunset Park, bringing exciting culinary trends to the neighborhood.",
    language: "en",
    translations: [
      { language: "es", title: "El auge culinario de Sunset Park en 2024", content: "Nuevos restaurantes y panaderías están abriendo en Sunset Park, trayendo emocionantes tendencias culinarias al vecindario." },
      { language: "zh", title: "2024年日落公园的美食蓬勃发展", content: "日落公园开设了新的餐馆和面包店，为社区带来了激动人心的烹饪趋势。" }
    ],
    image: "culinary_trends.jpg",
    sections: ["Food"],
    authors: ["John Smith"]
  },
  {
    title: "Rising Sea Levels Threaten Sunset Park Waterfront",
    content: "Environmental experts warn that Sunset Park’s waterfront is at risk due to rising sea levels and a lack of climate resilience infrastructure.",
    language: "en",
    translations: [
      { language: "es", title: "El aumento del nivel del mar amenaza el paseo marítimo de Sunset Park", content: "Expertos ambientales advierten que el paseo marítimo de Sunset Park está en riesgo debido al aumento del nivel del mar y la falta de infraestructura resiliente al clima." },
      { language: "zh", title: "海平面上升威胁日落公园滨水区", content: "环境专家警告，由于海平面上升和缺乏气候韧性基础设施，日落公园的滨水区面临风险。" }
    ],
    image: "climate_crisis.jpg",
    sections: ["Environment"],
    authors: ["Emily Zhang"]
  }
]


stories.each do |story_data|
  story = Story.create!(
    title: story_data[:title],
    content: story_data[:content],
    language: story_data[:language]
  )
  # Add translations
  story_data[:translations].each do |translation|
    story.story_translations.create!(translation)
  end
  # Attach story image
  if story_data[:image].present?
    image_path = Rails.root.join("db/seeds/images/#{story_data[:image]}")
    story.image.attach(io: File.open(image_path), filename: story_data[:image], content_type: "image/jpeg")
  end
  # Assign sections
  story.sections = Section.where(name: story_data[:sections])
  # Assign authors
  story.authors = Author.where(name: story_data[:authors])
end
puts "Seeded #{stories.size} stories with translations, sections, authors, and images."

puts "Seeding complete."
