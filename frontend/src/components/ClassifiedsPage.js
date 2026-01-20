import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  fetchClassifiedCategories,
  fetchClassifieds,
} from "../features/classifieds/classifiedsSlice";

// helper for photo_url that might be absolute or relative
const resolveUrl = (url, baseURL) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${baseURL}${url}`;
};

const ClassifiedsPage = ({ lang = "en", baseURL }) => {
  const dispatch = useDispatch();

  const {
    categories,
    classifieds,
    categoriesStatus,
    classifiedsStatus,
    error,
  } = useSelector((s) => s.classifieds);

  const [categorySlug, setCategorySlug] = useState("");
  const [subcategorySlug, setSubcategorySlug] = useState("");

  useEffect(() => {
    dispatch(fetchClassifiedCategories({ lang }));
  }, [dispatch, lang]);

  // Default to first category once loaded
  useEffect(() => {
    if (!categorySlug && categories?.length) {
      setCategorySlug(categories[0].slug);
      setSubcategorySlug("");
    }
  }, [categories, categorySlug]);

  const activeCategory = useMemo(() => {
    return categories.find((c) => c.slug === categorySlug) || null;
  }, [categories, categorySlug]);

  const subcategories = activeCategory?.subcategories || [];

  useEffect(() => {
    // only fetch list once we have a category chosen (or you can allow all)
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
      <h1>Classifieds</h1>

      {error ? <p>{error}</p> : null}

      <div className="classifieds-filters">
        <label>
          Category
          <select
            value={categorySlug}
            onChange={(e) => {
              setCategorySlug(e.target.value);
              setSubcategorySlug("");
            }}
            disabled={categoriesStatus === "loading"}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Subcategory
          <select
            value={subcategorySlug}
            onChange={(e) => setSubcategorySlug(e.target.value)}
            disabled={!categorySlug || subcategories.length === 0}
          >
            <option value="">All</option>
            {subcategories.map((sc) => (
              <option key={sc.id} value={sc.slug}>
                {sc.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {categoriesStatus === "loading" ? <p>Loading categories…</p> : null}
      {classifiedsStatus === "loading" ? <p>Loading classifieds…</p> : null}

      <ul className="classifieds-list">
        {classifieds.map((c) => {
          const img = resolveUrl(c.photo_url, baseURL);
          return (
            <li key={c.id} className="classifieds-item">
              {img ? <img src={img} alt="" /> : null}

              <div>
                <Link to={`/classifieds/${c.slug}`}>
                  <h3>{c.title}</h3>
                </Link>
                <p>{c.body_snippet}</p>
                <p>
                  {c.category?.name}
                  {c.subcategory?.name ? ` / ${c.subcategory.name}` : ""}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ClassifiedsPage;
