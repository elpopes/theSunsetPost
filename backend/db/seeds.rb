# db/seeds.rb
require "open-uri"

# Clear existing data
# puts "Clearing existing data..."
# SectionTranslation.destroy_all
# SectionStory.destroy_all
# StoryTranslation.destroy_all
# Story.destroy_all
# Section.destroy_all
# User.destroy_all

# puts "Seeding sections with translations..."
# sections = [
#   { 
#     name: "Business", 
#     description: "Stories about businesses and entrepreneurs in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Negocios", description: "Historias sobre negocios y emprendedores en Sunset Park, Brooklyn." },
#       { language: "zh", name: "商业", description: "关于布鲁克林日落公园企业和企业家的故事。" }
#     ]
#   },
#   { 
#     name: "Food", 
#     description: "The latest in food and dining in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Comida", description: "Lo último en comida y gastronomía en Sunset Park, Brooklyn." },
#       { language: "zh", name: "美食", description: "关于布鲁克林日落公园美食和餐饮的最新资讯。" }
#     ]
#   },
#   { 
#     name: "People", 
#     description: "Profiles and stories of residents in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Gente", description: "Perfiles e historias de residentes en Sunset Park, Brooklyn." },
#       { language: "zh", name: "人物", description: "关于布鲁克林日落公园居民的故事和简介。" }
#     ]
#   },
#   { 
#     name: "Politics", 
#     description: "Political news and stories in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Política", description: "Noticias y relatos políticos en Sunset Park, Brooklyn." },
#       { language: "zh", name: "政治", description: "关于布鲁克林日落公园政治新闻和故事。" }
#     ]
#   },
#   { 
#     name: "Sports", 
#     description: "Sports events and activities in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Deportes", description: "Eventos y actividades deportivas en Sunset Park, Brooklyn." },
#       { language: "zh", name: "运动", description: "关于布鲁克林日落公园的运动赛事和活动。" }
#     ]
#   },
#   { 
#     name: "Environment", 
#     description: "Stories on environmental issues in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Medio Ambiente", description: "Historias sobre problemas ambientales en Sunset Park, Brooklyn." },
#       { language: "zh", name: "环境", description: "关于布鲁克林日落公园环境问题的故事。" }
#     ]
#   },
#   { 
#     name: "Transit", 
#     description: "Transit news and updates in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Transporte", description: "Noticias y actualizaciones de transporte en Sunset Park, Brooklyn." },
#       { language: "zh", name: "交通", description: "关于布鲁克林日落公园的交通新闻和更新。" }
#     ]
#   },
#   { 
#     name: "Culture", 
#     description: "Cultural stories and events in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Cultura", description: "Historias y eventos culturales en Sunset Park, Brooklyn." },
#       { language: "zh", name: "文化", description: "关于布鲁克林日落公园文化的故事和活动。" }
#     ]
#   },
#   { 
#     name: "Crime", 
#     description: "Crime news and reports in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Crimen", description: "Noticias e informes de crímenes en Sunset Park, Brooklyn." },
#       { language: "zh", name: "犯罪", description: "关于布鲁克林日落公园犯罪新闻和报道。" }
#     ]
#   },
#   { 
#     name: "Opinion", 
#     description: "Opinions and editorials about Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Opinión", description: "Opiniones y editoriales sobre Sunset Park, Brooklyn." },
#       { language: "zh", name: "观点", description: "关于布鲁克林日落公园的意见和社论。" }
#     ]
#   },
#   { 
#     name: "Classifieds", 
#     description: "Classified ads for the Sunset Park, Brooklyn community.", 
#     translations: [
#       { language: "es", name: "Clasificados", description: "Anuncios clasificados para la comunidad de Sunset Park, Brooklyn." },
#       { language: "zh", name: "分类广告", description: "关于布鲁克林日落公园社区的分类广告。" }
#     ]
#   },
#   { 
#     name: "Events", 
#     description: "Upcoming events in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Eventos", description: "Próximos eventos en Sunset Park, Brooklyn." },
#       { language: "zh", name: "活动", description: "关于布鲁克林日落公园的即将举行的活动。" }
#     ]
#   },
#   { 
#     name: "Education", 
#     description: "Education news and stories in Sunset Park, Brooklyn.", 
#     translations: [
#       { language: "es", name: "Educación", description: "Noticias e historias educativas en Sunset Park, Brooklyn." },
#       { language: "zh", name: "教育", description: "关于布鲁克林日落公园的教育新闻和故事。" }
#     ]
#   }
# ]

# sections.each do |section_data|
#   # Create or find the base Section
#   section = Section.find_or_create_by(
#     name: section_data[:name],
#     description: section_data[:description]
#   )

#   # Create translations for each language
#   section_data[:translations].each do |t|
#     section.section_translations.find_or_create_by(
#       language: t[:language],
#       name: t[:name],
#       description: t[:description]
#     )
#   end
# end

# puts "Seeded #{sections.size} sections with translations."
