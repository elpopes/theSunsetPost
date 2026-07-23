class AdminAnalyticsQuery
  ENGAGED_SECONDS = 30
  ENGAGED_SCROLL_PERCENT = 50
  DEFAULT_DAYS = 30
  MAX_RANGE_DAYS = 366
  MAX_STORY_ROWS = 500
  STORY_DATE_SQL =
    "DATE(story_views.viewed_at AT TIME ZONE 'UTC' " \
    "AT TIME ZONE 'America/New_York')".freeze
  AD_DATE_SQL =
    "DATE(ad_events.event_at AT TIME ZONE 'UTC' " \
    "AT TIME ZONE 'America/New_York')".freeze

  def initialize(params)
    @params = params
    @end_date = parse_date(params[:end_date], Date.current)
    @start_date = parse_date(params[:start_date], @end_date - (DEFAULT_DAYS - 1).days)
    @start_date, @end_date = @end_date, @start_date if @start_date > @end_date
    if (@end_date - @start_date).to_i >= MAX_RANGE_DAYS
      @start_date = @end_date - (MAX_RANGE_DAYS - 1).days
    end
    @range = day_range(@start_date, @end_date)
    @include_house = ActiveModel::Type::Boolean.new.cast(params[:include_house])
    @language = StoryView::LANGUAGES.include?(params[:language]) ? params[:language] : nil
    @source_type = StoryView::SOURCE_TYPES.include?(params[:source_type]) ? params[:source_type] : nil
  end

  def overview
    current_story_scope = story_scope
    current_ad_scope = ad_scope
    previous_story_scope = story_scope(previous_range)
    previous_ad_scope = ad_scope(previous_range)

    current_metrics = combined_metrics(current_story_scope, current_ad_scope)
    previous_metrics = combined_metrics(previous_story_scope, previous_ad_scope)

    {
      range: range_json,
      metrics: current_metrics,
      comparison: comparison(current_metrics, previous_metrics),
      story_trend: daily_story_series(current_story_scope),
      ad_trend: daily_ad_series(current_ad_scope),
      top_stories: story_rows(current_story_scope).first(5),
      top_campaigns: campaign_rows(current_ad_scope).first(5)
    }
  end

  def stories
    page = positive_integer(@params[:page], 1)
    per_page = positive_integer(@params[:per_page], 50).clamp(1, MAX_STORY_ROWS)
    rows = story_rows(filtered_story_scope)
    total = rows.size

    {
      range: range_json,
      stories: rows.slice((page - 1) * per_page, per_page) || [],
      pagination: {
        page: page,
        per_page: per_page,
        total: total,
        total_pages: [(total.to_f / per_page).ceil, 1].max
      },
      filters: {
        authors: Author.order(:name).pluck(:id, :name).map { |id, name| { id: id, name: name } },
        sections: Section.order(:name).pluck(:id, :name).map { |id, name| { id: id, name: name } },
        languages: StoryView::LANGUAGES,
        source_types: StoryView::SOURCE_TYPES
      }
    }
  end

  def story(id)
    record = Story.includes(:story_translations, :authors, :sections).find(id)
    scoped_views = story_scope.where(story_id: record.id)
    row = story_rows(scoped_views, records: { record.id => record }).first ||
          empty_story_row(record)
    engaged_values = scoped_views.pluck(:engaged_seconds).compact.map(&:to_f)
    scroll_values = scoped_views.pluck(:max_scroll_percent).compact.map(&:to_f)

    {
      range: range_json,
      story: row.merge(
        median_engaged_seconds: median(engaged_values),
        median_scroll_percent: median(scroll_values)
      ),
      daily: daily_story_series(scoped_views),
      by_language: grouped_count(scoped_views, :language),
      by_source: grouped_count(scoped_views, :source_type),
      scroll_distribution: scroll_distribution(scroll_values),
      print_links: print_link_rows(scoped_views)
    }
  end

  def story_options
    scope = Story.includes(:story_translations).order(created_at: :desc)
    query = @params[:q].to_s.strip

    if query.present?
      matching_ids = StoryTranslation.where("title ILIKE ?", "%#{sanitize_like(query)}%")
                                     .select(:story_id)
      scope = scope.where(id: matching_ids)
    end

    scope.limit(300).map do |story|
      {
        id: story.id,
        title: story_title(story),
        slug: story.slug,
        created_at: story.created_at
      }
    end
  end

  def ads
    rows = campaign_rows(ad_scope)
    campaign_id = positive_integer(@params[:campaign_id], nil)

    {
      range: range_json,
      include_house: @include_house,
      campaigns: rows,
      detail: campaign_id ? campaign_detail(campaign_id) : nil
    }
  end

  private

  def story_scope(time_range = @range)
    scope = StoryView.where(viewed_at: time_range)
    scope = scope.where(language: @language) if @language
    scope = scope.where(source_type: @source_type) if @source_type
    scope
  end

  def filtered_story_scope
    scope = story_scope
    query = @params[:q].to_s.strip

    if query.present?
      matching_ids = Story.left_joins(:story_translations)
                          .where(
                            "stories.slug ILIKE :query OR story_translations.title ILIKE :query",
                            query: "%#{sanitize_like(query)}%"
                          )
                          .select(:id)
      scope = scope.where(story_id: matching_ids)
    end

    if positive_integer(@params[:author_id], nil)
      scope = scope.where(
        story_id: AuthorStory.where(author_id: @params[:author_id]).select(:story_id)
      )
    end

    if positive_integer(@params[:section_id], nil)
      scope = scope.where(
        story_id: SectionStory.where(section_id: @params[:section_id]).select(:story_id)
      )
    end

    scope
  end

  def ad_scope(time_range = @range)
    scope = AdEvent.joins(:ad_campaign).where(event_at: time_range)
    scope = scope.where(language: @language) if @language
    scope = scope.where(ad_campaigns: { campaign_type: "paid" }) unless @include_house
    scope
  end

  def combined_metrics(stories, ads)
    story_metrics(stories).merge(ad_metrics(ads))
  end

  def story_metrics(scope)
    views = scope.count
    engaged_reads = engaged_scope(scope).count

    {
      story_views: views,
      approximate_readers: scope.where.not(visitor_token: nil)
                                .distinct
                                .count(:visitor_token),
      engaged_reads: engaged_reads,
      engagement_rate: percentage(engaged_reads, views),
      average_engaged_seconds: rounded_average(scope, :engaged_seconds),
      average_scroll_percent: rounded_average(scope, :max_scroll_percent)
    }
  end

  def ad_metrics(scope)
    impressions = scope.where(event_type: "view").count
    clicks = scope.where(event_type: "click").count

    {
      ad_impressions: impressions,
      ad_clicks: clicks,
      ad_ctr: percentage(clicks, impressions),
      active_campaigns: scope.distinct.count(:ad_campaign_id)
    }
  end

  def comparison(current, previous)
    current.keys.index_with do |key|
      {
        previous: previous[key],
        percent_change: percent_change(current[key], previous[key])
      }
    end
  end

  def story_rows(scope, records: nil)
    stats = scope.group(:story_id).pluck(
      :story_id,
      Arel.sql("COUNT(*)"),
      Arel.sql("COUNT(DISTINCT visitor_token)"),
      Arel.sql(
        "SUM(CASE WHEN engaged_seconds >= #{ENGAGED_SECONDS} " \
        "AND max_scroll_percent >= #{ENGAGED_SCROLL_PERCENT} THEN 1 ELSE 0 END)"
      ),
      Arel.sql("AVG(engaged_seconds)"),
      Arel.sql("AVG(max_scroll_percent)"),
      Arel.sql("SUM(CASE WHEN source_type = 'print_qr' THEN 1 ELSE 0 END)")
    )

    story_records = records || Story.includes(
      :story_translations,
      :authors,
      :sections
    ).where(id: stats.map(&:first)).index_by(&:id)

    rows = stats.filter_map do |values|
      story = story_records[values[0]]
      next unless story

      views = values[1].to_i
      engaged = values[3].to_i

      {
        id: story.id,
        title: story_title(story),
        slug: story.slug,
        published_at: story.created_at,
        authors: story.authors.map(&:name),
        sections: story.sections.map(&:name),
        views: views,
        readers: values[2].to_i,
        engaged_reads: engaged,
        engagement_rate: percentage(engaged, views),
        average_engaged_seconds: round_number(values[4]),
        average_scroll_percent: round_number(values[5]),
        qr_views: values[6].to_i
      }
    end

    sort_story_rows(rows)
  end

  def sort_story_rows(rows)
    sort_key = {
      "title" => :title,
      "published_at" => :published_at,
      "readers" => :readers,
      "engaged_reads" => :engaged_reads,
      "engagement_rate" => :engagement_rate,
      "average_engaged_seconds" => :average_engaged_seconds,
      "average_scroll_percent" => :average_scroll_percent,
      "qr_views" => :qr_views
    }.fetch(@params[:sort].to_s, :views)
    direction = @params[:direction].to_s == "asc" ? 1 : -1

    rows.sort_by do |row|
      value = row[sort_key]
      comparable = value.is_a?(String) ? value.downcase : value || 0
      [comparable, row[:id]]
    end.then { |sorted| direction == 1 ? sorted : sorted.reverse }
  end

  def empty_story_row(story)
    {
      id: story.id,
      title: story_title(story),
      slug: story.slug,
      published_at: story.created_at,
      authors: story.authors.map(&:name),
      sections: story.sections.map(&:name),
      views: 0,
      readers: 0,
      engaged_reads: 0,
      engagement_rate: 0.0,
      average_engaged_seconds: nil,
      average_scroll_percent: nil,
      qr_views: 0
    }
  end

  def campaign_rows(scope)
    stats = scope.group(:ad_campaign_id).pluck(
      :ad_campaign_id,
      Arel.sql("SUM(CASE WHEN event_type = 'view' THEN 1 ELSE 0 END)"),
      Arel.sql("SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END)"),
      Arel.sql(
        "COUNT(DISTINCT CASE WHEN event_type = 'view' THEN visitor_token END)"
      )
    )
    campaigns = AdCampaign.where(id: stats.map(&:first)).index_by(&:id)

    stats.filter_map do |campaign_id, impressions, clicks, reach|
      campaign = campaigns[campaign_id]
      next unless campaign

      impressions = impressions.to_i
      clicks = clicks.to_i

      {
        id: campaign.id,
        key: campaign.key,
        name: campaign.name,
        advertiser: campaign.advertiser,
        campaign_type: campaign.campaign_type,
        destination_url: campaign.destination_url,
        starts_on: campaign.starts_on,
        ends_on: campaign.ends_on,
        impressions: impressions,
        clicks: clicks,
        ctr: percentage(clicks, impressions),
        approximate_reach: reach.to_i
      }
    end.sort_by { |row| [-row[:impressions], -row[:clicks], row[:name]] }
  end

  def campaign_detail(campaign_id)
    campaign = AdCampaign.find(campaign_id)
    scope = ad_scope.where(ad_campaign_id: campaign.id)

    {
      campaign: campaign_rows(scope).first || {
        id: campaign.id,
        key: campaign.key,
        name: campaign.name,
        advertiser: campaign.advertiser,
        campaign_type: campaign.campaign_type,
        impressions: 0,
        clicks: 0,
        ctr: 0.0,
        approximate_reach: 0
      },
      daily: daily_ad_series(scope),
      by_language: ad_breakdown(scope, :language),
      by_slot: ad_breakdown(scope, :slot),
      by_device: ad_breakdown(scope, :device_type),
      top_paths: ad_breakdown(scope, :path).first(20)
    }
  end

  def daily_story_series(scope)
    counts = scope.group(Arel.sql(STORY_DATE_SQL)).count
    date_series.map { |date| { date: date, views: counts[date] || counts[date.to_s] || 0 } }
  end

  def daily_ad_series(scope)
    rows = scope.group(
      Arel.sql(AD_DATE_SQL),
      :event_type
    ).count

    date_series.map do |date|
      {
        date: date,
        impressions: rows[[date, "view"]] || rows[[date.to_s, "view"]] || 0,
        clicks: rows[[date, "click"]] || rows[[date.to_s, "click"]] || 0
      }
    end
  end

  def grouped_count(scope, column)
    scope.group(column).count.map do |value, count|
      { value: value.presence || "unknown", count: count }
    end.sort_by { |row| -row[:count] }
  end

  def ad_breakdown(scope, column)
    grouped = scope.group(column, :event_type).count
    values = grouped.keys.map(&:first).uniq

    values.map do |value|
      impressions = grouped[[value, "view"]].to_i
      clicks = grouped[[value, "click"]].to_i
      {
        value: value.presence || "unknown",
        impressions: impressions,
        clicks: clicks,
        ctr: percentage(clicks, impressions)
      }
    end.sort_by { |row| [-row[:impressions], -row[:clicks]] }
  end

  def print_link_rows(scope)
    scope.where(source_type: "print_qr")
         .group(:utm_campaign, :utm_content, :language)
         .pluck(
           :utm_campaign,
           :utm_content,
           :language,
           Arel.sql("COUNT(*)"),
           Arel.sql("COUNT(DISTINCT visitor_token)")
         )
         .map do |campaign, content, language, views, readers|
      {
        campaign: campaign,
        utm_content: content,
        target_language: language,
        views: views.to_i,
        approximate_scanners: readers.to_i
      }
    end.sort_by { |row| -row[:views] }
  end

  def scroll_distribution(values)
    buckets = [
      ["0–24%", 0...25],
      ["25–49%", 25...50],
      ["50–74%", 50...75],
      ["75–100%", 75..100]
    ]

    buckets.map do |label, range|
      { label: label, count: values.count { |value| range.cover?(value) } }
    end
  end

  def engaged_scope(scope)
    scope.where(
      "engaged_seconds >= ? AND max_scroll_percent >= ?",
      ENGAGED_SECONDS,
      ENGAGED_SCROLL_PERCENT
    )
  end

  def rounded_average(scope, column)
    round_number(scope.average(column))
  end

  def story_title(story)
    story.story_translations.find { |translation| translation.language == "en" }&.title ||
      story.story_translations.first&.title ||
      "Untitled story"
  end

  def date_series
    (@start_date..@end_date).to_a
  end

  def range_json
    {
      start_date: @start_date,
      end_date: @end_date,
      previous_start_date: previous_dates.first,
      previous_end_date: previous_dates.last
    }
  end

  def previous_range
    day_range(*previous_dates)
  end

  def previous_dates
    days = (@end_date - @start_date).to_i + 1
    previous_end = @start_date - 1.day
    [previous_end - (days - 1).days, previous_end]
  end

  def day_range(start_date, end_date)
    Time.zone.local(
      start_date.year,
      start_date.month,
      start_date.day
    ).beginning_of_day..Time.zone.local(
      end_date.year,
      end_date.month,
      end_date.day
    ).end_of_day
  end

  def parse_date(value, fallback)
    Date.iso8601(value.to_s)
  rescue Date::Error
    fallback
  end

  def positive_integer(value, fallback)
    parsed = Integer(value.to_s, 10)
    parsed.positive? ? parsed : fallback
  rescue ArgumentError
    fallback
  end

  def percentage(numerator, denominator)
    return 0.0 if denominator.to_f.zero?

    ((numerator.to_f / denominator.to_f) * 100).round(1)
  end

  def percent_change(current, previous)
    return nil if previous.to_f.zero?

    (((current.to_f - previous.to_f) / previous.to_f) * 100).round(1)
  end

  def round_number(value)
    value.nil? ? nil : value.to_f.round(1)
  end

  def median(values)
    return nil if values.empty?

    sorted = values.sort
    middle = sorted.length / 2
    value = if sorted.length.odd?
      sorted[middle]
    else
      (sorted[middle - 1] + sorted[middle]) / 2.0
    end
    value.round(1)
  end

  def sanitize_like(value)
    ActiveRecord::Base.sanitize_sql_like(value)
  end
end
