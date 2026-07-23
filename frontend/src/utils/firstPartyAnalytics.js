import { baseURL } from "../config";
import { getVisitorToken } from "./visitorToken";

const isAdminSession = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("user"))?.admin);
  } catch {
    return false;
  }
};

export const recordAdEvent = ({
  event_type,
  campaign_key,
  slot,
  language,
  path,
  destination_url,
}) => {
  if (!baseURL || !campaign_key || !event_type || isAdminSession()) return;

  fetch(`${baseURL}/api/ad_events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event_type,
      campaign_key,
      slot,
      language: (language || "en").split("-")[0],
      path,
      destination_url,
      visitor_token: getVisitorToken(),
    }),
    keepalive: true,
  }).catch((error) => {
    console.warn("[AdAnalytics] Failed to record event:", error);
  });
};
