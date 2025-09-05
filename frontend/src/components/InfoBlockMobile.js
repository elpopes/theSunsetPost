import React, { useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import dojoSmartEn from "../assets/outreach/Dojo-Smartreach-En.png";
import dojoSmartEs from "../assets/outreach/Dojo-Smartreach-Es.png";
import dojoSmartZh from "../assets/outreach/Dojo-Smartreach-Zh.png";

import mbSmartEn from "../assets/outreach/MariasBistro-Smartreach-En.png";
import mbSmartEs from "../assets/outreach/MariasBistro-Smartreach-Es.png";
import mbSmartZh from "../assets/outreach/MariasBistro-Smartreach-Zh.png";

const sponsorsSmartreach = [
  {
    id: "dojo",
    byLang: {
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
    },
  },
  {
    id: "marias-bistro",
    byLang: {
      en: {
        image: mbSmartEn,
        alt: "Maria’s Bistro Mexicano",
        link: "http://www.mariasbistromexicano.net/",
      },
      es: {
        image: mbSmartEs,
        alt: "Maria’s Bistro Mexicano",
        link: "http://www.mariasbistromexicano.net/",
      },
      zh: {
        image: mbSmartZh,
        alt: "Maria’s Bistro Mexicano",
        link: "http://www.mariasbistromexicano.net/",
      },
    },
  },
];

const InfoBlockMobile = ({ lang }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const lastShownIdRef = useRef(null);

  const pick = useMemo(() => {
    const arr = [...sponsorsSmartreach];
    // shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // avoid repeating the same sponsor consecutively
    let chosen = arr[0];
    if (
      lastShownIdRef.current &&
      arr.length > 1 &&
      chosen.id === lastShownIdRef.current
    ) {
      chosen = arr[1];
    }
    return chosen;
  }, [pathname]);

  useEffect(() => {
    lastShownIdRef.current = pick.id;
  }, [pick]);

  const banner = pick.byLang[lang] || pick.byLang.en;

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
