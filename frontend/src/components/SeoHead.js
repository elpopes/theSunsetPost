import React from "react";
import { Helmet } from "react-helmet";

const SITE_URL = "https://www.sunsetpost.org";
const LANGUAGES = ["en", "es", "zh"];

export const normalizeSeoLanguage = (language = "en") => {
  const value = String(language).toLowerCase();
  if (value.startsWith("es")) return "es";
  if (value.startsWith("zh")) return "zh";
  return "en";
};

const cleanPath = (path = "") => {
  const value = path.startsWith("/") ? path : `/${path}`;
  return value === "/" ? "" : value.replace(/\/$/, "");
};

const localizedUrl = (language, path) =>
  `${SITE_URL}/${language}${cleanPath(path)}`;

const SeoHead = ({
  language = "en",
  path = "",
  title,
  description,
  image,
  type = "website",
  publishedTime,
}) => {
  const lang = normalizeSeoLanguage(language);
  const canonical = localizedUrl(lang, path);

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      {LANGUAGES.map((alternateLanguage) => (
        <link
          key={alternateLanguage}
          rel="alternate"
          hrefLang={alternateLanguage}
          href={localizedUrl(alternateLanguage, path)}
        />
      ))}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={localizedUrl("en", path)}
      />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={lang === "zh" ? "zh_CN" : lang === "es" ? "es_US" : "en_US"} />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      {publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
    </Helmet>
  );
};

export default SeoHead;
