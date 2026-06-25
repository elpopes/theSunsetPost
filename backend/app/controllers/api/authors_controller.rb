class Api::AuthorsController < ApplicationController
  before_action :require_admin!, only: [:create, :update, :destroy]

  def index
    authors = Author
              .left_joins(:author_stories)
              .select("authors.*, COUNT(author_stories.id) AS stories_count")
              .group("authors.id")
              .order(Arel.sql("COUNT(author_stories.id) DESC, authors.name ASC"))

    render json: authors.map { |author| author_card_json(author) }
  end

  def show
    author = Author
             .includes(:author_translations, image_attachment: :blob, stories: [:story_translations, :sections, image_attachment: :blob])
             .find_by_identifier(params[:id])

    if author
      render json: author_json(author)
    else
      render json: { error: "Author not found" }, status: :not_found
    end
  end

  def create
    author = Author.new(name: params[:name])
    author.slug = params[:slug] if params[:slug].present?

    if params[:translations].present?
      translations = parse_translations
      return unless translations

      translations.each do |translation|
        author.author_translations.build(translation_attributes(translation))
      end
    elsif params[:bio].present?
      author.author_translations.build(language: "en", bio: params[:bio])
    end

    author.image.attach(params[:image]) if params[:image].present?

    if author.save
      render json: author_json(author), status: :created
    else
      render json: { errors: author.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    author = Author.find_by_identifier(params[:id])
    return render json: { error: "Author not found" }, status: :not_found unless author

    author.name = params[:name] if params.key?(:name)
    author.slug = params[:slug].to_s.strip.presence if params.key?(:slug)

    if params[:translations].present?
      translations = parse_translations
      return unless translations

      author.author_translations.destroy_all
      translations.each do |translation|
        author.author_translations.build(translation_attributes(translation))
      end
    end

    if params[:image].present?
      author.image.attach(params[:image])
    elsif params[:remove_image].to_s == "true" && author.image.attached?
      author.image.purge
    end

    if author.save
      render json: author_json(author.reload), status: :ok
    else
      render json: { errors: author.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    author = Author.includes(:stories).find_by_identifier(params[:id])
    return render json: { error: "Author not found" }, status: :not_found unless author

    replacement_author = replacement_author_for(author)
    return if performed?

    ActiveRecord::Base.transaction do
      if author.stories.exists?
        author.stories.find_each do |story|
          story.authors << replacement_author unless story.authors.exists?(replacement_author.id)
        end
      end

      author.destroy!
    end

    render json: { message: "Author deleted successfully" }, status: :ok
  end

  private

  def replacement_author_for(author)
    return nil unless author.stories.exists?

    replacement_author = Author.find_by(id: params[:replacement_author_id]) if params[:replacement_author_id].present?

    unless replacement_author
      render json: {
        error: "Replacement author required",
        story_count: author.stories.count,
        requires_replacement: true
      }, status: :unprocessable_entity
      return nil
    end

    if replacement_author.id == author.id
      render json: { error: "Replacement author cannot be the author being deleted" }, status: :unprocessable_entity
      return nil
    end

    replacement_author
  end

  def parse_translations
    JSON.parse(params[:translations])
  rescue JSON::ParserError
    render json: { error: "Invalid translations format" }, status: :unprocessable_entity
    nil
  end

  def translation_attributes(translation)
    {
      language: translation["language"],
      bio: translation["bio"]
    }
  end

  def stories_count_for(author)
    author.respond_to?(:stories_count) ? author.stories_count.to_i : author.stories.size
  end

  def author_card_json(author)
    {
      id: author.id,
      name: author.name,
      slug: author.slug,
      stories_count: stories_count_for(author),
      image_url: author.image.attached? ? url_for(author.image) : nil,
      translations: author.author_translations.map do |translation|
        {
          language: translation.language,
          bio: translation.bio
        }
      end
    }
  end

  def author_json(author)
    author_card_json(author).merge(
      bio: author.translated_bio(I18n.locale.to_s),
      stories: author.stories.order(created_at: :desc).map { |story| story_json(story) }
    )
  end

  def story_json(story)
    {
      id: story.id,
      slug: story.slug,
      created_at: story.created_at,
      image_url: story.image.attached? ? url_for(story.image) : nil,
      translations: story.story_translations.map do |translation|
        {
          language: translation.language,
          title: translation.title,
          content: translation.content,
          meta_description: translation.meta_description,
          caption: translation.caption
        }
      end,
      sections: story.sections.map do |section|
        {
          id: section.id,
          name: section.name,
          description: section.description
        }
      end
    }
  end
end
