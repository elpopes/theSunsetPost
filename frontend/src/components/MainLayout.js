import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import InfoBlockMobile from "./InfoBlockMobile";
import InfoStackSidebar from "./InfoStackSidebar";

import "./MainLayout.css";

const INFO_MOBILE_MEDIA_QUERY = "(max-width: 1100px)";

const MainLayout = ({ children }) => {
  const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const lang = i18n.language;

  useEffect(() => {
    const mediaQuery = window.matchMedia(INFO_MOBILE_MEDIA_QUERY);

    const handleChange = (event) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
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
