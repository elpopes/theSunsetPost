// src/components/Header.js
import React from "react";
import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
import TransitInfo from "./TransitInfo";

const Header = () => {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="header__content">
        <WeatherTime /> {/* Left side */}
        <div className="header__center">
          <div className="header__logo">
            <h1>{t("The Sunset Post")}</h1> {/* Centered */}
          </div>
          <div className="header__language-switcher">
            <LanguageSwitcher /> {/* Centered language switcher */}
          </div>
          <nav className="header__nav">
            <ul>
              <li>
                <a href="/">{t("home")}</a>
              </li>
              <li>
                <a href="/about">{t("about")}</a>
              </li>
              <li>
                <a href="/contact">{t("contact")}</a>
              </li>
            </ul>
          </nav>
        </div>
        <TransitInfo /> {/* Right side */}
      </div>
    </header>
  );
};

export default Header;
