// src/components/Header.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import mastheadEn from "../assets/MastHead.svg";
import mastheadEs from "../assets/MastHeadEs.svg";
import mastheadZh from "../assets/MastHeadZh.svg";
import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
import { useDispatch, useSelector } from "react-redux";
import { fetchSections } from "../features/sections/sectionsSlice";
import SubwayInfo from "./SubwayInfo";
import SearchBar from "./SearchBar";

const Header = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = useSelector((state) => state.sections.items);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  // preload to avoid flicker when switching languages
  useEffect(() => {
    [mastheadEn, mastheadEs, mastheadZh].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const normLang = (lng) =>
    lng?.startsWith("es") ? "es" : lng?.startsWith("zh") ? "zh" : "en";

  const logoByLang = { en: mastheadEn, es: mastheadEs, zh: mastheadZh };
  const logoSrc = logoByLang[normLang(i18n.language)];

  const filteredSections = sections.map((section) => {
    const tr = section.translations?.find((x) => x.language === i18n.language);
    return {
      ...section,
      displayName: tr?.name || section.name,
      description: tr?.description || section.description,
      urlName: section.name,
    };
  });

  return (
    <header className="header">
      <div className="header__content">
        <div className="header__left">
          <WeatherTime />
        </div>

        <div className="header__center">
          <div className="header__branding">
            <div className="header__logo">
              <Link
                to={`/${i18n.language}`}
                className="header__logo-link"
                onClick={() => setMenuOpen(false)}
              >
                <img
                  src={logoSrc}
                  alt={t("The Sunset Post masthead")}
                  className="header__logo-image"
                />
              </Link>
            </div>

            <div className="header__language-row">
              <div className="header__language-switcher">
                <LanguageSwitcher />
              </div>
              <div className="header__search">
                <SearchBar />
              </div>
            </div>
          </div>

          <button
            className="hamburger-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "\u2715" : "\u2630"}
          </button>

          <nav className={`header__sections-nav ${menuOpen ? "open" : ""}`}>
            <ul>
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <li key={section.id}>
                    <Link
                      to={`/${
                        i18n.language
                      }/sections/${section.urlName.toLowerCase()}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {section.displayName}
                    </Link>
                  </li>
                ))
              ) : (
                <li>{t("No sections available")}</li>
              )}
            </ul>
          </nav>
        </div>

        <div className="header__right">
          <div className="header__info">
            <SubwayInfo />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
