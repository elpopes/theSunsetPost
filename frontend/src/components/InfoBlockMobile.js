import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

// Dojo (existing)
import dojoSmartEn from "../assets/outreach/Dojo-Smartreach-En.png";
import dojoSmartEs from "../assets/outreach/Dojo-Smartreach-Es.png";
import dojoSmartZh from "../assets/outreach/Dojo-Smartreach-Zh.png";

// Maria’s Bistro (new)
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

const pickSponsor = () => {
  // deterministic daily rotation (change to Math.random() for per-load)
  const day = new Date().getDate();
  return sponsorsSmartreach[day % sponsorsSmartreach.length];
};

const InfoBlockMobile = ({ lang }) => {
  const { t } = useTranslation();
  const sponsor = pickSponsor();
  const banner = sponsor.byLang[lang] || sponsor.byLang.en;

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
