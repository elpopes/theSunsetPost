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
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      try {
        const parsedUser = JSON.parse(loggedInUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
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
                  <a href="/post" className="header__auth-link">
                    {t("post")}
                  </a>
                </li>
              )}
              {user ? (
                <li>
                  <button onClick={handleLogout} className="header__auth-link">
                    {t("logout")}
                  </button>
                </li>
              ) : (
                <>
                  <li>
                    <a href="/signup" className="header__auth-link">
                      {t("sign_up")}
                    </a>
                  </li>
                  <li>
                    <a href="/login" className="header__auth-link">
                      {t("login")}
                    </a>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
        {/* <TransitInfo /> */}
      </div>
    </header>
  );
};

export default Header;
