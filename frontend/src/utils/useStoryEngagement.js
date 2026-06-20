import { useEffect, useRef } from "react";
import { baseURL } from "../config";
import { getVisitorToken } from "./visitorToken";

const ACTIVITY_WINDOW_MS = 60_000;
const HEARTBEAT_MS = 15_000;
const TICK_MS = 1_000;
const MAX_ENGAGED_SECONDS = 4 * 60 * 60;

const getReferrer = () => {
  try {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const initialPath = navigationEntry
      ? new URL(navigationEntry.name).pathname
      : window.location.pathname;

    if (initialPath !== window.location.pathname) {
      return `${window.location.origin}/`;
    }
  } catch {
    // Fall back to the browser-provided referrer.
  }

  return document.referrer;
};

export default function useStoryEngagement({
  storyId,
  language,
  enabled = true,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !storyId || typeof window === "undefined") return undefined;

    const visitorToken = getVisitorToken();
    let viewId = null;
    let disposed = false;
    let engagedSeconds = 0;
    let maxScrollPercent = 0;
    let lastActivityAt = Date.now();
    let lastHeartbeatAt = Date.now();
    let lastTickAt = Date.now();
    let lastSentSeconds = -1;
    let lastSentScroll = -1;

    const engagementUrl = () =>
      `${baseURL}/api/stories/${storyId}/views/${viewId}/engagement`;

    const updateScrollDepth = () => {
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const elementTop = window.scrollY + rect.top;
      const viewportBottom = window.scrollY + window.innerHeight;
      const reached = viewportBottom - elementTop;
      const percent =
        element.offsetHeight > 0
          ? Math.round((reached / element.offsetHeight) * 100)
          : 0;

      maxScrollPercent = Math.max(
        maxScrollPercent,
        Math.min(100, Math.max(0, percent))
      );
    };

    const engagementPayload = () => ({
      visitor_token: visitorToken,
      engaged_seconds: Math.min(
        MAX_ENGAGED_SECONDS,
        Math.floor(engagedSeconds)
      ),
      max_scroll_percent: maxScrollPercent,
    });

    const sendEngagement = (useBeacon = false) => {
      if (!viewId) return;

      const payload = engagementPayload();
      if (
        payload.engaged_seconds === lastSentSeconds &&
        payload.max_scroll_percent === lastSentScroll
      ) {
        return;
      }

      lastSentSeconds = payload.engaged_seconds;
      lastSentScroll = payload.max_scroll_percent;

      if (useBeacon && navigator.sendBeacon) {
        const body = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
          body.append(key, String(value));
        });
        navigator.sendBeacon(engagementUrl(), body);
        return;
      }

      fetch(engagementUrl(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch((error) => {
        console.warn("[StoryEngagement] Failed to update engagement:", error);
      });
    };

    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.min((now - lastTickAt) / 1000, 5);
      lastTickAt = now;

      if (
        document.visibilityState === "visible" &&
        now - lastActivityAt <= ACTIVITY_WINDOW_MS
      ) {
        engagedSeconds += elapsedSeconds;
      }

      updateScrollDepth();

      if (now - lastHeartbeatAt >= HEARTBEAT_MS) {
        lastHeartbeatAt = now;
        sendEngagement();
      }
    };

    const markActivity = () => {
      lastActivityAt = Date.now();
      updateScrollDepth();
    };

    const handleVisibilityChange = () => {
      tick();

      if (document.visibilityState === "hidden") {
        sendEngagement(true);
      } else {
        lastTickAt = Date.now();
        lastActivityAt = Date.now();
      }
    };

    const handlePageHide = () => {
      tick();
      sendEngagement(true);
    };

    const createView = async () => {
      try {
        const response = await fetch(
          `${baseURL}/api/stories/${storyId}/views`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              visitor_token: visitorToken,
              language,
              path: window.location.pathname,
              query_string: window.location.search,
              referrer: getReferrer(),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Story view request failed with ${response.status}`);
        }

        const result = await response.json();
        if (disposed) return;

        viewId = result.view_id;
        updateScrollDepth();
      } catch (error) {
        console.warn("[StoryEngagement] Failed to record story view:", error);
      }
    };

    const intervalId = window.setInterval(tick, TICK_MS);
    window.addEventListener("scroll", markActivity, { passive: true });
    window.addEventListener("pointerdown", markActivity, { passive: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("touchstart", markActivity, { passive: true });
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    updateScrollDepth();
    createView();

    return () => {
      tick();
      sendEngagement(true);
      disposed = true;
      window.clearInterval(intervalId);
      window.removeEventListener("scroll", markActivity);
      window.removeEventListener("pointerdown", markActivity);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("touchstart", markActivity);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, language, storyId]);

  return containerRef;
}
