import { baseURL } from "../config";
import { getVisitorToken } from "./visitorToken";

const isAdminSession = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("user"))?.admin);
  } catch {
    return false;
  }
};

const analyticsEndpoint = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/events/info`;
  }

  if (!baseURL) return null;
  return `${baseURL.replace(/\/$/, "")}/api/ad_events`;
};

export const recordAdEvent = ({
  event_type,
  campaign_key,
  slot,
  language,
  path,
  destination_url,
}) => {
  const endpoint = analyticsEndpoint();
  if (!endpoint || !campaign_key || !event_type || isAdminSession()) return;

  const payload = {
    event_type,
    campaign_key,
    slot,
    language: (language || "en").split("-")[0],
    path,
    destination_url,
    visitor_token: getVisitorToken(),
  };

  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  })
    .then(async (response) => {
      if (response.ok) return;

      let detail = "";
      try {
        detail = await response.text();
      } catch {
        // The status code is still useful when the response body is unavailable.
      }

      console.warn(
        `[AdAnalytics] ${event_type} was not recorded (${response.status}).`,
        detail,
      );
    })
    .catch((error) => {
      console.warn("[AdAnalytics] Failed to record event:", error);
    });
};
