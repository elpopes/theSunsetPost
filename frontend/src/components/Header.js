import React, { useEffect } from "react";
import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
import TransitInfo from "./TransitInfo"; // Import TransitInfo component
import { useDispatch, useSelector } from "react-redux";
import { fetchSections } from "../features/sections/sectionsSlice";
import { logout } from "../features/auth/authSlice";

const Header = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Redux state
  const sections = useSelector((state) => state.sections.items);
  const user = useSelector((state) => state.auth.user);

  // Fetch sections on initial load
  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  // Filter translations for the current language with a safe check
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

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header__content">
        {/* Left section: Weather */}
        <div className="header__left">
          <WeatherTime />
        </div>

        {/* Center section: Logo, Language Switcher, Navigation */}
        <div className="header__center">
          <div className="header__logo">
            <h1>{t("The Sunset Post")}</h1>
          </div>
          <div className="header__language-switcher">
            <LanguageSwitcher />
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
              {user && user.admin && (
                <li>
                  <a href="/post">{t("post")}</a>
                </li>
              )}
              {user ? (
                <li>
                  <button onClick={handleLogout}>{t("logout")}</button>
                </li>
              ) : (
                <>
                  <li>
                    <a href="/signup">{t("sign_up")}</a>
                  </li>
                  <li>
                    <a href="/login">{t("login")}</a>
                  </li>
                </>
              )}
            </ul>
          </nav>
          <nav className="header__sections-nav">
            <ul>
              {filteredSections.length > 0 ? (
                filteredSections.map((section) => (
                  <li key={section.id}>
                    <a href={`/sections/${section.id}`}>{section.name}</a>
                  </li>
                ))
              ) : (
                <li>{t("No sections available")}</li>
              )}
            </ul>
          </nav>
        </div>

        {/* Right section: Transit Info */}
        <div className="header__right">
          <TransitInfo />
        </div>
      </div>
    </header>
  );
};

export default Header;
