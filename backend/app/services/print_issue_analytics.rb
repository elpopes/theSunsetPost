class PrintIssueAnalytics
  ENGAGED_SECONDS = AdminAnalyticsQuery::ENGAGED_SECONDS
  ENGAGED_SCROLL_PERCENT = AdminAnalyticsQuery::ENGAGED_SCROLL_PERCENT

  def initialize(issue)
    @issue = issue
  end

  def as_json(*)
    placements = issue.print_story_placements
                      .includes(story: :story_translations)
                      .order(:page_number, :id)
    scans = campaign_scans.to_a
    total_scans = scans.size
    engaged_scans = scans.count { |view| engaged?(view) }
    placement_rows = placements.map { |placement| placement_row(placement, scans) }
    scan_rows = discovered_scan_rows(scans, placements)

    {
      issue: {
        id: issue.id,
        code: issue.code,
        name: issue.name,
        publication_date: issue.publication_date,
        copies_printed: issue.copies_printed
      },
      metrics: {
        scans: total_scans,
        approximate_scanners: scans.map(&:visitor_token).compact.uniq.size,
        engaged_scans: engaged_scans,
        engaged_scan_rate: percentage(engaged_scans, total_scans),
        average_engaged_seconds: average(scans, &:engaged_seconds),
        average_scroll_percent: average(scans, &:max_scroll_percent),
        scans_per_thousand_copies: scans_per_thousand(total_scans)
      },
      by_target_language: count_by(scans, &:language),
      by_language_path: language_path_rows(scan_rows),
      links: link_rows(scans),
      scan_rows: scan_rows,
      placements: placement_rows,
      unmatched_scan_count: unmatched_scan_count(placements, scans)
    }
  end

  private

  attr_reader :issue

  def campaign_scans
    StoryView.includes(story: :story_translations).where(
      source_type: "print_qr",
      utm_source: "print",
      utm_medium: "qr",
      utm_campaign: issue.code
    )
  end

  def placement_row(placement, scans)
    matching = scans.select { |view| matches_placement?(view, placement) }
    engaged = matching.count { |view| engaged?(view) }
    story = placement.story

    {
      id: placement.id,
      story_id: story.id,
      title: story_title(story),
      slug: story.slug,
      page_number: placement.page_number,
      position_label: placement.position_label,
      print_language: placement.print_language,
      target_language: placement.target_language,
      utm_content: placement.utm_content,
      scans: matching.size,
      approximate_scanners: matching.map(&:visitor_token).compact.uniq.size,
      engaged_scan_rate: percentage(engaged, matching.size),
      average_engaged_seconds: average(matching, &:engaged_seconds),
      average_scroll_percent: average(matching, &:max_scroll_percent)
    }
  end

  def discovered_scan_rows(scans, placements)
    scans.group_by { |view| [view.story_id, view.utm_content, view.language] }
         .map do |(_story_id, content, language), views|
      story = views.first.story
      print_language, utm_target_language = languages_from_utm(content)
      target_language = language.presence || utm_target_language || "unknown"
      engaged = views.count { |view| engaged?(view) }

      {
        story_id: story&.id,
        title: story ? story_title(story) : "Unknown story",
        slug: story&.slug,
        print_language: print_language || "unknown",
        target_language: target_language,
        utm_content: content,
        path: most_common_value(views, &:path),
        scans: views.size,
        approximate_scanners: views.map(&:visitor_token).compact.uniq.size,
        engaged_scan_rate: percentage(engaged, views.size),
        average_engaged_seconds: average(views, &:engaged_seconds),
        average_scroll_percent: average(views, &:max_scroll_percent),
        registered: views.any? do |view|
          placements.any? { |placement| matches_placement?(view, placement) }
        end
      }
    end
         .sort_by { |row| [-row[:scans], row[:title].to_s] }
  end

  def matches_placement?(view, placement)
    return false unless view.story_id == placement.story_id
    return false unless view.language == placement.target_language

    if placement.utm_content.present?
      return view.utm_content == placement.utm_content
    end

    language_signature =
      "_print-#{placement.print_language}_target-#{placement.target_language}"
    return true if view.utm_content.to_s.include?(language_signature)

    sibling_count = issue.print_story_placements.count do |candidate|
      candidate.story_id == placement.story_id &&
        candidate.target_language == placement.target_language
    end
    sibling_count == 1
  end

  def unmatched_scan_count(placements, scans)
    scans.count do |view|
      placements.none? { |placement| matches_placement?(view, placement) }
    end
  end

  def link_rows(scans)
    scans.group_by { |view| [view.utm_content, view.language] }
         .map do |(content, language), views|
      {
        utm_content: content,
        target_language: language,
        scans: views.size,
        approximate_scanners: views.map(&:visitor_token).compact.uniq.size
      }
    end
         .sort_by { |row| -row[:scans] }
  end

  def language_path_rows(rows)
    rows.group_by { |row| [row[:print_language], row[:target_language]] }
        .map do |(print_language, target_language), matches|
      {
        print_language: print_language,
        target_language: target_language,
        scans: matches.sum { |row| row[:scans] }
      }
    end
        .sort_by { |row| -row[:scans] }
  end

  def languages_from_utm(content)
    match = content.to_s.match(
      /_print-(en|es|zh)_target-(en|es|zh)(?:\z|[^a-z])/i
    )
    return [nil, nil] unless match

    [match[1].downcase, match[2].downcase]
  end

  def most_common_value(records)
    records.map { |record| yield(record) }
           .compact
           .group_by(&:itself)
           .max_by { |_value, matches| matches.size }
           &.first
  end

  def count_by(records)
    records.group_by { |record| yield(record).presence || "unknown" }
           .map { |value, matches| { value: value, count: matches.size } }
           .sort_by { |row| -row[:count] }
  end

  def engaged?(view)
    view.engaged_seconds.to_i >= ENGAGED_SECONDS &&
      view.max_scroll_percent.to_i >= ENGAGED_SCROLL_PERCENT
  end

  def average(records)
    values = records.filter_map { |record| yield(record)&.to_f }
    return nil if values.empty?

    (values.sum / values.size).round(1)
  end

  def scans_per_thousand(total)
    return nil unless issue.copies_printed.to_i.positive?

    ((total.to_f / issue.copies_printed) * 1_000).round(1)
  end

  def percentage(numerator, denominator)
    return 0.0 if denominator.to_f.zero?

    ((numerator.to_f / denominator.to_f) * 100).round(1)
  end

  def story_title(story)
    story.story_translations.find { |translation| translation.language == "en" }&.title ||
      story.story_translations.first&.title ||
      "Untitled story"
  end
end
