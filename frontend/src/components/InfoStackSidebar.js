import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import dojoEn from "../assets/outreach/Dojo-Localreach-En.png";
import dojoEs from "../assets/outreach/Dojo-Localreach-Es.png";
import dojoZh from "../assets/outreach/Dojo-Localreach-Zh.png";

import mbEn from "../assets/outreach/MariasBistro-Localreach-En.png";
import mbEs from "../assets/outreach/MariasBistro-Localreach-Es.png";
import mbZh from "../assets/outreach/MariasBistro-Localreach-Zh.png";

import localReachEN from "../assets/outreach/localreach-en.svg";
import localReachES from "../assets/outreach/localreach-es.svg";
import localReachZH from "../assets/outreach/localreach-zh.svg";

const sponsors = [
  {
    id: "dojo",
    byLang: {
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
    },
  },
  {
    id: "marias",
    byLang: {
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
    },
  },
];

const outreachImageByLang = {
  en: localReachEN,
  es: localReachES,
  zh: localReachZH,
};

const InfoStackSidebar = ({ lang }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const stablePath = useMemo(() => {
    return pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";
  }, [pathname]);

  const order = useMemo(() => {
    const ids = sponsors.map((s) => s.id);
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
    return ids;
  }, [stablePath]);

  const outreach = outreachImageByLang[lang] || localReachEN;

  return (
    <aside className="main-layout__sidebar">
      {order.map((id) => {
        const s = sponsors.find((x) => x.id === id);
        const variant = s?.byLang?.[lang] || s?.byLang?.en;
        if (!variant) return null;
        return (
          <div className="info-space" key={id}>
            <a href={variant.link} target="_blank" rel="noopener noreferrer">
              <img
                src={variant.image}
                alt={variant.alt}
                className="reach-image"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </a>
          </div>
        );
      })}

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
