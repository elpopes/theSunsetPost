// src/components/Footer.js
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import "./Footer.css";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const sections = useSelector((state) => state.sections.items);
  const user = useSelector((state) => state.auth.user);

  const filteredSections = sections.map((section) => {
    const tr = section.translations?.find((x) => x.language === i18n.language);
    return {
      ...section,
      displayName: tr?.name || section.name,
      urlName: section.name, // stable route key (not translated)
    };
  });

  const isClassifiedsSection = (section) => {
    const urlName = (section?.urlName || "").toLowerCase();
    return urlName === "classifieds";
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* The Sunset Post Column */}
        <div className="footer__column">
          <h2 className="footer__logo">
            <Link to={`/${i18n.language}`} className="footer__logo-link">
              {t("The Sunset Post")}
            </Link>
          </h2>
          <ul>
            <li>
              <Link to={`/${i18n.language}`}>{t("home")}</Link>
            </li>
            <li>
              <Link to={`/${i18n.language}/about`}>{t("about")}</Link>
            </li>
            <li>
              <Link to={`/${i18n.language}/contact`}>{t("contact")}</Link>
            </li>
          </ul>
        </div>

        {/* Sections Column */}
        <div className="footer__column">
          <h2 className="footer__heading">{t("Sections")}</h2>
          <ul>
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <li key={section.id}>
                  <Link
                    to={
                      isClassifiedsSection(section)
                        ? `/${i18n.language}/classifieds`
                        : `/${i18n.language}/sections/${section.urlName.toLowerCase()}`
                    }
                  >
                    {section.displayName}
                  </Link>
                </li>
              ))
            ) : (
              <li>{t("No sections available")}</li>
            )}
          </ul>
        </div>

        {/* Contact Us Column */}
        <div className="footer__column">
          <h2 className="footer__heading">{t("Contact_Us")}</h2>
          <ul>
            <li>
              <Link to={`/${i18n.language}/contact`}>
                {t("Advertise with Us")}
              </Link>
            </li>
            <li>
              <Link to={`/${i18n.language}/contact`}>
                {t("Post in Classifieds")}
              </Link>
            </li>
            <li>
              <Link to={`/${i18n.language}/contact`}>{t("Careers")}</Link>
            </li>
            <li>
              <Link to={`/${i18n.language}/contact`}>
                {t("Letters to the Editor")}
              </Link>
            </li>
          </ul>
        </div>

        {/* Account Column */}
        <div className="footer__column">
          <h2 className="footer__heading">{t("Account")}</h2>
          <ul>
            {user ? (
              <>
                {user.admin && (
                  <li>
                    <Link to={`/${i18n.language}/post`}>{t("post")}</Link>
                  </li>
                )}
                <li>
                  <button className="footer__logout" onClick={handleLogout}>
                    {t("logout")}
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to={`/${i18n.language}/signup`}>{t("sign_up")}</Link>
                </li>
                <li>
                  <Link to={`/${i18n.language}/login`}>{t("login")}</Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>sunsetpost.org © 2024-2025 {t("The Sunset Post")}</p>
      </div>
    </footer>
  );
};

export default Footer;
