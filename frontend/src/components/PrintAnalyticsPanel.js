import React, { useEffect, useState } from "react";
import { adminRequest, downloadCsv } from "../utils/adminAnalyticsApi";

const LANGUAGES = ["en", "es", "zh"];

const formatNumber = (value) =>
  value === null || value === undefined ? "—" : Number(value).toLocaleString();

const formatPercent = (value) =>
  value === null || value === undefined ? "—" : `${Number(value).toFixed(1)}%`;

const Metric = ({ label, value, note }) => (
  <article className="admin-analytics__metric">
    <span>{label}</span>
    <strong>{value}</strong>
    {note && <small>{note}</small>}
  </article>
);

const PrintAnalyticsPanel = ({ token, onError }) => {
  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState("");
  const [detail, setDetail] = useState(null);
  const [storyOptions, setStoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueForm, setIssueForm] = useState({
    code: "",
    name: "",
    publication_date: "",
    copies_printed: "",
  });
  const [placementForm, setPlacementForm] = useState({
    story_id: "",
    page_number: "",
    position_label: "",
    print_language: "en",
    target_language: "en",
    utm_content: "",
  });

  const loadIssues = async (preferredId) => {
    const result = await adminRequest("/api/admin/print_issues", token);
    setIssues(result.issues);

    const nextId =
      preferredId ||
      selectedIssueId ||
      (result.issues[0] ? String(result.issues[0].id) : "");
    setSelectedIssueId(nextId);
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
    if (!selectedIssueId) {
      setDetail(null);
      return;
    }

    setLoading(true);
    adminRequest(`/api/admin/print_issues/${selectedIssueId}`, token)
      .then(setDetail)
      .catch(onError)
      .finally(() => setLoading(false));
  }, [onError, selectedIssueId, token]);

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
      setIssueForm({
        code: "",
        name: "",
        publication_date: "",
        copies_printed: "",
      });
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
      setPlacementForm({
        story_id: "",
        page_number: "",
        position_label: "",
        print_language: "en",
        target_language: "en",
        utm_content: "",
      });
      await loadIssues(selectedIssueId);
    } catch (error) {
      onError(error);
    }
  };

  const deletePlacement = async (placement) => {
    const confirmed = window.confirm(
      `Remove "${placement.title}" from this print issue?`,
    );
    if (!confirmed) return;

    try {
      await adminRequest(
        `/api/admin/print_story_placements/${placement.id}`,
        token,
        { method: "DELETE" },
      );
      const result = await adminRequest(
        `/api/admin/print_issues/${selectedIssueId}`,
        token,
      );
      setDetail(result);
      await loadIssues(selectedIssueId);
    } catch (error) {
      onError(error);
    }
  };

  const exportPlacements = () => {
    if (!detail) return;
    downloadCsv(`${detail.issue.code}-print-qr.csv`, detail.placements, [
      { key: "page_number", label: "Page" },
      { key: "position_label", label: "Position" },
      { key: "title", label: "Story" },
      { key: "print_language", label: "Print language" },
      { key: "target_language", label: "Target language" },
      { key: "scans", label: "Scans" },
      { key: "approximate_scanners", label: "Approximate scanners" },
      { key: "engaged_scan_rate", label: "Engaged scan rate" },
      { key: "average_engaged_seconds", label: "Average seconds" },
      { key: "average_scroll_percent", label: "Average scroll" },
    ]);
  };

  if (loading && !detail && issues.length === 0) {
    return <p className="admin-analytics__status">Loading print issues…</p>;
  }

  return (
    <section>
      <div className="admin-analytics__section-heading">
        <div>
          <h2>Print &amp; QR</h2>
          <p>
            Register every print placement here—including zero-scan stories—to
            measure an issue completely.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowIssueForm((value) => !value)}
        >
          {showIssueForm ? "Cancel" : "New issue"}
        </button>
      </div>

      {showIssueForm && (
        <form className="admin-analytics__form" onSubmit={createIssue}>
          <label>
            Campaign code
            <input
              required
              pattern="\d{4}-(0[1-9]|1[0-2])"
              placeholder="2026-08"
              value={issueForm.code}
              onChange={(event) =>
                setIssueForm({ ...issueForm, code: event.target.value })
              }
            />
          </label>
          <label>
            Issue name
            <input
              required
              placeholder="August 2026"
              value={issueForm.name}
              onChange={(event) =>
                setIssueForm({ ...issueForm, name: event.target.value })
              }
            />
          </label>
          <label>
            Publication date
            <input
              type="date"
              value={issueForm.publication_date}
              onChange={(event) =>
                setIssueForm({
                  ...issueForm,
                  publication_date: event.target.value,
                })
              }
            />
          </label>
          <label>
            Copies printed
            <input
              type="number"
              min="1"
              value={issueForm.copies_printed}
              onChange={(event) =>
                setIssueForm({
                  ...issueForm,
                  copies_printed: event.target.value,
                })
              }
            />
          </label>
          <button type="submit">Create issue</button>
        </form>
      )}

      <div className="admin-analytics__toolbar">
        <label>
          Issue
          <select
            value={selectedIssueId}
            onChange={(event) => setSelectedIssueId(event.target.value)}
          >
            <option value="">Select an issue</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.name} ({issue.placement_count} placements)
              </option>
            ))}
          </select>
        </label>
        {detail && (
          <button type="button" onClick={exportPlacements}>
            Export CSV
          </button>
        )}
      </div>

      {!detail && (
        <div className="admin-analytics__empty">
          Create or select an issue to begin registering print placements.
        </div>
      )}

      {detail && (
        <>
          <div className="admin-analytics__metrics">
            <Metric
              label="QR scans"
              value={formatNumber(detail.metrics.scans)}
            />
            <Metric
              label="Approx. scanners"
              value={formatNumber(detail.metrics.approximate_scanners)}
            />
            <Metric
              label="Engaged scans"
              value={formatPercent(detail.metrics.engaged_scan_rate)}
            />
            <Metric
              label="Scans / 1,000 copies"
              value={formatNumber(detail.metrics.scans_per_thousand_copies)}
            />
            <Metric
              label="Average active time"
              value={
                detail.metrics.average_engaged_seconds === null
                  ? "—"
                  : `${detail.metrics.average_engaged_seconds}s`
              }
            />
            <Metric
              label="Average scroll"
              value={formatPercent(detail.metrics.average_scroll_percent)}
            />
          </div>

          {detail.unmatched_scan_count > 0 && (
            <div className="admin-analytics__notice">
              {detail.unmatched_scan_count} recorded scan
              {detail.unmatched_scan_count === 1 ? "" : "s"} could not yet be
              matched to a registered placement.
            </div>
          )}

          <div className="admin-analytics__split">
            <article className="admin-analytics__panel">
              <h3>Target language</h3>
              {detail.by_target_language.length === 0 ? (
                <p>No scans recorded yet.</p>
              ) : (
                <ul className="admin-analytics__breakdown">
                  {detail.by_target_language.map((row) => (
                    <li key={row.value}>
                      <span>{row.value.toUpperCase()}</span>
                      <strong>{formatNumber(row.count)}</strong>
                    </li>
                  ))}
                </ul>
              )}
              <h3 className="admin-analytics__subheading">
                Print → target language
              </h3>
              <ul className="admin-analytics__breakdown">
                {detail.by_language_path.map((row) => (
                  <li key={`${row.print_language}-${row.target_language}`}>
                    <span>
                      {row.print_language.toUpperCase()} →{" "}
                      {row.target_language.toUpperCase()}
                    </span>
                    <strong>{formatNumber(row.scans)}</strong>
                  </li>
                ))}
                {detail.by_language_path.length === 0 && (
                  <li>No placements registered yet.</li>
                )}
              </ul>
            </article>

            <article className="admin-analytics__panel">
              <h3>Add placement</h3>
              <form
                className="admin-analytics__placement-form"
                onSubmit={createPlacement}
              >
                <label>
                  Story
                  <select
                    required
                    value={placementForm.story_id}
                    onChange={(event) =>
                      setPlacementForm({
                        ...placementForm,
                        story_id: event.target.value,
                      })
                    }
                  >
                    <option value="">Choose a story</option>
                    {storyOptions.map((story) => (
                      <option key={story.id} value={story.id}>
                        {story.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Page
                  <input
                    type="number"
                    min="1"
                    value={placementForm.page_number}
                    onChange={(event) =>
                      setPlacementForm({
                        ...placementForm,
                        page_number: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Position
                  <input
                    placeholder="Top, center, full page…"
                    value={placementForm.position_label}
                    onChange={(event) =>
                      setPlacementForm({
                        ...placementForm,
                        position_label: event.target.value,
                      })
                    }
                  />
                </label>
                <label>
                  Print language
                  <select
                    value={placementForm.print_language}
                    onChange={(event) =>
                      setPlacementForm({
                        ...placementForm,
                        print_language: event.target.value,
                      })
                    }
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language} value={language}>
                        {language.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Target language
                  <select
                    value={placementForm.target_language}
                    onChange={(event) =>
                      setPlacementForm({
                        ...placementForm,
                        target_language: event.target.value,
                      })
                    }
                  >
                    {LANGUAGES.map((language) => (
                      <option key={language} value={language}>
                        {language.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-analytics__form-wide">
                  UTM content (optional)
                  <input
                    placeholder="story-slug_print-en_target-en"
                    value={placementForm.utm_content}
                    onChange={(event) =>
                      setPlacementForm({
                        ...placementForm,
                        utm_content: event.target.value,
                      })
                    }
                  />
                </label>
                <button type="submit">Add placement</button>
              </form>
            </article>
          </div>

          <div className="admin-analytics__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Page</th>
                  <th>Story</th>
                  <th>Print → target</th>
                  <th>Scans</th>
                  <th>Scanners</th>
                  <th>Engaged</th>
                  <th>Active time</th>
                  <th>Scroll</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {detail.placements.map((placement) => (
                  <tr key={placement.id}>
                    <td>
                      {placement.page_number || "—"}
                      {placement.position_label && (
                        <small>{placement.position_label}</small>
                      )}
                    </td>
                    <td>
                      <strong>{placement.title}</strong>
                      <small>{placement.slug}</small>
                    </td>
                    <td>
                      {placement.print_language.toUpperCase()} →{" "}
                      {placement.target_language.toUpperCase()}
                    </td>
                    <td>{formatNumber(placement.scans)}</td>
                    <td>{formatNumber(placement.approximate_scanners)}</td>
                    <td>{formatPercent(placement.engaged_scan_rate)}</td>
                    <td>
                      {placement.average_engaged_seconds === null
                        ? "—"
                        : `${placement.average_engaged_seconds}s`}
                    </td>
                    <td>{formatPercent(placement.average_scroll_percent)}</td>
                    <td>
                      <button
                        className="admin-analytics__danger-link"
                        type="button"
                        onClick={() => deletePlacement(placement)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {detail.placements.length === 0 && (
                  <tr>
                    <td colSpan="9">No placements registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
};

export default PrintAnalyticsPanel;
