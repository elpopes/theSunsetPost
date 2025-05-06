import React, { useState, useEffect } from "react";
import masthead from "../assets/sunset-post-masthead.png";
import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
import { useDispatch, useSelector } from "react-redux";
import { fetchSections } from "../features/sections/sectionsSlice";
import SubwayInfo from "./SubwayInfo";

const Header = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const [menuOpen, setMenuOpen] = useState(false);

  const sections = useSelector((state) => state.sections.items);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  const filteredSections = sections.map((section) => {
    const translation = section.translations?.find(
      (t) => t.language === i18n.language
    );
    return {
      ...section,
      name: translation ? translation.name : section.name,
      description: translation ? translation.description : section.description,
    };
  });

  return (
    <header className="header">
      <div className="header__content">
        {/* Left: Weather */}
        <div className="header__left">
          <WeatherTime />
        </div>

        {/* Center: Logo, Language Switcher, Navigation */}
        <div className="header__center">
          <div className="header__branding">
            <div className="header__logo">
              <a href="/" className="header__logo-link">
                <img
                  src={masthead}
                  alt="The Sunset Post logo"
                  className="header__logo-image"
                />
              </a>
            </div>

            <div className="header__language-switcher">
              <LanguageSwitcher />
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
                    <a href={`/sections/${section.name.toLowerCase()}`}>
                      {section.name}
                    </a>
                  </li>
                ))
              ) : (
                <li>{t("No sections available")}</li>
              )}
            </ul>
          </nav>
        </div>

        {/* Right: Subway Info */}
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
