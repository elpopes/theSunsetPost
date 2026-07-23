import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  adminRequest,
  buildQuery,
  downloadCsv,
} from "../utils/adminAnalyticsApi";
import PrintAnalyticsPanel from "./PrintAnalyticsPanel";
import "./AdminAnalytics.css";

const TABS = [
  ["overview", "Overview"],
  ["stories", "Stories"],
  ["print", "Print & QR"],
  ["ads", "Advertising"],
];

const METRIC_LABELS = {
  story_views: "Story views",
  approximate_readers: "Approx. readers",
  engaged_reads: "Engaged reads",
  engagement_rate: "Engagement rate",
  ad_impressions: "Viewable impressions",
  ad_clicks: "Ad clicks",
  ad_ctr: "CTR",
  active_campaigns: "Active campaigns",
};

const METRIC_DEFINITIONS = {
  story_views:
    "Recorded StoryView rows after the 30-minute deduplication rule.",
  approximate_readers:
    "Distinct anonymous visitor tokens; not verified people.",
  engaged_reads: "Views with at least 30 active seconds and 50% scroll.",
  engagement_rate: "Engaged reads divided by recorded story views.",
  ad_impressions: "Ads at least 50% visible for at least one second.",
  ad_clicks: "Recorded clicks on tracked ad or promotion links.",
  ad_ctr: "Clicks divided by viewable impressions.",
  active_campaigns: "Campaigns with at least one event in the selected period.",
};

const isoDate = (date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

const defaultDates = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return { start_date: isoDate(start), end_date: isoDate(end) };
};

const formatNumber = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();

const formatPercent = (value) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;

const formatMetric = (key, value) => {
  if (key === "engagement_rate" || key === "ad_ctr") {
    return formatPercent(value);
  }
  return formatNumber(value);
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  }).format(new Date(value));
};

const MetricCard = ({ metricKey, value, comparison, compareEnabled }) => {
  const change = comparison?.percent_change;

  return (
    <article className="admin-analytics__metric">
      <span title={METRIC_DEFINITIONS[metricKey]}>
        {METRIC_LABELS[metricKey]}
      </span>
      <strong>{formatMetric(metricKey, value)}</strong>
      {compareEnabled && (
        <small
          className={
            change > 0
              ? "admin-analytics__change--up"
              : change < 0
                ? "admin-analytics__change--down"
                : ""
          }
        >
          {change === null || change === undefined
            ? "No prior-period baseline"
            : `${change > 0 ? "+" : ""}${change.toFixed(1)}% vs. prior period`}
        </small>
      )}
    </article>
  );
};

const BarChart = ({ rows, valueKey, secondaryKey, emptyText }) => {
  const maxValue = Math.max(
    1,
    ...rows.map((row) => Number(row[valueKey] || 0)),
  );

  if (rows.length === 0) {
    return <p>{emptyText}</p>;
  }

  return (
    <div
      className="admin-analytics__bar-chart"
      role="img"
      aria-label="Daily activity bar chart"
    >
      {rows.map((row) => (
        <div className="admin-analytics__bar-column" key={row.date}>
          <div className="admin-analytics__bar-values">
            <div
              className="admin-analytics__bar"
              style={{
                height: `${Math.max(
                  2,
                  (Number(row[valueKey] || 0) / maxValue) * 100,
                )}%`,
              }}
              title={`${row.date}: ${row[valueKey] || 0}`}
            />
            {secondaryKey && Number(row[secondaryKey] || 0) > 0 && (
              <div
                className="admin-analytics__bar admin-analytics__bar--secondary"
                style={{
                  height: `${Math.max(
                    2,
                    (Number(row[secondaryKey] || 0) / maxValue) * 100,
                  )}%`,
                }}
                title={`${row.date}: ${row[secondaryKey]} clicks`}
              />
            )}
          </div>
          <span>{row.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

const OverviewPanel = ({ data, compareEnabled }) => {
  if (!data) return null;

  return (
    <section>
      <div className="admin-analytics__section-heading">
        <div>
          <h2>Audience &amp; advertising overview</h2>
          <p>
            Story engagement and first-party advertising performance for the
            selected period.
          </p>
        </div>
      </div>

      <div className="admin-analytics__metrics">
        {Object.keys(METRIC_LABELS).map((key) => (
          <MetricCard
            key={key}
            metricKey={key}
            value={data.metrics[key]}
            comparison={data.comparison[key]}
            compareEnabled={compareEnabled}
          />
        ))}
      </div>

      <div className="admin-analytics__split">
        <article className="admin-analytics__panel">
          <h3>Story views by day</h3>
          <BarChart
            rows={data.story_trend}
            valueKey="views"
            emptyText="No story views in this period."
          />
        </article>
        <article className="admin-analytics__panel">
          <h3>Ad impressions and clicks</h3>
          <BarChart
            rows={data.ad_trend}
            valueKey="impressions"
            secondaryKey="clicks"
            emptyText="First-party ad data has not been recorded yet."
          />
          <div className="admin-analytics__legend">
            <span>
              <i /> Impressions
            </span>
            <span>
              <i className="admin-analytics__legend-secondary" /> Clicks
            </span>
          </div>
        </article>
      </div>

      <div className="admin-analytics__split">
        <article className="admin-analytics__panel">
          <h3>Top stories</h3>
          <ol className="admin-analytics__ranked">
            {data.top_stories.map((story) => (
              <li key={story.id}>
                <Link to={`/admin/analytics/stories/${story.id}`}>
                  {story.title}
                </Link>
                <strong>{formatNumber(story.views)} views</strong>
              </li>
            ))}
            {data.top_stories.length === 0 && <li>No story data.</li>}
          </ol>
        </article>
        <article className="admin-analytics__panel">
          <h3>Top campaigns</h3>
          <ol className="admin-analytics__ranked">
            {data.top_campaigns.map((campaign) => (
              <li key={campaign.id}>
                <span>{campaign.name}</span>
                <strong>
                  {formatNumber(campaign.impressions)} ·{" "}
                  {formatPercent(campaign.ctr)} CTR
                </strong>
              </li>
            ))}
            {data.top_campaigns.length === 0 && (
              <li>
                First-party campaign tracking begins with this deployment.
              </li>
            )}
          </ol>
        </article>
      </div>
    </section>
  );
};

const StoryDetailPanel = ({ data }) => {
  if (!data) return null;
  const { story } = data;

  return (
    <section>
      <div className="admin-analytics__section-heading">
        <div>
          <Link className="admin-analytics__back" to="/admin/analytics">
            ← All analytics
          </Link>
          <h2>{story.title}</h2>
          <p>
            Published {formatDate(story.published_at)} ·{" "}
            {story.authors.join(", ") || "No author"} ·{" "}
            {story.sections.join(", ") || "No section"}
          </p>
        </div>
        <a
          href={`/en/stories/${story.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View story ↗
        </a>
      </div>

      <div className="admin-analytics__metrics">
        <MetricCard metricKey="story_views" value={story.views} />
        <MetricCard metricKey="approximate_readers" value={story.readers} />
        <MetricCard metricKey="engaged_reads" value={story.engaged_reads} />
        <MetricCard metricKey="engagement_rate" value={story.engagement_rate} />
        <article className="admin-analytics__metric">
          <span>Average active time</span>
          <strong>
            {story.average_engaged_seconds === null
              ? "—"
              : `${story.average_engaged_seconds}s`}
          </strong>
        </article>
        <article className="admin-analytics__metric">
          <span>Median active time</span>
          <strong>
            {story.median_engaged_seconds === null
              ? "—"
              : `${story.median_engaged_seconds}s`}
          </strong>
        </article>
        <article className="admin-analytics__metric">
          <span>Average scroll</span>
          <strong>{formatPercent(story.average_scroll_percent)}</strong>
        </article>
        <article className="admin-analytics__metric">
          <span>Median scroll</span>
          <strong>{formatPercent(story.median_scroll_percent)}</strong>
        </article>
        <article className="admin-analytics__metric">
          <span>Print QR views</span>
          <strong>{formatNumber(story.qr_views)}</strong>
        </article>
      </div>

      <div className="admin-analytics__split">
        <article className="admin-analytics__panel">
          <h3>Views by day</h3>
          <BarChart
            rows={data.daily}
            valueKey="views"
            emptyText="No views in this period."
          />
        </article>
        <article className="admin-analytics__panel">
          <h3>Scroll depth</h3>
          <ul className="admin-analytics__breakdown">
            {data.scroll_distribution.map((row) => (
              <li key={row.label}>
                <span>{row.label}</span>
                <strong>{formatNumber(row.count)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <div className="admin-analytics__split">
        <article className="admin-analytics__panel">
          <h3>Traffic sources</h3>
          <ul className="admin-analytics__breakdown">
            {data.by_source.map((row) => (
              <li key={row.value}>
                <span>{row.value}</span>
                <strong>{formatNumber(row.count)}</strong>
              </li>
            ))}
          </ul>
        </article>
        <article className="admin-analytics__panel">
          <h3>Languages</h3>
          <ul className="admin-analytics__breakdown">
            {data.by_language.map((row) => (
              <li key={row.value}>
                <span>{row.value.toUpperCase()}</span>
                <strong>{formatNumber(row.count)}</strong>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="admin-analytics__panel">
        <h3>Print QR links</h3>
        <div className="admin-analytics__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Campaign</th>
                <th>UTM content</th>
                <th>Target</th>
                <th>Views</th>
                <th>Scanners</th>
              </tr>
            </thead>
            <tbody>
              {data.print_links.map((row, index) => (
                <tr key={`${row.utm_content}-${row.target_language}-${index}`}>
                  <td>{row.campaign || "—"}</td>
                  <td>{row.utm_content || "—"}</td>
                  <td>{row.target_language.toUpperCase()}</td>
                  <td>{formatNumber(row.views)}</td>
                  <td>{formatNumber(row.approximate_scanners)}</td>
                </tr>
              ))}
              {data.print_links.length === 0 && (
                <tr>
                  <td colSpan="5">No QR-attributed views in this period.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
};

const StoriesPanel = ({ data, filters, setFilters, onExport, onPage }) => {
  if (!data) return null;

  const changeSort = (sort) => {
    setFilters((current) => ({
      ...current,
      sort,
      direction:
        current.sort === sort && current.direction === "desc" ? "asc" : "desc",
      page: 1,
    }));
  };

  return (
    <section>
      <div className="admin-analytics__section-heading">
        <div>
          <h2>Stories</h2>
          <p>
            Sort and filter recorded story traffic. Click a title for its full
            language, source, scroll and QR report.
          </p>
        </div>
        <button type="button" onClick={onExport}>
          Export CSV
        </button>
      </div>

      <div className="admin-analytics__toolbar admin-analytics__toolbar--filters">
        <label>
          Search
          <input
            type="search"
            value={filters.q}
            placeholder="Title or slug"
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                q: event.target.value,
                page: 1,
              }))
            }
          />
        </label>
        <label>
          Author
          <select
            value={filters.author_id}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                author_id: event.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All authors</option>
            {data.filters.authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Section
          <select
            value={filters.section_id}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                section_id: event.target.value,
                page: 1,
              }))
            }
          >
            <option value="">All sections</option>
            {data.filters.sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-analytics__table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <button type="button" onClick={() => changeSort("title")}>
                  Story
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => changeSort("published_at")}
                >
                  Published
                </button>
              </th>
              <th>
                <button type="button" onClick={() => changeSort("views")}>
                  Views
                </button>
              </th>
              <th>
                <button type="button" onClick={() => changeSort("readers")}>
                  Readers
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => changeSort("engaged_reads")}
                >
                  Engaged
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => changeSort("engagement_rate")}
                >
                  Rate
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => changeSort("average_engaged_seconds")}
                >
                  Active time
                </button>
              </th>
              <th>
                <button
                  type="button"
                  onClick={() => changeSort("average_scroll_percent")}
                >
                  Scroll
                </button>
              </th>
              <th>
                <button type="button" onClick={() => changeSort("qr_views")}>
                  QR
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.stories.map((story) => (
              <tr key={story.id}>
                <td>
                  <Link to={`/admin/analytics/stories/${story.id}`}>
                    <strong>{story.title}</strong>
                  </Link>
                  <small>
                    {story.authors.join(", ") || "No author"} ·{" "}
                    {story.sections.join(", ") || "No section"}
                  </small>
                </td>
                <td>{formatDate(story.published_at)}</td>
                <td>{formatNumber(story.views)}</td>
                <td>{formatNumber(story.readers)}</td>
                <td>{formatNumber(story.engaged_reads)}</td>
                <td>{formatPercent(story.engagement_rate)}</td>
                <td>
                  {story.average_engaged_seconds === null
                    ? "—"
                    : `${story.average_engaged_seconds}s`}
                </td>
                <td>{formatPercent(story.average_scroll_percent)}</td>
                <td>{formatNumber(story.qr_views)}</td>
              </tr>
            ))}
            {data.stories.length === 0 && (
              <tr>
                <td colSpan="9">No matching story views in this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="admin-analytics__pagination">
        <button
          type="button"
          disabled={data.pagination.page <= 1}
          onClick={() => onPage(data.pagination.page - 1)}
        >
          Previous
        </button>
        <span>
          Page {data.pagination.page} of {data.pagination.total_pages} ·{" "}
          {formatNumber(data.pagination.total)} stories
        </span>
        <button
          type="button"
          disabled={data.pagination.page >= data.pagination.total_pages}
          onClick={() => onPage(data.pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
};

const AdsPanel = ({
  data,
  includeHouse,
  setIncludeHouse,
  selectedCampaignId,
  setSelectedCampaignId,
  onExport,
}) => {
  if (!data) return null;

  return (
    <section>
      <div className="admin-analytics__section-heading">
        <div>
          <h2>Advertising</h2>
          <p>
            Viewable first-party impressions are recorded after an ad is at
            least 50% visible for one second. GA4 tracking remains in place.
          </p>
        </div>
        <button type="button" onClick={onExport}>
          Export CSV
        </button>
      </div>

      <div className="admin-analytics__toolbar">
        <label className="admin-analytics__checkbox">
          <input
            type="checkbox"
            checked={includeHouse}
            onChange={(event) => {
              setIncludeHouse(event.target.checked);
              setSelectedCampaignId("");
            }}
          />
          Include Sunset Post promotions
        </label>
      </div>

      {data.campaigns.length === 0 && (
        <div className="admin-analytics__empty">
          First-party advertising data begins when this release is deployed.
          Existing GA4 history is not rewritten or estimated.
        </div>
      )}

      <div className="admin-analytics__table-wrap">
        <table>
          <thead>
            <tr>
              <th>Campaign</th>
              <th>Advertiser</th>
              <th>Type</th>
              <th>Impressions</th>
              <th>Reach</th>
              <th>Clicks</th>
              <th>CTR</th>
            </tr>
          </thead>
          <tbody>
            {data.campaigns.map((campaign) => (
              <tr
                key={campaign.id}
                className={
                  String(campaign.id) === String(selectedCampaignId)
                    ? "admin-analytics__selected-row"
                    : ""
                }
                onClick={() => setSelectedCampaignId(String(campaign.id))}
              >
                <td>
                  <strong>{campaign.name}</strong>
                </td>
                <td>{campaign.advertiser || "—"}</td>
                <td>{campaign.campaign_type}</td>
                <td>{formatNumber(campaign.impressions)}</td>
                <td>{formatNumber(campaign.approximate_reach)}</td>
                <td>{formatNumber(campaign.clicks)}</td>
                <td>{formatPercent(campaign.ctr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.detail && (
        <>
          <div className="admin-analytics__section-heading">
            <div>
              <h3>{data.detail.campaign.name}</h3>
              <p>Campaign detail for the selected date range.</p>
            </div>
          </div>
          <div className="admin-analytics__split">
            <article className="admin-analytics__panel">
              <h3>Impressions and clicks by day</h3>
              <BarChart
                rows={data.detail.daily}
                valueKey="impressions"
                secondaryKey="clicks"
                emptyText="No activity."
              />
            </article>
            <article className="admin-analytics__panel">
              <h3>Languages</h3>
              <ul className="admin-analytics__breakdown">
                {data.detail.by_language.map((row) => (
                  <li key={row.value}>
                    <span>{row.value.toUpperCase()}</span>
                    <strong>
                      {formatNumber(row.impressions)} · {formatPercent(row.ctr)}
                    </strong>
                  </li>
                ))}
              </ul>
              <h3 className="admin-analytics__subheading">Devices</h3>
              <ul className="admin-analytics__breakdown">
                {data.detail.by_device.map((row) => (
                  <li key={row.value}>
                    <span>{row.value}</span>
                    <strong>
                      {formatNumber(row.impressions)} · {formatPercent(row.ctr)}
                    </strong>
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <div className="admin-analytics__split">
            <article className="admin-analytics__panel">
              <h3>Placements</h3>
              <ul className="admin-analytics__breakdown">
                {data.detail.by_slot.map((row) => (
                  <li key={row.value}>
                    <span>{row.value}</span>
                    <strong>
                      {formatNumber(row.impressions)} · {formatPercent(row.ctr)}
                    </strong>
                  </li>
                ))}
              </ul>
            </article>
            <article className="admin-analytics__panel">
              <h3>Top pages</h3>
              <ul className="admin-analytics__breakdown">
                {data.detail.top_paths.map((row) => (
                  <li key={row.value}>
                    <span>{row.value}</span>
                    <strong>{formatNumber(row.impressions)}</strong>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </>
      )}
    </section>
  );
};

const AdminAnalytics = () => {
  const user = useSelector((state) => state.auth.user);
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);
  const adminUser = user || storedUser;
  const { storyId } = useParams();
  const initialDates = useMemo(defaultDates, []);
  const [activeTab, setActiveTab] = useState(storyId ? "stories" : "overview");
  const [dateFilters, setDateFilters] = useState(initialDates);
  const [datePreset, setDatePreset] = useState("30");
  const [language, setLanguage] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [includeHouse, setIncludeHouse] = useState(false);
  const [storyFilters, setStoryFilters] = useState({
    q: "",
    author_id: "",
    section_id: "",
    sort: "views",
    direction: "desc",
    page: 1,
  });
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleError = useCallback((requestError) => {
    setError(requestError.message || "Unable to load analytics.");
  }, []);

  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    if (preset === "custom") return;

    const now = new Date();
    let start;
    let end = now;

    if (preset === "7" || preset === "30") {
      start = new Date(now);
      start.setDate(now.getDate() - (Number(preset) - 1));
    } else if (preset === "current_month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    setDateFilters({
      start_date: isoDate(start),
      end_date: isoDate(end),
    });
  };

  const commonQuery = useMemo(
    () => ({
      ...dateFilters,
      language,
      source_type: sourceType,
      include_house: includeHouse,
    }),
    [dateFilters, includeHouse, language, sourceType],
  );

  useEffect(() => {
    if (!adminUser?.admin || !adminUser?.token || activeTab === "print") return;

    let path;
    if (storyId) {
      path = `/api/admin/analytics/stories/${storyId}${buildQuery(commonQuery)}`;
    } else if (activeTab === "stories") {
      path = `/api/admin/analytics/stories${buildQuery({
        ...commonQuery,
        ...storyFilters,
      })}`;
    } else if (activeTab === "ads") {
      path = `/api/admin/analytics/ads${buildQuery({
        ...commonQuery,
        campaign_id: selectedCampaignId,
      })}`;
    } else {
      path = `/api/admin/analytics/overview${buildQuery(commonQuery)}`;
    }

    let active = true;
    setLoading(true);
    setError("");
    adminRequest(path, adminUser.token)
      .then((result) => active && setData(result))
      .catch((requestError) => active && handleError(requestError))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [
    activeTab,
    commonQuery,
    handleError,
    selectedCampaignId,
    storyFilters,
    storyId,
    adminUser?.admin,
    adminUser?.token,
  ]);

  if (!adminUser) {
    return <Navigate to="/en/login" replace />;
  }

  if (!adminUser.admin) {
    return <Navigate to="/en" replace />;
  }

  const exportStories = async () => {
    try {
      const result = await adminRequest(
        `/api/admin/analytics/stories${buildQuery({
          ...commonQuery,
          ...storyFilters,
          page: 1,
          per_page: 500,
        })}`,
        adminUser.token,
      );
      downloadCsv(
        `story-analytics-${dateFilters.start_date}-${dateFilters.end_date}.csv`,
        result.stories,
        [
          { key: "title", label: "Story" },
          { key: "slug", label: "Slug" },
          { key: "published_at", label: "Published" },
          { key: "authors", label: "Authors" },
          { key: "sections", label: "Sections" },
          { key: "views", label: "Views" },
          { key: "readers", label: "Approximate readers" },
          { key: "engaged_reads", label: "Engaged reads" },
          { key: "engagement_rate", label: "Engagement rate" },
          { key: "average_engaged_seconds", label: "Average seconds" },
          { key: "average_scroll_percent", label: "Average scroll" },
          { key: "qr_views", label: "QR views" },
        ],
      );
    } catch (requestError) {
      handleError(requestError);
    }
  };

  const exportAds = () => {
    if (!data?.campaigns) return;
    downloadCsv(
      `ad-analytics-${dateFilters.start_date}-${dateFilters.end_date}.csv`,
      data.campaigns,
      [
        { key: "name", label: "Campaign" },
        { key: "advertiser", label: "Advertiser" },
        { key: "campaign_type", label: "Type" },
        { key: "impressions", label: "Viewable impressions" },
        { key: "approximate_reach", label: "Approximate reach" },
        { key: "clicks", label: "Clicks" },
        { key: "ctr", label: "CTR" },
      ],
    );
  };

  return (
    <main className="admin-analytics">
      <header className="admin-analytics__header">
        <div>
          <Link className="admin-analytics__brand" to="/en">
            The Sunset Post
          </Link>
          <h1>Audience &amp; Advertising</h1>
          <p>Admin analytics</p>
        </div>
        <Link to="/en/post">Post a story</Link>
      </header>

      {!storyId && (
        <nav className="admin-analytics__tabs" aria-label="Analytics sections">
          {TABS.map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={activeTab === key ? "is-active" : ""}
              onClick={() => {
                setActiveTab(key);
                setData(null);
                setError("");
              }}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {activeTab !== "print" && (
        <div className="admin-analytics__controls">
          <label>
            Range
            <select
              value={datePreset}
              onChange={(event) => applyDatePreset(event.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="current_month">Current month</option>
              <option value="previous_month">Previous month</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label>
            Start
            <input
              type="date"
              value={dateFilters.start_date}
              onChange={(event) => {
                setDatePreset("custom");
                setDateFilters((current) => ({
                  ...current,
                  start_date: event.target.value,
                }));
              }}
            />
          </label>
          <label>
            End
            <input
              type="date"
              value={dateFilters.end_date}
              onChange={(event) => {
                setDatePreset("custom");
                setDateFilters((current) => ({
                  ...current,
                  end_date: event.target.value,
                }));
              }}
            />
          </label>
          <label>
            Language
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="">All</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="zh">Chinese</option>
            </select>
          </label>
          {activeTab !== "ads" && (
            <label>
              Source
              <select
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value)}
              >
                <option value="">All</option>
                <option value="direct">Direct</option>
                <option value="internal">Internal</option>
                <option value="search">Search</option>
                <option value="social">Social</option>
                <option value="newsletter">Newsletter</option>
                <option value="print_qr">Print QR</option>
                <option value="referral">Referral</option>
                <option value="unknown">Unknown</option>
              </select>
            </label>
          )}
          {activeTab === "overview" && (
            <label className="admin-analytics__checkbox">
              <input
                type="checkbox"
                checked={compareEnabled}
                onChange={(event) => setCompareEnabled(event.target.checked)}
              />
              Compare with preceding period
            </label>
          )}
        </div>
      )}

      {error && (
        <div className="admin-analytics__error" role="alert">
          {error}
          <button type="button" onClick={() => setError("")}>
            Dismiss
          </button>
        </div>
      )}

      {loading && <p className="admin-analytics__status">Loading analytics…</p>}

      <div className="admin-analytics__content">
        {storyId ? (
          <StoryDetailPanel data={data} />
        ) : activeTab === "overview" ? (
          <OverviewPanel data={data} compareEnabled={compareEnabled} />
        ) : activeTab === "stories" ? (
          <StoriesPanel
            data={data}
            filters={storyFilters}
            setFilters={setStoryFilters}
            onExport={exportStories}
            onPage={(page) =>
              setStoryFilters((current) => ({ ...current, page }))
            }
          />
        ) : activeTab === "print" ? (
          <PrintAnalyticsPanel token={adminUser.token} onError={handleError} />
        ) : (
          <AdsPanel
            data={data}
            includeHouse={includeHouse}
            setIncludeHouse={setIncludeHouse}
            selectedCampaignId={selectedCampaignId}
            setSelectedCampaignId={setSelectedCampaignId}
            onExport={exportAds}
          />
        )}
      </div>
    </main>
  );
};

export default AdminAnalytics;
