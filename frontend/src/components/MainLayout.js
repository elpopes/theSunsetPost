import React, { useState, useEffect } from "react";
import Header from "./Header";
import { useTranslation } from "react-i18next";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="main-layout">
      <Header /> {/* Full-width header */}
      {isMobile && (
        <div className="ad-space">
          <h4>{t("Advertisement")}</h4> {/* Translated header */}
          <p>{t("Your Ad Here")}</p> {/* Translated ad text */}
        </div>
      )}
      <div className="main-layout__container">
        <div className="main-layout__content">{children}</div>
        {!isMobile && (
          <aside className="main-layout__sidebar">
            <div className="ad-space">
              <h4>{t("Advertisement")}</h4> {/* Translated header */}
              <p>{t("Your Ad Here")}</p> {/* Translated ad text */}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
