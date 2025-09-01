import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// Dojo (existing)
import dojoEn from "../assets/outreach/Dojo-Localreach-En.png";
import dojoEs from "../assets/outreach/Dojo-Localreach-Es.png";
import dojoZh from "../assets/outreach/Dojo-Localreach-Zh.png";

// Maria’s Bistro (new)
import mbEn from "../assets/outreach/MariasBistro-Localreach-En.png";
import mbEs from "../assets/outreach/MariasBistro-Localreach-Es.png";
import mbZh from "../assets/outreach/MariasBistro-Localreach-Zh.png";

import localReachEN from "../assets/outreach/localreach-en.svg";
import localReachES from "../assets/outreach/localreach-es.svg";
import localReachZH from "../assets/outreach/localreach-zh.svg";

const dojoByLang = {
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

const mariasByLang = {
  en: {
    image: mbEn,
    alt: "Maria’s Bistro Mexicano",
    link: "http://www.mariasbistromexicano.net/",
  },
  es: {
    image: mbEs,
    alt: "Maria’s Bistro Mexicano",
    link: "http://www.mariasbistromexicano.net/",
  },
  zh: {
    image: mbZh,
    alt: "Maria’s Bistro Mexicano",
    link: "http://www.mariasbistromexicano.net/",
  },
};

const outreachImageByLang = {
  en: localReachEN,
  es: localReachES,
  zh: localReachZH,
};

const InfoStackSidebar = ({ lang }) => {
  const { t } = useTranslation();

  const dojo = dojoByLang[lang] || dojoByLang.en;
  const marias = mariasByLang[lang] || mariasByLang.en;
  const outreach = outreachImageByLang[lang] || localReachEN;

  return (
    <aside className="main-layout__sidebar">
      {/* Sponsor 1: Dojo */}
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

      {/* Sponsor 2: Maria’s Bistro */}
      <div className="info-space">
        <a href={marias.link} target="_blank" rel="noopener noreferrer">
          <img
            src={marias.image}
            alt={marias.alt}
            className="reach-image"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </a>
      </div>

      {/* House outreach promo */}
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
