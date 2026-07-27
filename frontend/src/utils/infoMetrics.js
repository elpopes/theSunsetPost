import { baseURL } from "../config";
import { getVisitorToken } from "./visitorToken";

const isAdminSession = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("user"))?.admin);
  } catch {
    return false;
  }
};

const endpoint = () => {
  if (!baseURL) return null;
  return `${baseURL.replace(/\/$/, "")}/api/info`;
};

const buildBody = (payload) => {
  const body = new URLSearchParams();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      body.append(key, String(value));
    }
  });

  return body;
};

export const recordInfoEvent = ({
  kind,
  content_id,
  slot,
  lang,
  path,
  dest,
}) => {
  const url = endpoint();
  if (!url || !kind || !content_id || isAdminSession()) return;

  const body = buildBody({
    kind,
    content_id,
    slot,
    lang: (lang || "en").split("-")[0],
    path,
    dest,
    visitor: getVisitorToken(),
  });

  if (navigator.sendBeacon?.(url, body)) return;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body,
    keepalive: true,
  }).catch((error) => {
    console.warn("[InfoMetrics] Request failed:", error);
  });
};
