import React from "react";
import Header from "./Header";
import { useTranslation } from "react-i18next"; // Import useTranslation
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const { t } = useTranslation(); // Initialize translation function

  return (
    <div className="main-layout">
      <Header /> {/* Full-width header */}
      <div className="main-layout__container">
        <div className="main-layout__content">{children}</div>
        <aside className="main-layout__sidebar">
          <div className="ad-space">
            <h4>{t("Advertisement")}</h4> {/* Translated header */}
            <p>{t("Your Ad Here")}</p> {/* Translated ad text */}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MainLayout;
