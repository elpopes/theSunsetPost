xml.instruct! :xml, version: "1.0", encoding: "UTF-8"

site_name = "Sunset Post"
site_url  = FeedsController::SITE_URL
feed_path = (@lang == "en") ? "/rss.xml" : "/#{@lang}/rss.xml"
feed_url  = "#{site_url}#{feed_path}"

xml.rss(
  "version" => "2.0",
  "xmlns:atom" => "http://www.w3.org/2005/Atom",
  "xmlns:content" => "http://purl.org/rss/1.0/modules/content/",
  "xmlns:dc" => "http://purl.org/dc/elements/1.1/"
) do
  xml.channel do
    xml.title "#{site_name} (#{@lang})"
    xml.link site_url
    xml.description "Latest stories from the Sunset Post (#{@lang})."
    xml.language(@lang == "zh" ? "zh-CN" : @lang)

    xml.atom :link, rel: "self", type: "application/rss+xml", href: feed_url

    last_build = @stories.first&.updated_at || Time.current
    xml.lastBuildDate last_build.rfc2822

    @stories.each do |story|
      tr =
        story.story_translations.find { |t| t.language == @lang } ||
        story.story_translations.find { |t| t.language == "en" } ||
        story.story_translations.first
      next unless tr

      story_path =
        if @lang == "en"
          "/stories/#{story.slug || story.id}"
        else
          "/#{@lang}/stories/#{story.slug || story.id}"
        end

      item_url = "#{site_url}#{story_path}"

      pub_time = story.created_at || Time.current
      mod_time = story.updated_at || pub_time

      image_url = nil
      if story.image.attached?
        image_url = rails_blob_url(story.image, host: site_url)
      end

      author_names = story.authors.map { |a| a.respond_to?(:name) ? a.name : nil }.compact
      section_name = story.sections.first&.name

      excerpt = tr.meta_description.presence
      if excerpt.blank?
        plain = ActionController::Base.helpers.strip_tags(tr.content.to_s)
        excerpt = plain.gsub(/\s+/, " ").strip[0, 240]
      end

      xml.item do
        xml.title tr.title.to_s
        xml.link item_url
        xml.guid item_url, isPermaLink: "true"
        xml.pubDate pub_time.rfc2822

        xml.tag!("atom:updated", mod_time.iso8601)

        if author_names.any?
          xml.tag!("dc:creator") { xml.cdata!(author_names.join(", ")) }
        end

        xml.category section_name if section_name.present?

        xml.description { xml.cdata!(excerpt.to_s) }

        xml.tag!("content:encoded") do
          if image_url.present?
            html = +"<p><img src=\"#{ERB::Util.html_escape(image_url)}\" alt=\"\" /></p>\n"
            html << tr.content.to_s
            xml.cdata!(html)
          else
            xml.cdata!(tr.content.to_s)
          end
        end

        if image_url.present?
            xml.enclosure url: image_url, type: story.image.blob.content_type
        end

      end
    end
  end
end
