import React from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { normalizeSeoLanguage } from "./SeoHead";

const SITE_URL = "https://www.sunsetpost.org";
const LANGUAGES = ["en", "es", "zh"];

const COPY = {
  en: {
    homeTitle: "The Sunset Post | Sunset Park, Brooklyn News",
    homeDescription:
      "Hyperlocal news and community information for Sunset Park, Brooklyn, published in English, Spanish and Chinese.",
    aboutTitle: "About | The Sunset Post",
    aboutDescription:
      "Learn about the Sunset Post and our trilingual, community-powered journalism in Sunset Park, Brooklyn.",
    contactTitle: "Contact | The Sunset Post",
    contactDescription:
      "Contact the Sunset Post with story tips, community questions, feedback or advertising inquiries.",
  },
  es: {
    homeTitle: "The Sunset Post | Noticias de Sunset Park, Brooklyn",
    homeDescription:
      "Noticias hiperlocales e información comunitaria de Sunset Park, Brooklyn, publicadas en inglés, español y chino.",
    aboutTitle: "Sobre nosotros | The Sunset Post",
    aboutDescription:
      "Conoce al Sunset Post y nuestro periodismo comunitario y trilingüe en Sunset Park, Brooklyn.",
    contactTitle: "Contacto | The Sunset Post",
    contactDescription:
      "Contacta al Sunset Post con pistas, preguntas de la comunidad, comentarios o consultas sobre publicidad.",
  },
  zh: {
    homeTitle: "The Sunset Post | 布鲁克林日落公园新闻",
    homeDescription:
      "面向布鲁克林日落公园社区的超本地新闻与社区信息，以英文、西班牙文和中文发布。",
    aboutTitle: "关于我们 | The Sunset Post",
    aboutDescription:
      "了解 The Sunset Post 以及我们在布鲁克林日落公园开展的三语社区新闻工作。",
    contactTitle: "联系我们 | The Sunset Post",
    contactDescription:
      "联系 The Sunset Post，提供新闻线索、社区问题、意见反馈或广告咨询。",
  },
};

const withoutLanguagePrefix = (pathname) =>
  pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";

const localizedUrl = (language, path) => {
  const suffix = path === "/" ? "" : path.replace(/\/$/, "");
  return `${SITE_URL}/${language}${suffix}`;
};

const GlobalSeo = () => {
  const location = useLocation();
  const { i18n } = useTranslation();
  const language = normalizeSeoLanguage(i18n.resolvedLanguage || i18n.language);
  const path = withoutLanguagePrefix(location.pathname);
  const copy = COPY[language];

  let title = null;
  let description = null;

  if (path === "/") {
    title = copy.homeTitle;
    description = copy.homeDescription;
  } else if (path === "/about") {
    title = copy.aboutTitle;
    description = copy.aboutDescription;
  } else if (path === "/contact") {
    title = copy.contactTitle;
    description = copy.contactDescription;
  }

  const canonical = localizedUrl(language, path);

  return (
    <Helmet>
      {title && <title>{title}</title>}
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
      <link rel="alternate" hrefLang="x-default" href={localizedUrl("en", path)} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={language === "zh" ? "zh_CN" : language === "es" ? "es_US" : "en_US"} />
    </Helmet>
  );
};

export default GlobalSeo;
