class SitemapsController < ApplicationController
  SITE_URL = "https://www.sunsetpost.org".freeze
  LANGUAGES = %w[en es zh].freeze

  def index
    urls = []

    LANGUAGES.each do |language|
      add_url(urls, "/#{language}")
      add_url(urls, "/#{language}/about")
      add_url(urls, "/#{language}/contact")
    end

    Story.includes(:story_translations).find_each do |story|
      next if story.slug.blank?

      available_languages = story.story_translations.map(&:language) & LANGUAGES
      available_languages.each do |language|
        add_url(urls, "/#{language}/stories/#{story.slug}", story.updated_at)
      end
    end

    Author.find_each do |author|
      next if author.slug.blank?

      LANGUAGES.each do |language|
        add_url(urls, "/#{language}/authors/#{author.slug}", author.updated_at)
      end
    end

    Section.find_each do |section|
      next if section.name.to_s.casecmp("classifieds").zero?

      route_name = ERB::Util.url_encode(section.name.to_s.downcase)
      LANGUAGES.each do |language|
        add_url(urls, "/#{language}/sections/#{route_name}", section.updated_at)
      end
    end

    xml = [
      %(<?xml version="1.0" encoding="UTF-8"?>),
      %(<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">),
      urls.join("\n"),
      %(</urlset>),
    ].join("\n")

    render xml: xml
  end

  private

  def add_url(urls, path, updated_at = nil)
    loc = ERB::Util.html_escape("#{SITE_URL}#{path}")
    lines = ["  <url>", "    <loc>#{loc}</loc>"]
    lines << "    <lastmod>#{updated_at.utc.iso8601}</lastmod>" if updated_at
    lines << "  </url>"
    urls << lines.join("\n")
  end
end
