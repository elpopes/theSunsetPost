require "uri"

class StoryViewAttribution
  MAX_QUERY_LENGTH = 4_096
  MAX_REFERRER_LENGTH = 2_048

  SEARCH_HOSTS = %w[
    bing.com
    duckduckgo.com
    google.com
    search.yahoo.com
  ].freeze

  SOCIAL_HOSTS = %w[
    bsky.app
    facebook.com
    instagram.com
    linkedin.com
    reddit.com
    t.co
    threads.net
    whatsapp.com
    x.com
  ].freeze

  SOCIAL_SOURCES = %w[
    bluesky
    facebook
    instagram
    linkedin
    reddit
    threads
    whatsapp
    x
  ].freeze

  def initialize(query_string:, referrer:)
    @query_string = truncate(query_string, MAX_QUERY_LENGTH)
    @referrer = truncate(referrer, MAX_REFERRER_LENGTH)
  end

  def attributes
    {
      query_string: query_string.presence,
      referrer: referrer.presence,
      utm_source: utm_source.presence,
      utm_medium: utm_medium.presence,
      utm_campaign: utm_value("utm_campaign").presence,
      utm_content: utm_value("utm_content").presence,
      source_type: source_type
    }
  end

  private

  attr_reader :query_string, :referrer

  def parsed_query
    @parsed_query ||= Rack::Utils.parse_nested_query(query_string.delete_prefix("?"))
  rescue Rack::QueryParser::InvalidParameterError
    {}
  end

  def utm_source
    @utm_source ||= utm_value("utm_source").downcase
  end

  def utm_medium
    @utm_medium ||= utm_value("utm_medium").downcase
  end

  def utm_value(key)
    truncate(parsed_query[key], 255)
  end

  def source_type
    return "print_qr" if utm_source == "print" && utm_medium == "qr"
    return "newsletter" if %w[email newsletter].include?(utm_medium) || utm_source == "newsletter"
    return "search" if %w[organic search].include?(utm_medium)
    return "social" if utm_medium == "social" || SOCIAL_SOURCES.include?(utm_source)
    return "direct" if referrer.blank?
    return "internal" if internal_referrer?
    return "search" if host_matches?(SEARCH_HOSTS)
    return "social" if host_matches?(SOCIAL_HOSTS)

    "referral"
  end

  def referrer_host
    @referrer_host ||= URI.parse(referrer).host.to_s.downcase
  rescue URI::InvalidURIError
    ""
  end

  def internal_referrer?
    referrer_host == "sunsetpost.org" || referrer_host.end_with?(".sunsetpost.org")
  end

  def host_matches?(hosts)
    hosts.any? do |host|
      referrer_host == host || referrer_host.end_with?(".#{host}")
    end
  end

  def truncate(value, length)
    value.to_s.strip.first(length)
  end
end
