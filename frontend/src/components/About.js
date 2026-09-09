import React from "react";
import { useTranslation } from "react-i18next";
import "./About.css";

const DAVID_PRIZE_URL = "https://thedavidprize.org/finalists/lorenzo-tijerina/";

const About = () => {
  const { t, i18n } = useTranslation();
  const language = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0];

  return (
    <div className="about-page">
      <h1>{t("about_page.title")}</h1>
      <p>{t("about_page.intro")}</p>
      <p>{t("about_page.bio")}</p>
      <p>
        {t("about_page.recognition")} {t("about_page.david_prize_before")}
        <a href={DAVID_PRIZE_URL} target="_blank" rel="noopener noreferrer">
          {t("about_page.david_prize_link")}
        </a>
        {t("about_page.david_prize_after")}
      </p>
      <p>{t("about_page.origin")}</p>
      <p>{t("about_page.team")}</p>
      <h2>{t("about_page.get_involved_title")}</h2>
      <p>{t("about_page.get_involved")}</p>
      <p>
        <a href={`/${language}/contact`}>{t("about_page.connect")}</a>
      </p>
    </div>
  );
};

export default About;
