// src/components/ClassifiedDetail.js
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchClassifiedByIdOrSlug,
  deleteClassified,
  clearSelectedClassified,
} from "../features/classifieds/classifiedsSlice";
import { baseURL as defaultBaseURL } from "../config";
import "./ClassifiedDetail.css";

// helper for photo_url that might be absolute or relative
const resolveUrl = (url, base) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${base}${url}`;
};

const normalizeLang = (raw) => {
  const s = (raw || "en").toLowerCase();
  if (s.startsWith("zh")) return "zh";
  if (s.startsWith("es")) return "es";
  return "en";
};

// simple fixed-format date (mm/dd/yy)
const formatMMDDYY = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
};

const ClassifiedDetail = ({ baseURL = defaultBaseURL }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { lang: routeLang, idOrSlug } = useParams();
  const { i18n, t } = useTranslation();

  const lang = useMemo(
    () => normalizeLang(routeLang || i18n.language || "en"),
    [routeLang, i18n.language],
  );

  const { selected, selectedStatus, error } = useSelector((s) => s.classifieds);

  // auth shape varies across apps; be defensive
  const auth = useSelector((s) => s.auth);
  const token =
    auth?.token ||
    auth?.user?.token ||
    auth?.user?.jwt ||
    auth?.user?.accessToken;
  const isAdmin = !!auth?.user?.admin;

  useEffect(() => {
    if (!idOrSlug) return;
    dispatch(fetchClassifiedByIdOrSlug({ idOrSlug, lang }));

    return () => {
      dispatch(clearSelectedClassified());
    };
  }, [dispatch, idOrSlug, lang]);

  const backHref = `/${lang}/classifieds${location.search || ""}`;

  const handleGoToFilteredList = (categorySlug, subcategorySlug) => {
    const qs = new URLSearchParams();
    if (categorySlug) qs.set("category", categorySlug);
    if (subcategorySlug) qs.set("subcategory", subcategorySlug);
    const url = `/${lang}/classifieds${qs.toString() ? `?${qs.toString()}` : ""}`;
    navigate(url);
    window.scrollTo(0, 0);
  };

  const handleDelete = async () => {
    if (!selected?.id) return;

    const ok = window.confirm("Delete this classified? This cannot be undone.");
    if (!ok) return;

    const result = await dispatch(deleteClassified({ id: selected.id, token }));
    if (deleteClassified.fulfilled.match(result)) {
      navigate(backHref);
      window.scrollTo(0, 0);
    }
  };

  const handleEdit = () => {
    if (!selected?.id) return;
    // Adjust these query params if your PostForm expects different names.
    navigate(`/${lang}/post?postType=classified&id=${selected.id}`);
    window.scrollTo(0, 0);
  };

  if (selectedStatus === "loading") {
    return (
      <div className="classified-detail">
        <p>{t("loading", "Loading…")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="classified-detail">
        <p className="classified-detail-error">{error}</p>
        <Link className="classified-detail-back" to={backHref}>
          {t("classifieds.Back to Classifieds", "Back to Classifieds")}
        </Link>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="classified-detail">
        <p>{t("not_found", "Not found.")}</p>
        <Link className="classified-detail-back" to={backHref}>
          {t("classifieds.Back to Classifieds", "Back to Classifieds")}
        </Link>
      </div>
    );
  }

  const img = resolveUrl(selected.photo_url, baseURL);
  const posted = formatMMDDYY(selected.posted_at);

  return (
    <div className="classified-detail">
      <div className="classified-detail-top">
        <Link className="classified-detail-back" to={backHref}>
          {t("classifieds.Back to Classifieds", "Back to Classifieds")}
        </Link>

        {isAdmin ? (
          <div className="classified-detail-actions">
            <button
              type="button"
              className="classifieds-cta"
              onClick={handleEdit}
            >
              Edit
            </button>
            <button
              type="button"
              className="classifieds-cta classifieds-cta-danger"
              onClick={handleDelete}
              disabled={!token}
              title={!token ? "Missing auth token" : ""}
            >
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <h1 className="classified-detail-title">{selected.title}</h1>

      <div className="classified-detail-meta">
        {posted ? <div className="classified-detail-date">{posted}</div> : null}

        <div className="classified-detail-tagsline">
          {selected.category?.slug ? (
            <>
              <button
                type="button"
                className="classifieds-tag-tile"
                onClick={() =>
                  handleGoToFilteredList(selected.category.slug, "")
                }
              >
                {selected.category.name}
              </button>

              {selected.subcategory?.slug ? (
                <>
                  <span className="classifieds-tag-sep">/</span>
                  <button
                    type="button"
                    className="classifieds-tag-tile"
                    onClick={() =>
                      handleGoToFilteredList(
                        selected.category.slug,
                        selected.subcategory.slug,
                      )
                    }
                  >
                    {selected.subcategory.name}
                  </button>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="classified-detail-content">
        <div className="classified-detail-body">
          <div>{selected.body}</div>
          {selected.link ? (
            <p>
              <a href={selected.link} target="_blank" rel="noreferrer">
                {selected.link}
              </a>
            </p>
          ) : null}
        </div>

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
