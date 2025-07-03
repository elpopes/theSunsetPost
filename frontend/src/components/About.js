import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import "./About.css";

const About = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>About – The Sunset Post</title>
        <meta
          name="description"
          content="Learn more about The Sunset Post: our mission, team, and commitment to trilingual, community-powered journalism in Sunset Park."
        />
        <link rel="canonical" href="https://www.sunsetpost.org/about/" />
      </Helmet>

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
    </>
  );
};

export default About;
