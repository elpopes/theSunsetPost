import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchClassifiedByIdOrSlug,
  deleteClassified,
  clearSelectedClassified,
} from "../features/classifieds/classifiedsSlice";
import { baseURL as defaultBaseURL } from "../config";
import ClassifiedEdit from "./ClassifiedEdit";
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

  const [editMode, setEditMode] = useState(false);

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

    const ok = window.confirm(
      t(
        "classifieds.confirmDelete",
        "Delete this classified? This cannot be undone.",
      ),
    );
    if (!ok) return;

    const result = await dispatch(deleteClassified({ id: selected.id, token }));
    if (deleteClassified.fulfilled.match(result)) {
      navigate(backHref);
      window.scrollTo(0, 0);
    }
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
          {t("classifieds.backToClassifieds", "Back to classifieds")}
        </Link>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="classified-detail">
        <p>{t("not_found", "Not found.")}</p>
        <Link className="classified-detail-back" to={backHref}>
          {t("classifieds.backToClassifieds", "Back to classifieds")}
        </Link>
      </div>
    );
  }

  // INLINE EDIT MODE
  if (editMode && isAdmin) {
    return (
      <div className="classified-detail">
        <div className="classified-detail-top">
          <button
            type="button"
            className="classified-detail-back"
            onClick={() => setEditMode(false)}
          >
            {t("classifieds.backToClassifieds", "Back to classifieds")}
          </button>
        </div>

        <h1 className="classified-detail-title">
          {t("classifieds.editClassified", "Edit classified")}
        </h1>

        <ClassifiedEdit
          idOrSlug={idOrSlug}
          lang={lang}
          baseURL={baseURL}
          onCancel={() => setEditMode(false)}
          onSaved={() => {
            setEditMode(false);
            // refresh detail in current language so you see updated title/body/link right away
            dispatch(fetchClassifiedByIdOrSlug({ idOrSlug, lang }));
          }}
        />
      </div>
    );
  }

  const img = resolveUrl(selected.photo_url, baseURL);
  const posted = formatMMDDYY(selected.posted_at);

  return (
    <div className="classified-detail">
      <div className="classified-detail-top">
        <Link className="classified-detail-back" to={backHref}>
          {t("classifieds.backToClassifieds", "Back to classifieds")}
        </Link>

        {isAdmin ? (
          <div className="classified-detail-actions">
            <button
              type="button"
              className="classifieds-cta"
              onClick={() => setEditMode(true)}
            >
              {t("classifieds.edit", "Edit")}
            </button>

            <button
              type="button"
              className="classifieds-cta classifieds-cta-danger"
              onClick={handleDelete}
              disabled={!token}
              title={!token ? "Missing auth token" : ""}
            >
              {t("classifieds.delete", "Delete")}
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

          {selected.link_url ? (
            <p className="classified-detail-link">
              <a href={selected.link_url} target="_blank" rel="noreferrer">
                {t("classifieds.moreInfo", "More info")}
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
