import React, { useEffect, useState } from "react";
import { adminRequest, downloadCsv } from "../utils/adminAnalyticsApi";

const LANGUAGES = ["en", "es", "zh"];
const EMPTY_PLACEMENT = {
  story_id: "",
  page_number: "",
  position_label: "",
  print_language: "en",
  target_language: "en",
  utm_content: "",
};

const formatNumber = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();
const formatPercent = (value) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;
const displayLanguage = (value) => (value || "unknown").toUpperCase();

const Metric = ({ label, value }) => (
  <article className="admin-analytics__metric">
    <span>{label}</span>
    <strong>{value}</strong>
  </article>
);

const PrintAnalyticsPanel = ({ token, onError }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [detail, setDetail] = useState(null);
  const [storyOptions, setStoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [showPlacementForm, setShowPlacementForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    code: "",
    name: "",
    publication_date: "",
    copies_printed: "",
  });
  const [placementForm, setPlacementForm] = useState(EMPTY_PLACEMENT);

  const loadIssues = async (preferredId) => {
    const result = await adminRequest("/api/admin/print_issues", token);
    setIssues(result.issues);
    const nextId =
      preferredId ||
      selectedIssueId ||
      (result.issues[0] ? String(result.issues[0].id) : "");
    setSelectedIssueId(nextId);
  };

  const loadDetail = async (issueId) => {
    if (!issueId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    try {
      setDetail(await adminRequest(`/api/admin/print_issues/${issueId}`, token));
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      adminRequest("/api/admin/print_issues", token),
      adminRequest("/api/admin/analytics/story_options", token),
    ])
      .then(([issueResult, storyResult]) => {
        if (!active) return;
        setIssues(issueResult.issues);
        setStoryOptions(storyResult.stories);
        if (issueResult.issues[0]) {
          setSelectedIssueId(String(issueResult.issues[0].id));
        }
      })
      .catch(onError)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [onError, token]);

  useEffect(() => {
    loadDetail(selectedIssueId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIssueId, token]);

  const createIssue = async (event) => {
    event.preventDefault();
    try {
      const created = await adminRequest("/api/admin/print_issues", token, {
        method: "POST",
        body: JSON.stringify({
          print_issue: {
            ...issueForm,
            copies_printed: issueForm.copies_printed || null,
            publication_date: issueForm.publication_date || null,
          },
        }),
      });
      await loadIssues(String(created.id));
      setShowIssueForm(false);
      setIssueForm({ code: "", name: "", publication_date: "", copies_printed: "" });
    } catch (error) {
      onError(error);
    }
  };

  const createPlacement = async (event) => {
    event.preventDefault();
    if (!selectedIssueId) return;
    try {
      const result = await adminRequest(
        `/api/admin/print_issues/${selectedIssueId}/placements`,
        token,
        {
          method: "POST",
          body: JSON.stringify({
            print_story_placement: {
              ...placementForm,
              page_number: placementForm.page_number || null,
              position_label: placementForm.position_label || null,
              utm_content: placementForm.utm_content || null,
            },
          }),
        },
      );
      setDetail(result);
      setPlacementForm(EMPTY_PLACEMENT);
      await loadIssues(selectedIssueId);
    } catch (error) {
      onError(error);
    }
  };

  const deletePlacement = async (placement) => {
    if (!window.confirm(`Remove "${placement.title}" from this print issue?`)) return;
    try {
      await adminRequest(`/api/admin/print_story_placements/${placement.id}`, token, {
        method: "DELETE",
      });
      await loadDetail(selectedIssueId);
      await loadIssues(selectedIssueId);
    } catch (error) {
      onError(error);
    }
  };

  const exportScans = () => {
    if (!detail) return;
    const rows = detail.scan_rows || detail.placements || [];
    downloadCsv(`${detail.issue.code}-print-qr.csv`, rows, [
      { key: "title", label: "Story" },
      { key: "slug", label: "Slug" },
      { key: "print_language", label: "Print language" },
      { key: "target_language", label: "Target language" },
      { key: "utm_content", label: "UTM content" },
      { key: "path", label: "Path" },
      { key: "scans", label: "Scans" },
      { key: "approximate_scanners", label: "Approximate scanners" },
      { key: "engaged_scan_rate", label: "Engaged scan rate" },
      { key: "average_engaged_seconds", label: "Average seconds" },
      { key: "average_scroll_percent", label: "Average scroll" },
      { key: "registered", label: "Placement registered" },
    ]);
  };

  if (loading && !detail && issues.length === 0) {
    return <p className="admin-analytics__status">Loading print issues…</p>;
  }

  const scanRows = detail?.scan_rows || [];

  return (
    <section>
      <div className="admin-analytics__section-heading">
        <div>
          <h2>Print &amp; QR</h2>
          <p>
            QR results are read directly from recorded scans. Placement registration is
            optional and adds page, position and zero-scan reporting.
          </p>
        </div>
        <button type="button" onClick={() => setShowIssueForm((value) => !value)}>
          {showIssueForm ? "Cancel" : "New issue"}
        </button>
      </div>

      {showIssueForm && (
        <form className="admin-analytics__form" onSubmit={createIssue}>
          <label>
            Print campaign
            <input required pattern="\d{4}-(0[1-9]|1[0-2])" placeholder="2026-08" value={issueForm.code} onChange={(event) => setIssueForm({ ...issueForm, code: event.target.value })} />
          </label>
          <label>
            Issue name
            <input required placeholder="August 2026" value={issueForm.name} onChange={(event) => setIssueForm({ ...issueForm, name: event.target.value })} />
          </label>
          <label>
            Publication date
            <input type="date" value={issueForm.publication_date} onChange={(event) => setIssueForm({ ...issueForm, publication_date: event.target.value })} />
          </label>
          <label>
            Copies printed
            <input type="number" min="1" value={issueForm.copies_printed} onChange={(event) => setIssueForm({ ...issueForm, copies_printed: event.target.value })} />
          </label>
          <button type="submit">Create issue</button>
        </form>
      )}

      <div className="admin-analytics__toolbar">
        <label>
          Issue
          <select value={selectedIssueId} onChange={(event) => setSelectedIssueId(event.target.value)}>
            <option value="">Select an issue</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.name} ({issue.placement_count} placements)
              </option>
            ))}
          </select>
        </label>
        {detail && <button type="button" onClick={exportScans}>Export CSV</button>}
      </div>

      {!detail && (
        <div className="admin-analytics__empty">Create or select an issue to view its QR campaign.</div>
      )}

      {detail && (
        <>
          <div className="admin-analytics__metrics">
            <Metric label="QR scans" value={formatNumber(detail.metrics.scans)} />
            <Metric label="Approx. scanners" value={formatNumber(detail.metrics.approximate_scanners)} />
            <Metric label="Engaged scans" value={formatPercent(detail.metrics.engaged_scan_rate)} />
            <Metric label="Scans / 1,000 copies" value={formatNumber(detail.metrics.scans_per_thousand_copies)} />
            <Metric label="Average active time" value={detail.metrics.average_engaged_seconds === null ? "—" : `${detail.metrics.average_engaged_seconds}s`} />
            <Metric label="Average scroll" value={formatPercent(detail.metrics.average_scroll_percent)} />
          </div>

          {detail.unmatched_scan_count > 0 && (
            <div className="admin-analytics__notice">
              {detail.unmatched_scan_count} scan{detail.unmatched_scan_count === 1 ? "" : "s"} are shown below but do not yet have optional print-placement details.
            </div>
          )}

          <div className="admin-analytics__split">
            <article className="admin-analytics__panel">
              <h3>Target language</h3>
              <ul className="admin-analytics__breakdown">
                {detail.by_target_language.map((row) => (
                  <li key={row.value}><span>{displayLanguage(row.value)}</span><strong>{formatNumber(row.count)}</strong></li>
                ))}
                {detail.by_target_language.length === 0 && <li>No scans recorded yet.</li>}
              </ul>
              <h3 className="admin-analytics__subheading">Print → target language</h3>
              <ul className="admin-analytics__breakdown">
                {detail.by_language_path.map((row) => (
                  <li key={`${row.print_language}-${row.target_language}`}><span>{displayLanguage(row.print_language)} → {displayLanguage(row.target_language)}</span><strong>{formatNumber(row.scans)}</strong></li>
                ))}
                {detail.by_language_path.length === 0 && <li>No language path could be inferred.</li>}
              </ul>
            </article>

            <article className="admin-analytics__panel">
              <h3>Optional print details</h3>
              <p>Add placements only when you want page, position and zero-scan reporting.</p>
              <button type="button" onClick={() => setShowPlacementForm((value) => !value)}>
                {showPlacementForm ? "Hide placement form" : "Add placement details"}
              </button>
              {showPlacementForm && (
                <form className="admin-analytics__placement-form" onSubmit={createPlacement}>
                  <label>Story<select required value={placementForm.story_id} onChange={(event) => setPlacementForm({ ...placementForm, story_id: event.target.value })}><option value="">Choose a story</option>{storyOptions.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select></label>
                  <label>Page<input type="number" min="1" value={placementForm.page_number} onChange={(event) => setPlacementForm({ ...placementForm, page_number: event.target.value })} /></label>
                  <label>Position<input placeholder="Top, center, full page…" value={placementForm.position_label} onChange={(event) => setPlacementForm({ ...placementForm, position_label: event.target.value })} /></label>
                  <label>Print language<select value={placementForm.print_language} onChange={(event) => setPlacementForm({ ...placementForm, print_language: event.target.value })}>{LANGUAGES.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select></label>
                  <label>Target language<select value={placementForm.target_language} onChange={(event) => setPlacementForm({ ...placementForm, target_language: event.target.value })}>{LANGUAGES.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select></label>
                  <label className="admin-analytics__form-wide">UTM content (optional)<input placeholder="story-slug_print-en_target-en" value={placementForm.utm_content} onChange={(event) => setPlacementForm({ ...placementForm, utm_content: event.target.value })} /></label>
                  <button type="submit">Add placement</button>
                </form>
              )}
            </article>
          </div>

          <div className="admin-analytics__section-heading">
            <div>
              <h3>QR performance by story and printed link</h3>
              <p>These rows are inferred directly from recorded story ID, language and UTM content.</p>
            </div>
          </div>
          <div className="admin-analytics__table-wrap">
            <table>
              <thead><tr><th>Story</th><th>Print → target</th><th>Scans</th><th>Scanners</th><th>Engaged</th><th>Active time</th><th>Scroll</th><th>Status</th></tr></thead>
              <tbody>
                {scanRows.map((row) => (
                  <tr key={`${row.story_id}-${row.utm_content}-${row.target_language}`}>
                    <td><strong>{row.title}</strong><small>{row.utm_content || row.path || row.slug}</small></td>
                    <td>{displayLanguage(row.print_language)} → {displayLanguage(row.target_language)}</td>
                    <td>{formatNumber(row.scans)}</td>
                    <td>{formatNumber(row.approximate_scanners)}</td>
                    <td>{formatPercent(row.engaged_scan_rate)}</td>
                    <td>{row.average_engaged_seconds === null ? "—" : `${row.average_engaged_seconds}s`}</td>
                    <td>{formatPercent(row.average_scroll_percent)}</td>
                    <td>{row.registered ? "Placement added" : "Scan data only"}</td>
                  </tr>
                ))}
                {scanRows.length === 0 && <tr><td colSpan="8">No QR scans recorded for this campaign.</td></tr>}
              </tbody>
            </table>
          </div>

          {detail.placements.length > 0 && (
            <>
              <div className="admin-analytics__section-heading"><div><h3>Registered placements</h3></div></div>
              <div className="admin-analytics__table-wrap">
                <table>
                  <thead><tr><th>Page</th><th>Story</th><th>Print → target</th><th>Scans</th><th aria-label="Actions" /></tr></thead>
                  <tbody>
                    {detail.placements.map((placement) => (
                      <tr key={placement.id}>
                        <td>{placement.page_number || "—"}{placement.position_label && <small>{placement.position_label}</small>}</td>
                        <td><strong>{placement.title}</strong><small>{placement.slug}</small></td>
                        <td>{displayLanguage(placement.print_language)} → {displayLanguage(placement.target_language)}</td>
                        <td>{formatNumber(placement.scans)}</td>
                        <td><button className="admin-analytics__danger-link" type="button" onClick={() => deletePlacement(placement)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </section>
  );
};

export default PrintAnalyticsPanel;
