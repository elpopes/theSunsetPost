import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
import TransitInfo from "./TransitInfo";
import { useState, useEffect } from "react";

const Header = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);

  // Check if the user is logged in by looking for user data in localStorage
  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (loggedInUser) {
      setUser(loggedInUser);
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload(); // Reload the page to reflect logout state
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
            </ul>
          </nav>
        </div>
        <div className="header__auth">
          {user ? (
            <>
              <span>
                {t("Welcome")}, {user.email}
              </span>
              <button onClick={handleLogout}>{t("Logout")}</button>
            </>
          ) : (
            <>
              <a href="/signup">{t("Sign Up")}</a>
              <a href="/login">{t("Login")}</a>
            </>
          )}
        </div>
        <TransitInfo />
      </div>
    </header>
  );
};

export default Header;
