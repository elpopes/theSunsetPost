import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import InfoBlockMobile from "./InfoBlockMobile";
import InfoStackSidebar from "./InfoStackSidebar";

import "./MainLayout.css";

const MainLayout = ({ children }) => {
  const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const lang = i18n.language;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="main-layout">
      <Header />

      {isMobile && <InfoBlockMobile lang={lang} />}

      {/* Main content layout */}
      <div className="main-layout__container">
        <div className="main-layout__content">{children}</div>

        {!isMobile && <InfoStackSidebar lang={lang} />}
      </div>
    </div>
  );
};

export default MainLayout;
