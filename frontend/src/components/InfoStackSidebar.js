import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import dojoEn from "../assets/outreach/Dojo-Localreach-En.png";
import dojoEs from "../assets/outreach/Dojo-Localreach-Es.png";
import dojoZh from "../assets/outreach/Dojo-Localreach-Zh.png";

import localReachEN from "../assets/outreach/localreach-en.svg";
import localReachES from "../assets/outreach/localreach-es.svg";
import localReachZH from "../assets/outreach/localreach-zh.svg";

const dojoImageByLang = {
  en: {
    image: dojoEn,
    alt: "Brooklyn Aikikai",
    link: "https://brooklynaikikai.com",
  },
  es: {
    image: dojoEs,
    alt: "Brooklyn Aikikai",
    link: "https://brooklynaikikai.com",
  },
  zh: {
    image: dojoZh,
    alt: "Brooklyn Aikikai",
    link: "https://brooklynaikikai.com",
  },
};

const outreachImageByLang = {
  en: localReachEN,
  es: localReachES,
  zh: localReachZH,
};

const InfoStackSidebar = ({ lang }) => {
  const { t } = useTranslation();

  const dojo = dojoImageByLang[lang] || dojoImageByLang.en;
  const outreach = outreachImageByLang[lang] || localReachEN;

  return (
    <aside className="main-layout__sidebar">
      <div className="info-space">
        <a href={dojo.link} target="_blank" rel="noopener noreferrer">
          <img
            src={dojo.image}
            alt={dojo.alt}
            className="reach-image"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </a>
      </div>

      <div className="info-space">
        <Link to={`/${lang}/contact`}>
          <img
            src={outreach}
            alt={t("Advertise with us")}
            className="reach-image"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Link>
      </div>

      <p className="info-link">
        <Link to={`/${lang}/contact`}>
          {t("Contact us to feature your message")}
        </Link>
      </p>
    </aside>
  );
};

export default InfoStackSidebar;
