const isProduction = process.env.NODE_ENV === "production";

export const baseURL = isProduction
  ? process.env.REACT_APP_API_PROD
  : process.env.REACT_APP_API_DEV;
