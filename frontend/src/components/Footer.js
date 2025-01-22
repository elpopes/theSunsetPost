import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { logout } from "../features/auth/authSlice";
import "./Footer.css";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  // Redux state
  const sections = useSelector((state) => state.sections.items);
  const user = useSelector((state) => state.auth.user);

  // Filter translations for the current language
  const filteredSections = sections.map((section) => {
    const translation = section.translations?.find(
      (t) => t.language === i18n.language
    );
    return {
      ...section,
      name: translation ? translation.name : section.name,
    };
  });

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
            <a href="/" className="footer__logo-link">
              {t("The Sunset Post")}
            </a>
          </h2>
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
        </div>

        {/* Sections Column */}
        <div className="footer__column">
          <h2 className="footer__heading">{t("Sections")}</h2>
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
        </div>

        {/* Contact Us Column */}
        <div className="footer__column">
          <h2 className="footer__heading">{t("Contact_Us")}</h2>
          <ul>
            <li>
              <a href="/contact">{t("Advertise with Us")}</a>
            </li>
            <li>
              <a href="/contact">{t("Post in Classifieds")}</a>
            </li>
            <li>
              <a href="/contact">{t("Careers")}</a>
            </li>
            <li>
              <a href="/contact">{t("Letters to the Editor")}</a>
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
                    <a href="/post">{t("post")}</a>
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
                  <a href="/signup">{t("sign_up")}</a>
                </li>
                <li>
                  <a href="/login">{t("login")}</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer__bottom">
        <p>sunsetpost.org © 2024-2025 {t("The Sunset Post")}</p>
      </div>
    </footer>
  );
};

export default Footer;
