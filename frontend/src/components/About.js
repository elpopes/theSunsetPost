import React from "react";
import { useTranslation } from "react-i18next";
import "./About.css";

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="about-page">
      <h1>{t("about_page.title")}</h1>
      <p>{t("about_page.welcome")}</p>
      <p>{t("about_page.mission")}</p>
      <p>{t("about_page.team")}</p>
      <p>{t("about_page.stay_tuned")}</p>
      <p>{t("about_page.join_us")}</p>
      <p>
        <a href="/contact">{t("about_page.connect")}</a>
      </p>
    </div>
  );
};

export default About;
