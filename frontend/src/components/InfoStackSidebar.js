import React, { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import dojoEn from "../assets/outreach/Dojo-Localreach-En.png";
import dojoEs from "../assets/outreach/Dojo-Localreach-Es.png";
import dojoZh from "../assets/outreach/Dojo-Localreach-Zh.png";

import subEn from "../assets/outreach/Subscription-Localreach-En.png";
import subEs from "../assets/outreach/Subscription-Localreach-Es.png";
import subZh from "../assets/outreach/Subscription-Localreach-Zh.png";

import venmoEn from "../assets/outreach/Venmo-Localreach-En.png";
import venmoEs from "../assets/outreach/Venmo-Localreach-Es.png";
import venmoZh from "../assets/outreach/Venmo-Localreach-Zh.png";

import localReachEN from "../assets/outreach/localreach-en.svg";
import localReachES from "../assets/outreach/localreach-es.svg";
import localReachZH from "../assets/outreach/localreach-zh.svg";

import useInfoView from "../utils/useInfoView";
import { logInfoClick } from "../utils/infoEvents";

const STRIPE_SUBSCRIBE_URL = "https://buy.stripe.com/9B65kDcIjdtvg16cCZbQY04";

const VENMO_URL =
  "https://www.paypal.com/qrcodes/venmocs/27e4b8c5-829d-4347-b684-46e3983b8c4f?created=1765840714&printed=true";

const placements = [
  {
    id: "subscription",
    byLang: {
      en: {
        image: subEn,
        alt: "Subscribe to the Sunset Post",
        href: STRIPE_SUBSCRIBE_URL,
        external: true,
      },
      es: {
        image: subEs,
        alt: "Suscríbete al Sunset Post",
        href: STRIPE_SUBSCRIBE_URL,
        external: true,
      },
      zh: {
        image: subZh,
        alt: "订阅the Sunset Post",
        href: STRIPE_SUBSCRIBE_URL,
        external: true,
      },
    },
  },
  {
    id: "venmo",
    byLang: {
      en: {
        image: venmoEn,
        alt: "Support local journalism",
        href: VENMO_URL,
        external: true,
      },
      es: {
        image: venmoEs,
        alt: "¡Apoya el periodismo local!",
        href: VENMO_URL,
        external: true,
      },
      zh: {
        image: venmoZh,
        alt: "支持本地新闻！",
        href: VENMO_URL,
        external: true,
      },
    },
  },
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

const TrackedInfoTile = ({ variant, id, idx, lang, path }) => {
  const infoRef = useInfoView({
    slot: "sidebar_info_stack",
    info_id: id,
    lng: lang,
    path,
  });

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
    <div className="info-space" ref={infoRef}>
      {variant.external ? (
        <a
          href={variant.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            logInfoClick({
              slot: "sidebar_info_stack",
              info_id: id,
              lng: lang,
              path,
              dest: variant.href,
            })
          }
        >
          {img}
        </a>
      ) : (
        <Link
          to={`/${lang}${variant.href}`}
          onClick={() =>
            logInfoClick({
              slot: "sidebar_info_stack",
              info_id: id,
              lng: lang,
              path,
              dest: `/${lang}${variant.href}`,
            })
          }
        >
          {img}
        </Link>
      )}
    </div>
  );
};

const InfoStackSidebar = ({ lang }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const path = location.pathname + location.search;

  const stablePath = useMemo(() => {
    return location.pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";
  }, [location.pathname]);

  const placementIds = useMemo(() => placements.map((p) => p.id), []);
  const placementById = useMemo(() => {
    return Object.fromEntries(placements.map((p) => [p.id, p]));
  }, []);

  const [order, setOrder] = useState(() => shuffle(placementIds));

  useEffect(() => {
    if (placementIds.length === 0) {
      setOrder([]);
      return;
    }

    if (placementIds.length === 1) {
      setOrder(placementIds);
      return;
    }

    setOrder(shuffle(placementIds));
  }, [stablePath, placementIds]);

  const outreach = outreachImageByLang[lang] || localReachEN;

  const houseRef = useInfoView({
    slot: "sidebar_info_house",
    info_id: "localreach",
    lng: lang,
    path,
  });

  return (
    <aside className="main-layout__sidebar">
      {order.map((id, idx) => {
        const p = placementById[id];
        const variant = p?.byLang?.[lang] || p?.byLang?.en;
        if (!variant) return null;

        return (
          <TrackedInfoTile
            key={id}
            id={id}
            idx={idx}
            variant={variant}
            lang={lang}
            path={path}
          />
        );
      })}

      <div className="info-space" ref={houseRef}>
        <Link
          to={`/${lang}/contact`}
          onClick={() =>
            logInfoClick({
              slot: "sidebar_info_house",
              info_id: "localreach",
              lng: lang,
              path,
              dest: `/${lang}/contact`,
            })
          }
        >
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
