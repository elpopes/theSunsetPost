// src/components/ClassifiedDetail.js
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { baseURL as defaultBaseURL } from "../config";
import "./ClassifiedDetail.css";
import "./ClassifiedsPage.css"; // reuse tag/button styles

const normalizeLang = (raw) => {
  const s = (raw || "en").toLowerCase();
  if (s.startsWith("zh")) return "zh";
  if (s.startsWith("es")) return "es";
  return "en";
};

const resolveUrl = (url, base) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${base}${url}`;
};

const formatMMDDYY = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
};

const ClassifiedDetail = ({ baseURL = defaultBaseURL }) => {
  const { lang: routeLang, idOrSlug } = useParams();
  const { t, i18n } = useTranslation();

  const lang = useMemo(() => {
    return normalizeLang(routeLang || i18n.language || "en");
  }, [routeLang, i18n.language]);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [classified, setClassified] = useState(null);

  useEffect(() => {
    if (!idOrSlug) return;

    let cancelled = false;

    const run = async () => {
      try {
        setStatus("loading");
        setError(null);

        const res = await fetch(
          `${baseURL}/api/classifieds/${encodeURIComponent(
            idOrSlug,
          )}?lang=${encodeURIComponent(lang)}`,
        );

        if (!res.ok) {
          const msg = res.status === 404 ? "Not found" : "Failed to load";
          throw new Error(msg);
        }

        const data = await res.json();
        if (!cancelled) {
          setClassified(data);
          setStatus("succeeded");
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || "Failed to load");
          setStatus("failed");
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [baseURL, idOrSlug, lang]);

  if (status === "loading") return <p>{t("loading", "Loading…")}</p>;

  if (status === "failed") {
    return (
      <div className="classified-detail">
        <div className="classified-detail-top">
          <Link to={`/${lang}/classifieds`} className="classified-detail-back">
            {t("classifieds.Back to Classifieds", "Back to classifieds")}
          </Link>

          <Link className="classifieds-post-btn" to={`/${lang}/contact`}>
            {t("Post in Classifieds")}
          </Link>
        </div>

        <p className="classified-detail-error">{error}</p>
      </div>
    );
  }

  if (!classified) {
    return (
      <div className="classified-detail">
        <div className="classified-detail-top">
          <Link to={`/${lang}/classifieds`} className="classified-detail-back">
            {t("classifieds.Back to Classifieds", "Back to classifieds")}
          </Link>

          <Link className="classifieds-post-btn" to={`/${lang}/contact`}>
            {t("Post in Classifieds")}
          </Link>
        </div>

        <p>{t("Not found", "Not found")}</p>
      </div>
    );
  }

  const img = resolveUrl(classified.photo_url, baseURL);

  const categorySlug = classified.category?.slug || "";
  const subcategorySlug = classified.subcategory?.slug || "";

  const categoryHref = categorySlug
    ? `/${lang}/classifieds?category=${encodeURIComponent(categorySlug)}`
    : `/${lang}/classifieds`;

  const subcategoryHref =
    categorySlug && subcategorySlug
      ? `/${lang}/classifieds?category=${encodeURIComponent(
          categorySlug,
        )}&subcategory=${encodeURIComponent(subcategorySlug)}`
      : categoryHref;

  const posted = formatMMDDYY(classified.posted_at || classified.created_at);

  return (
    <div className="classified-detail">
      <div className="classified-detail-top">
        <Link to={`/${lang}/classifieds`} className="classified-detail-back">
          {t("classifieds.Back to Classifieds", "Back to classifieds")}
        </Link>

        <Link className="classifieds-post-btn" to={`/${lang}/contact`}>
          {t("Post in Classifieds")}
        </Link>
      </div>

      <h1 className="classified-detail-title">{classified.title}</h1>

      <div className="classified-detail-meta">
        {posted ? <div className="classified-detail-date">{posted}</div> : null}

        {(classified.category?.name || classified.subcategory?.name) && (
          <div className="classified-detail-tagsline">
            {classified.category?.name ? (
              <Link className="classifieds-tag-tile" to={categoryHref}>
                {classified.category.name}
              </Link>
            ) : null}

            {classified.subcategory?.name ? (
              <>
                <span className="classifieds-tag-sep">/</span>
                <Link className="classifieds-tag-tile" to={subcategoryHref}>
                  {classified.subcategory.name}
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>

      <div className="classified-detail-content">
        <div className="classified-detail-body">{classified.body}</div>

        {img ? (
          <div className="classified-detail-image">
            <img src={img} alt="" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ClassifiedDetail;
