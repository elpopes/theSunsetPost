import React from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import "./LanguageSwitcher.css";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    if (i18n.language === lng) return; // avoid reprocessing if already selected

    i18n.changeLanguage(lng);
    const pathWithoutLang = location.pathname.replace(/^\/(en|es|zh)/, "");
    const newPath = `/${lng}${pathWithoutLang || "/"}`;

    navigate(newPath, { replace: true }); // React-router navigation (no reload)
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage("en")}>EN</button>
      <button onClick={() => changeLanguage("es")}>ES</button>
      <button onClick={() => changeLanguage("zh")}>中文</button>
    </div>
  );
};

export default LanguageSwitcher;
