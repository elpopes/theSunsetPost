import React, { useEffect, useState } from "react";
import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";

const Header = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/sections");
        const data = await response.json();
        console.log("Fetched sections:", data); // Debugging log
        setSections(data); // Ensure sections is set correctly
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };
    fetchSections();
  }, [currentLanguage]); // Refetch whenever the language changes

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header__content">
        <WeatherTime />
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
              {Array.isArray(sections) && sections.length > 0 ? (
                sections.map((section) => (
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
      </div>
    </header>
  );
};

export default Header;
