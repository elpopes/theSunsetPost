import ReactGA from "react-ga4";

let gaInitialized = false;
let lastPagePath = null;

const REDIRECT_ONLY_PATHS = new Set(["/classifieds", "/sections/classifieds"]);

export const initGA = () => {
  if (gaInitialized) return;

  const trackingId = process.env.REACT_APP_GA_ID;
  if (trackingId) {
    ReactGA.initialize(trackingId);
    gaInitialized = true;
  } else {
    console.warn("Google Analytics ID not found.");
  }
};

export const logPageView = (path) => {
  if (!gaInitialized) return;

  const pathnameOnly = path.split("?")[0];
  if (REDIRECT_ONLY_PATHS.has(pathnameOnly)) return;

  if (path === lastPagePath) return;
  lastPagePath = path;

  ReactGA.send({
    hitType: "pageview",
    page: path,
    page_location: window.location.origin + path,
    page_title: document.title,
  });
};

export const logEvent = (name, params = {}) => {
  if (!gaInitialized) return;
  ReactGA.event(name, params);
};
