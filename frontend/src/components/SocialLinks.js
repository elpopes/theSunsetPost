import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaInstagram, FaFacebookF, FaEnvelope } from "react-icons/fa";
import "./SocialLinks.css";

const SocialLinks = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";

  return (
    <div className="header__socials">
      <a
        href="https://www.instagram.com/the_sunset_post"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
      >
        <FaInstagram />
      </a>

      <a
        href="https://www.facebook.com/thesunsetpost/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FaFacebookF />
      </a>

      <Link to={`/${lang}/contact`} aria-label={t("Contact Us")}>
        <FaEnvelope />
      </Link>
    </div>
  );
};

export default SocialLinks;
