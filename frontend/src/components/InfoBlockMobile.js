import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import dojoSmartEn from "../assets/outreach/Dojo-Smartreach-En.png";
import dojoSmartEs from "../assets/outreach/Dojo-Smartreach-Es.png";
import dojoSmartZh from "../assets/outreach/Dojo-Smartreach-Zh.png";

const dojoBannerByLang = {
  en: {
    image: dojoSmartEn,
    alt: "Brooklyn Aikikai",
    link: "https://brooklynaikikai.com",
  },
  es: {
    image: dojoSmartEs,
    alt: "Brooklyn Aikikai",
    link: "https://brooklynaikikai.com",
  },
  zh: {
    image: dojoSmartZh,
    alt: "Brooklyn Aikikai",
    link: "https://brooklynaikikai.com",
  },
};

const InfoBlockMobile = ({ lang }) => {
  const { t } = useTranslation();
  const banner = dojoBannerByLang[lang] || dojoBannerByLang.en;

  return (
    <>
      <div className="info-space">
        <a href={banner.link} target="_blank" rel="noopener noreferrer">
          <img
            src={banner.image}
            alt={banner.alt}
            className="reach-image"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </a>
      </div>
      <p className="info-link">
        <Link to={`/${lang}/contact`}>
          {t("Contact us to feature your message")}
        </Link>
      </p>
    </>
  );
};

export default InfoBlockMobile;
