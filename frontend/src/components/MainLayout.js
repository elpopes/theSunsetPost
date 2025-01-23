import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import Header from "./Header";
import { useTranslation } from "react-i18next";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial state after the component mounts
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Run on mount
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
          <h4>{t("Advertisement", "Advertisement")}</h4>
          <p>
            <Link to="/contact">{t("Your Ad Here", "Your Ad Here")}</Link>
          </p>
        </div>
      )}
      <div className="main-layout__container">
        <div className="main-layout__content">{children}</div>
        {!isMobile && (
          <aside className="main-layout__sidebar">
            <div className="ad-space">
              <h4>{t("Advertisement", "Advertisement")}</h4>
              <p>
                <Link to="/contact">{t("Your Ad Here", "Your Ad Here")}</Link>{" "}
              </p>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
