import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const LanguageHandler = () => {
  const { lang } = useParams();
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!lang) return;

    document.documentElement.lang = lang;

    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  useEffect(() => {
    if (!lang || location.pathname.endsWith("/")) return;

    navigate(
      {
        pathname: `${location.pathname}/`,
        search: location.search,
        hash: location.hash,
      },
      { replace: true }
    );
  }, [lang, location.pathname, location.search, location.hash, navigate]);

  return null;
};

export default LanguageHandler;
