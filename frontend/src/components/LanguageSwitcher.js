import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSwitcher.css"; // Import the CSS file

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage("en")}>English</button>
      <button onClick={() => changeLanguage("es")}>Español</button>
      <button onClick={() => changeLanguage("zh")}>中文</button>
    </div>
  );
};

export default LanguageSwitcher;
