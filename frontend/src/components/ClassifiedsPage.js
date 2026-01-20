import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchClassifiedCategories,
  fetchClassifieds,
} from "../features/classifieds/classifiedsSlice";
import { baseURL as defaultBaseURL } from "../config";
import "./ClassifiedsPage.css";

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

const ClassifiedsPage = ({ baseURL = defaultBaseURL }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { lang: routeLang } = useParams();
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const lang = useMemo(() => {
    return normalizeLang(routeLang || i18n.language || "en");
  }, [routeLang, i18n.language]);

  const {
    categories,
    classifieds,
    categoriesStatus,
    classifiedsStatus,
    error,
  } = useSelector((s) => s.classifieds);

  // URL-driven filters
  const urlCategory = searchParams.get("category") || "";
  const urlSubcategory = searchParams.get("subcategory") || "";

  const [categorySlug, setCategorySlug] = useState(urlCategory);
  const [subcategorySlug, setSubcategorySlug] = useState(urlSubcategory);

  // keep local state in sync if user navigates (back/forward or from detail page)
  useEffect(() => {
    setCategorySlug(urlCategory);
    setSubcategorySlug(urlSubcategory);
  }, [urlCategory, urlSubcategory]);

  useEffect(() => {
    dispatch(fetchClassifiedCategories({ lang }));
  }, [dispatch, lang]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.slug === categorySlug) || null;
  }, [categories, categorySlug]);

  const subcategories = activeCategory?.subcategories || [];

  // push state -> URL (this is what makes filtering "execute")
  const pushFiltersToUrl = (cat, subcat) => {
    const next = new URLSearchParams(searchParams);
    if (cat) next.set("category", cat);
    else next.delete("category");

    if (subcat) next.set("subcategory", subcat);
    else next.delete("subcategory");

    setSearchParams(next, { replace: false });
  };

  useEffect(() => {
    dispatch(
      fetchClassifieds({
        lang,
        category: categorySlug || undefined,
        subcategory: subcategorySlug || undefined,
        limit: 50,
      }),
    );
  }, [dispatch, lang, categorySlug, subcategorySlug]);

  return (
    <div className="classifieds-page">
      {error ? <p className="classifieds-error">{error}</p> : null}

      <div className="classifieds-layout">
        <div className="classifieds-filters">
          <Link
            className="classifieds-post-btn"
            to={`/${lang}/contact`}
            onClick={() => window.scrollTo(0, 0)}
          >
            {t("Post in Classifieds")}
          </Link>

          <label>
            {t("classifieds.filters.category", "Category")}
            <select
              value={categorySlug}
              onChange={(e) => {
                const nextCat = e.target.value;
                setCategorySlug(nextCat);
                setSubcategorySlug("");
                pushFiltersToUrl(nextCat, "");
              }}
              disabled={categoriesStatus === "loading"}
            >
              <option value="">{t("classifieds.filters.all", "All")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t("classifieds.filters.subcategory", "Subcategory")}
            <select
              value={subcategorySlug}
              onChange={(e) => {
                const nextSub = e.target.value;
                setSubcategorySlug(nextSub);
                pushFiltersToUrl(categorySlug, nextSub);
              }}
              disabled={!categorySlug || subcategories.length === 0}
            >
              <option value="">{t("classifieds.filters.all", "All")}</option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.slug}>
                  {sc.name}
                </option>
              ))}
            </select>
          </label>

          {(categorySlug || subcategorySlug) && (
            <button
              type="button"
              className="classifieds-clear"
              onClick={() => {
                setCategorySlug("");
                setSubcategorySlug("");
                pushFiltersToUrl("", "");
              }}
            >
              {t("classifieds.filters.all", "All")}
            </button>
          )}
        </div>

        <div className="classifieds-results">
          <h2 className="classifieds-title">
            {t("classifieds.title", "Classifieds")}
          </h2>
          <p className="classifieds-description">
            {t("classifieds.description")}
          </p>

          {categoriesStatus === "loading" ? <p>Loading…</p> : null}
          {classifiedsStatus === "loading" ? <p>Loading…</p> : null}

          <ul className="classifieds-list">
            {classifieds.map((c) => {
              const img = resolveUrl(c.photo_url, baseURL);

              return (
                <li key={c.id} className="classifieds-item">
                  <div className="classifieds-item-body">
                    <Link to={`/${lang}/classifieds/${c.slug || c.id}`}>
                      <h3>{c.title}</h3>
                    </Link>

                    <p>{c.body_snippet}</p>

                    <div className="classifieds-tagsline">
                      {c.category?.slug ? (
                        <>
                          <button
                            type="button"
                            className="classifieds-tag-tile"
                            onClick={() => {
                              setCategorySlug(c.category.slug);
                              setSubcategorySlug("");
                              pushFiltersToUrl(c.category.slug, "");
                              window.scrollTo(0, 0);
                            }}
                          >
                            {c.category.name}
                          </button>

                          {c.subcategory?.slug ? (
                            <>
                              <span className="classifieds-tag-sep">/</span>
                              <button
                                type="button"
                                className="classifieds-tag-tile"
                                onClick={() => {
                                  setCategorySlug(c.category.slug);
                                  setSubcategorySlug(c.subcategory.slug);
                                  pushFiltersToUrl(
                                    c.category.slug,
                                    c.subcategory.slug,
                                  );
                                  window.scrollTo(0, 0);
                                }}
                              >
                                {c.subcategory.name}
                              </button>
                            </>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </div>

                  {img ? (
                    <div className="classifieds-item-image">
                      <img src={img} alt="" />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClassifiedsPage;
