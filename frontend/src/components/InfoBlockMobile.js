import React, { useMemo, useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import dojoSmartEn from "../assets/outreach/Dojo-Smartreach-En.png";
import dojoSmartEs from "../assets/outreach/Dojo-Smartreach-Es.png";
import dojoSmartZh from "../assets/outreach/Dojo-Smartreach-Zh.png";

import subscriptionSmartEn from "../assets/outreach/Subscription-Smartreach-En.png";
import subscriptionSmartEs from "../assets/outreach/Subscription-Smartreach-Es.png";
import subscriptionSmartZh from "../assets/outreach/Subscription-Smartreach-Zh.png";

import venmoSmartEn from "../assets/outreach/Venmo-Smartreach-En.png";
import venmoSmartEs from "../assets/outreach/Venmo-Smartreach-Es.png";
import venmoSmartZh from "../assets/outreach/Venmo-Smartreach-Zh.png";

import useInfoView from "../utils/useInfoView";
import { logInfoClick } from "../utils/infoEvents";

const SUBSCRIPTION_LINK = "https://buy.stripe.com/9B65kDcIjdtvg16cCZbQY04";

const VENMO_LINK =
  "https://www.paypal.com/qrcodes/venmocs/27e4b8c5-829d-4347-b684-46e3983b8c4f?created=1765840714&printed=true";

const sponsorsSmartreach = [
  {
    id: "subscription",
    byLang: {
      en: {
        image: subscriptionSmartEn,
        alt: "Subscribe to the Sunset Post",
        link: SUBSCRIPTION_LINK,
      },
      es: {
        image: subscriptionSmartEs,
        alt: "Suscríbete al Sunset Post",
        link: SUBSCRIPTION_LINK,
      },
      zh: {
        image: subscriptionSmartZh,
        alt: "订阅the Sunset Post",
        link: SUBSCRIPTION_LINK,
      },
    },
  },
  {
    id: "venmo",
    byLang: {
      en: {
        image: venmoSmartEn,
        alt: "Support local journalism",
        link: VENMO_LINK,
      },
      es: {
        image: venmoSmartEs,
        alt: "¡Apoya el periodismo local!",
        link: VENMO_LINK,
      },
      zh: {
        image: venmoSmartZh,
        alt: "支持本地新闻！",
        link: VENMO_LINK,
      },
    },
  },
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
];

const InfoBlockMobile = ({ lang }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const lastShownIdRef = useRef(null);

  const path = location.pathname + location.search;

  const stablePath = useMemo(() => {
    return location.pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";
  }, [location.pathname]);

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

  const pickId = pick?.id || "unknown";
  const banner = pick?.byLang?.[lang] || pick?.byLang?.en || null;

  const infoRef = useInfoView({
    slot: "mobile_info_banner",
    info_id: pickId,
    lng: lang,
    path,
  });

  if (!banner) return null;

  return (
    <>
      <div className="info-space" ref={infoRef}>
        <a
          href={banner.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            logInfoClick({
              slot: "mobile_info_banner",
              info_id: pickId,
              lng: lang,
              path,
              dest: banner.link,
            })
          }
        >
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
