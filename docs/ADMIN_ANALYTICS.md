# Admin audience and advertising analytics

The protected dashboard is available at `/admin/analytics` to signed-in Admin
users. The footer displays an **Analytics** link for Admin accounts.
Custom reporting ranges are capped at 366 days to keep production queries
bounded.

## Reporting areas

- **Overview:** Story and paid-ad totals, preceding-period comparisons, daily
  trends, top stories and top campaigns.
- **Stories:** Sortable/filterable story performance, CSV export and per-story
  language, source, scroll and print-QR detail.
- **Print & QR:** Print-issue records and story placements, including registered
  stories with zero scans.
- **Advertising:** Paid campaign performance by default, with an option to
  include Sunset Post promotions. Campaign details include language, device,
  placement and page.

## Metric definitions

- A **story view** is a `StoryView` after the existing 30-minute
  visitor/story/language deduplication rule.
- An **approximate reader** is a distinct anonymous visitor token.
- An **engaged read** has at least 30 active seconds and at least 50% scroll.
- A **viewable impression** is recorded after at least 50% of a tracked ad is
  visible for at least one second.
- **CTR** is clicks divided by viewable impressions.
- A **QR scan** is a story view attributed to `source_type: "print_qr"`.

First-party ad events begin when this release is deployed. Existing GA4 history
is retained in GA4 but is not copied or estimated in Rails.

## Print issue setup

The issue code must match the QR links' `utm_campaign`, such as `2026-07`.
Register each physical story placement, including zero-scan stories. Supplying
the exact `utm_content` gives the most reliable match; when it is omitted, the
report matches the established `_print-{lang}_target-{lang}` naming pattern.

## Deployment

Run the database migration before loading the dashboard:

```sh
bin/rails db:migrate
```

No GA4 configuration changes are required. Existing `info_view` and
`info_click` events continue to be sent to GA4 while the frontend also records
the new first-party events.
