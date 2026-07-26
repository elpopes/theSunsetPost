import { baseURL } from "../config";
import { getVisitorToken } from "./visitorToken";

const activePixels = new Set();

const isAdminSession = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("user"))?.admin);
  } catch {
    return false;
  }
};

const pixelEndpoint = () => {
  if (!baseURL) return null;
  return `${baseURL.replace(/\/$/, "")}/api/ad_events/pixel.gif`;
};

const sendPixel = (endpoint, payload) => {
  const query = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  query.set("_", `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const pixel = new Image();
  activePixels.add(pixel);

  const release = () => activePixels.delete(pixel);
  pixel.onload = release;
  pixel.onerror = release;
  pixel.src = `${endpoint}?${query.toString()}`;
};

export const recordAdEvent = ({
  event_type,
  campaign_key,
  slot,
  language,
  path,
  destination_url,
}) => {
  const endpoint = pixelEndpoint();
  if (!endpoint || !campaign_key || !event_type || isAdminSession()) return;

  sendPixel(endpoint, {
    event_type,
    campaign_key,
    slot,
    language: (language || "en").split("-")[0],
    path,
    destination_url,
    visitor_token: getVisitorToken(),
  });
};
