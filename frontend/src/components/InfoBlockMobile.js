import React, { useMemo, useRef, useEffect, useState } from "react";
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

  const stablePath = useMemo(() => {
    return pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";
  }, [pathname]);

  const [pick, setPick] = useState(() => sponsorsSmartreach[0] || null);

  useEffect(() => {
    const arr = sponsorsSmartreach;

    if (arr.length === 0) {
      setPick(null);
      lastShownIdRef.current = null;
      return;
    }

    if (arr.length === 1) {
      setPick(arr[0]);
      lastShownIdRef.current = arr[0].id;
      return;
    }

    const lastId = lastShownIdRef.current;
    const candidates = lastId ? arr.filter((s) => s.id !== lastId) : arr;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    setPick(chosen);
    lastShownIdRef.current = chosen.id;
  }, [stablePath]);

  const banner = pick?.byLang?.[lang] || pick?.byLang?.en;
  if (!banner) return null;

  return (
    <>
      <div className="info-space">
        <a href={banner.link} target="_blank" rel="noopener noreferrer">
          <img
            src={banner.image}
            alt={banner.alt}
            className="reach-image"
            loading="lazy"
            decoding="async"
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
