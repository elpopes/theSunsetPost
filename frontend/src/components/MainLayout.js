import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import "./MainLayout.css";

import localReachEN from "../assets/outreach/localreach-en.svg";
import localReachES from "../assets/outreach/localreach-es.svg";
import localReachZH from "../assets/outreach/localreach-zh.svg";

import smartReachEN from "../assets/outreach/smartreach-en.svg";
import smartReachES from "../assets/outreach/smartreach-es.svg";
import smartReachZH from "../assets/outreach/smartreach-zh.svg";

const MainLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  const lang = i18n.language;

  const localReachImage =
    {
      en: localReachEN,
      es: localReachES,
      zh: localReachZH,
    }[lang] || localReachEN;

  const smartReachImage =
    {
      en: smartReachEN,
      es: smartReachES,
      zh: smartReachZH,
    }[lang] || smartReachEN;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="main-layout">
      <Header />

      {/* Mobile: Inline banner */}
      {isMobile && (
        <>
          <div className="info-space">
            <Link to={`/${lang}/contact`}>
              <img
                src={smartReachImage}
                alt="Community Info"
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
        </>
      )}

      {/* Layout */}
      <div className="main-layout__container">
        <div className="main-layout__content">{children}</div>

        {/* Desktop: Sidebar block */}
        {!isMobile && (
          <aside className="main-layout__sidebar">
            <div className="info-space">
              <Link to={`/${lang}/contact`}>
                <img
                  src={localReachImage}
                  alt="Community Info"
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
        )}
      </div>
    </div>
  );
};

export default MainLayout;
