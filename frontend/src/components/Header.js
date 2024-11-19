import "./Header.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import WeatherTime from "./WeatherTime";
// import TransitInfo from "./TransitInfo";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { logout } from "../features/auth/authSlice"; // Import logout action

const Header = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Get user from Redux store

  // Debug logs to understand the user state
  console.log("Redux User State in Header:", user);
  if (user) {
    console.log("User is logged in. Admin status:", user.admin);
  } else {
    console.log("No user logged in.");
  }

  // Handle logout
  const handleLogout = () => {
    console.log("Logging out user:", user);
    dispatch(logout()); // Clear user from Redux store
    localStorage.removeItem("user"); // Remove from localStorage
    window.location.reload(); // Reload to reflect logged-out state
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
