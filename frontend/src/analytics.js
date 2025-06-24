import ReactGA from "react-ga4";

export const initGA = () => {
  const trackingId = process.env.REACT_APP_GA_ID;
  if (trackingId) {
    ReactGA.initialize(trackingId);
  } else {
    console.warn("Google Analytics ID not found.");
  }
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
