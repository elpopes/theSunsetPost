import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import NewsletterSignup from "./NewsletterSignup";

import beyondCareSmartEn from "../assets/outreach/BeyondCare-Smartreach-En.png";
import beyondCareSmartEs from "../assets/outreach/BeyondCare-Smartreach-Es.png";
import beyondCareSmartZh from "../assets/outreach/BeyondCare-Smartreach-Zh.png";

import subscriptionSmartEn from "../assets/outreach/Subscription-Smartreach-En.png";
import subscriptionSmartEs from "../assets/outreach/Subscription-Smartreach-Es.png";
import subscriptionSmartZh from "../assets/outreach/Subscription-Smartreach-Zh.png";

import venmoSmartEn from "../assets/outreach/Venmo-Smartreach-En.png";
import venmoSmartEs from "../assets/outreach/Venmo-Smartreach-Es.png";
import venmoSmartZh from "../assets/outreach/Venmo-Smartreach-Zh.png";

import ymcaSmartEn from "../assets/outreach/YMCA-Smartreach-En.jpg";
import ymcaSmartEs from "../assets/outreach/YMCA-Smartreach-Es.jpg";
import ymcaSmartZh from "../assets/outreach/YMCA-Smartreach-Zh.jpg";

import birthdaySmartEn from "../assets/outreach/Birthday-Smartreach-En.png";
import birthdaySmartEs from "../assets/outreach/Birthday-Smartreach-Es.png";
import birthdaySmartZh from "../assets/outreach/Birthday-Smartreach-Zh.png";

import youngDancersSmartEn from "../assets/outreach/YoungDancers-Smartreach-En.png";
import youngDancersSmartEs from "../assets/outreach/YoungDancers-Smartreach-Es.png";
import youngDancersSmartZh from "../assets/outreach/YoungDancers-Smartreach-Zh.png";

import useInfoView from "../utils/useInfoView";
import { logInfoClick } from "../utils/infoEvents";

const SUBSCRIPTION_LINK = "https://buy.stripe.com/9B65kDcIjdtvg16cCZbQY04";

const VENMO_LINK =
  "https://www.paypal.com/qrcodes/venmocs/27e4b8c5-829d-4347-b684-46e3983b8c4f?created=1765840714&printed=true";

const BEYOND_CARE_LINK = "https://beyondcare.coop/";

const YMCA_LINK = "https://ymcanyc.org/events/open-house-schedules";

const BIRTHDAY_LINK = "https://givebutter.com/sunsetpost";

const YOUNG_DANCERS_LINK = "https://youngdancersinrep.org/center-for-dance-studies-2/";

const sponsorsSmartreach = [
  {
    id: "birthday",
    byLang: {
      en: { image: birthdaySmartEn, alt: "The Sunset Post first birthday party", link: BIRTHDAY_LINK },
      es: { image: birthdaySmartEs, alt: "Fiesta del primer aniversario de the Sunset Post", link: BIRTHDAY_LINK },
      zh: { image: birthdaySmartZh, alt: "the Sunset Post 一周年庆祝活动", link: BIRTHDAY_LINK },
    },
  },
  {
    id: "youngdancers",
    byLang: {
      en: { image: youngDancersSmartEn, alt: "Young Dancers in Repertory kids dance classes", link: YOUNG_DANCERS_LINK },
      es: { image: youngDancersSmartEs, alt: "Clases de danza para niños de Young Dancers in Repertory", link: YOUNG_DANCERS_LINK },
      zh: { image: youngDancersSmartZh, alt: "Young Dancers in Repertory 儿童舞蹈课程", link: YOUNG_DANCERS_LINK },
    },
  },
  {
    id: "subscription",
    byLang: {
      en: { image: subscriptionSmartEn, alt: "Subscribe to the Sunset Post", link: SUBSCRIPTION_LINK },
      es: { image: subscriptionSmartEs, alt: "Suscríbete al Sunset Post", link: SUBSCRIPTION_LINK },
      zh: { image: subscriptionSmartZh, alt: "订阅the Sunset Post", link: SUBSCRIPTION_LINK },
    },
  },
  {
    id: "venmo",
    byLang: {
      en: { image: venmoSmartEn, alt: "Support local journalism", link: VENMO_LINK },
      es: { image: venmoSmartEs, alt: "¡Apoya el periodismo local!", link: VENMO_LINK },
      zh: { image: venmoSmartZh, alt: "支持本地新闻！", link: VENMO_LINK },
    },
  },
  {
    id: "beyondcare",
    byLang: {
      en: { image: beyondCareSmartEn, alt: "Beyond Care Childcare Cooperative", link: BEYOND_CARE_LINK },
      es: { image: beyondCareSmartEs, alt: "Beyond Care Childcare Cooperative", link: BEYOND_CARE_LINK },
      zh: { image: beyondCareSmartZh, alt: "Beyond Care Childcare Cooperative", link: BEYOND_CARE_LINK },
    },
  },
  {
    id: "ymca",
    byLang: {
      en: { image: ymcaSmartEn, alt: "YMCA free open house", link: YMCA_LINK },
      es: { image: ymcaSmartEs, alt: "Jornada gratuita de puertas abiertas de la YMCA", link: YMCA_LINK },
      zh: { image: ymcaSmartZh, alt: "YMCA免费开放日", link: YMCA_LINK },
    },
  },
  {
    id: "newsletter",
    type: "component",
  },
];

const TrackedMobileBanner = ({ banner, pickId, lang, path }) => {
  const infoRef = useInfoView({
    slot: "mobile_info_banner",
    info_id: pickId,
    lng: lang,
    path,
  });

  return (
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
          width="640"
          height="200"
          loading="eager"
          decoding="async"
        />
      </a>
    </div>
  );
};

const InfoBlockMobile = ({ lang }) => {
  const { t } = useTranslation();
  const location = useLocation();

  const path = location.pathname + location.search;

  const stablePath = useMemo(() => {
    return location.pathname.replace(/^\/(en|es|zh)(?=\/|$)/, "") || "/";
  }, [location.pathname]);

  // Choose once for each route during render. This avoids painting a default
  // placement and replacing it immediately after mount.
  const pick = useMemo(() => {
    if (sponsorsSmartreach.length === 0) return null;
    return sponsorsSmartreach[
      Math.floor(Math.random() * sponsorsSmartreach.length)
    ];
  }, [stablePath]);

  if (!pick) return null;

  const pickId = pick.id;
  const isNewsletter = pick.type === "component";
  const banner = isNewsletter
    ? null
    : pick?.byLang?.[lang] || pick?.byLang?.en || null;

  if (!isNewsletter && !banner) return null;

  return (
    <>
      {isNewsletter ? (
        <NewsletterSignup
          lang={lang}
          variant="mobile"
          slot="mobile_info_banner"
          path={path}
        />
      ) : (
        <TrackedMobileBanner
          banner={banner}
          pickId={pickId}
          lang={lang}
          path={path}
        />
      )}

      <p className="info-link">
        <Link to={`/${lang}/contact`}>
          {t("Contact us to feature your message")}
        </Link>
      </p>
    </>
  );
};

export default InfoBlockMobile;
