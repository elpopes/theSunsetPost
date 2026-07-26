import { baseURL } from "../config";
import { getVisitorToken } from "./visitorToken";

const isAdminSession = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("user"))?.admin);
  } catch {
    return false;
  }
};

const directAnalyticsEndpoint = () => {
  if (!baseURL) return null;
  return `${baseURL.replace(/\/$/, "")}/api/ad_events`;
};

const sameOriginAnalyticsEndpoint = () => {
  if (typeof window === "undefined" || !window.location?.origin) return null;
  return `${window.location.origin}/events/info`;
};

const postEvent = async (endpoint, payload) => {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });

  const contentType = response.headers.get("content-type") || "";
  const bodyText = await response.text();

  let body = null;
  if (contentType.includes("application/json") && bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = null;
    }
  }

  const recorded = response.status === 201 && body?.recorded === true;

  return {
    recorded,
    status: response.status,
    contentType,
    bodyText,
  };
};

export const recordAdEvent = ({
  event_type,
  campaign_key,
  slot,
  language,
  path,
  destination_url,
}) => {
  if (!campaign_key || !event_type || isAdminSession()) return;

  const payload = {
    event_type,
    campaign_key,
    slot,
    language: (language || "en").split("-")[0],
    path,
    destination_url,
    visitor_token: getVisitorToken(),
  };

  const sameOriginEndpoint = sameOriginAnalyticsEndpoint();
  const directEndpoint = directAnalyticsEndpoint();

  const record = async () => {
    if (sameOriginEndpoint) {
      try {
        const result = await postEvent(sameOriginEndpoint, payload);
        if (result.recorded) return;

        console.warn(
          `[AdAnalytics] Same-origin ${event_type} was not recorded (${result.status}, ${result.contentType || "unknown content type"}).`,
          result.bodyText,
        );
      } catch (error) {
        console.warn("[AdAnalytics] Same-origin request failed:", error);
      }
    }

    if (!directEndpoint || directEndpoint === sameOriginEndpoint) return;

    try {
      const result = await postEvent(directEndpoint, payload);
      if (result.recorded) return;

      console.warn(
        `[AdAnalytics] Direct ${event_type} was not recorded (${result.status}, ${result.contentType || "unknown content type"}).`,
        result.bodyText,
      );
    } catch (error) {
      console.warn("[AdAnalytics] Direct request failed:", error);
    }
  };

  record();
};
