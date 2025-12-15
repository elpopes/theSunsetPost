import React, { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import dojoEn from "../assets/outreach/Dojo-Localreach-En.png";
import dojoEs from "../assets/outreach/Dojo-Localreach-Es.png";
import dojoZh from "../assets/outreach/Dojo-Localreach-Zh.png";

import mbEn from "../assets/outreach/MariasBistro-Localreach-En.png";
import mbEs from "../assets/outreach/MariasBistro-Localreach-Es.png";
import mbZh from "../assets/outreach/MariasBistro-Localreach-Zh.png";

import subEn from "../assets/outreach/Subscription-Localreach-En.png";
import subEs from "../assets/outreach/Subscription-Localreach-Es.png";
import subZh from "../assets/outreach/Subscription-Localreach-Zh.png";

import localReachEN from "../assets/outreach/localreach-en.svg";
import localReachES from "../assets/outreach/localreach-es.svg";
import localReachZH from "../assets/outreach/localreach-zh.svg";

const STRIPE_SUBSCRIBE_URL = "https://buy.stripe.com/9B65kDcIjdtvg16cCZbQY04";

const placements = [
  {
    id: "dojo",
    byLang: {
      en: {
        image: dojoEn,
        alt: "Brooklyn Aikikai",
        href: "https://brooklynaikikai.com",
        external: true,
      },
      es: {
        image: dojoEs,
        alt: "Brooklyn Aikikai",
        href: "https://brooklynaikikai.com",
        external: true,
      },
      zh: {
        image: dojoZh,
        alt: "Brooklyn Aikikai",
        href: "https://brooklynaikikai.com",
        external: true,
      },
    },
  },
  {
    id: "marias",
    byLang: {
      en: {
        image: mbEn,
        alt: "Maria’s Bistro Mexicano",
        href: "http://www.mariasbistromexicano.net/",
        external: true,
      },
      es: {
        image: mbEs,
        alt: "Maria’s Bistro Mexicano",
        href: "http://www.mariasbistromexicano.net/",
        external: true,
      },
      zh: {
        image: mbZh,
        alt: "Maria’s Bistro Mexicano",
        href: "http://www.mariasbistromexicano.net/",
        external: true,
      },
    },
  },
  {
    id: "subscription",
    byLang: {
      en: {
        image: subEn,
        alt: "Subscribe",
        href: STRIPE_SUBSCRIBE_URL,
        external: true,
      },
      es: {
        image: subEs,
        alt: "Subscribe",
        href: STRIPE_SUBSCRIBE_URL,
        external: true,
      },
      zh: {
        image: subZh,
        alt: "Subscribe",
        href: STRIPE_SUBSCRIBE_URL,
        external: true,
      },
    },
  },
];

const outreachImageByLang = {
  en: localReachEN,
  es: localReachES,
  zh: localReachZH,
};

const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const InfoStackSidebar = ({ lang }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const stablePath = useMemo(() => {
    return pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";
  }, [pathname]);

  const placementIds = useMemo(() => placements.map((p) => p.id), []);
  const placementById = useMemo(() => {
    return Object.fromEntries(placements.map((p) => [p.id, p]));
  }, []);

  const [order, setOrder] = useState(() => shuffle(placementIds));

  useEffect(() => {
    if (placementIds.length <= 1) {
      setOrder(placementIds);
      return;
    }

    setOrder((prev) => {
      const prevFirst = prev?.[0] || null;
      let next = shuffle(placementIds);

      // Avoid repeating the same first tile as last render
      if (prevFirst && next[0] === prevFirst) {
        const alt = next.findIndex((x) => x !== prevFirst);
        if (alt > 0) [next[0], next[alt]] = [next[alt], next[0]];
      }

      return next;
    });
  }, [stablePath, placementIds]);

  const outreach = outreachImageByLang[lang] || localReachEN;

  return (
    <aside className="main-layout__sidebar">
      {order.map((id, idx) => {
        const p = placementById[id];
        const variant = p?.byLang?.[lang] || p?.byLang?.en;
        if (!variant) return null;

        const isAboveFold = idx < 2;

        const img = (
          <img
            src={variant.image}
            alt={variant.alt}
            className="sidebar-image"
            loading={isAboveFold ? "eager" : "lazy"}
            decoding="async"
          />
        );

        return (
          <div className="info-space" key={id}>
            {variant.external ? (
              <a href={variant.href} target="_blank" rel="noopener noreferrer">
                {img}
              </a>
            ) : (
              <Link to={`/${lang}${variant.href}`}>{img}</Link>
            )}
          </div>
        );
      })}

      <div className="info-space">
        <Link to={`/${lang}/contact`}>
          <img
            src={outreach}
            alt={t("Advertise with us")}
            className="sidebar-image"
            loading="eager"
            decoding="async"
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
