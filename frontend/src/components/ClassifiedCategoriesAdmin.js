// src/components/ClassifiedCategoriesAdmin.js
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../config";

/**
 * ClassifiedCategoriesAdmin
 *
 * Admin-only panel embedded in ClassifiedPostForm.
 * Handles:
 * - Fetch categories (with nested subcategories) for dropdowns
 * - Create/Delete category
 * - Create/Delete subcategory
 *
 * Props:
 * - lang: "en" | "es" | "zh" (controls returned names)
 * - onCategoriesChange: (categoriesArray) => void
 */
const ClassifiedCategoriesAdmin = ({ lang = "en", onCategoriesChange }) => {
  const user = useSelector((state) => state.auth.user);

  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Category create form
  const [catSlug, setCatSlug] = useState("");
  const [catPosition, setCatPosition] = useState(0);
  const [catActive, setCatActive] = useState(true);
  const [catNameEn, setCatNameEn] = useState("");
  const [catNameEs, setCatNameEs] = useState("");
  const [catNameZh, setCatNameZh] = useState("");

  // Subcategory create form
  const [subParentCategoryId, setSubParentCategoryId] = useState("");
  const [subSlug, setSubSlug] = useState("");
  const [subPosition, setSubPosition] = useState(0);
  const [subActive, setSubActive] = useState(true);
  const [subNameEn, setSubNameEn] = useState("");
  const [subNameEs, setSubNameEs] = useState("");
  const [subNameZh, setSubNameZh] = useState("");

  const authHeaders = useMemo(() => {
    if (!user?.token) return {};
    return { Authorization: `Bearer ${user.token}` };
  }, [user?.token]);

  const normalizeLang = (l) => {
    if (!l) return "en";
    const s = String(l);
    if (s.startsWith("es")) return "es";
    if (s.startsWith("zh")) return "zh";
    return "en";
  };

  const buildTranslations = ({ en, es, zh }) => {
    const arr = [];
    if (en?.trim()) arr.push({ language: "en", name: en.trim() });
    if (es?.trim()) arr.push({ language: "es", name: es.trim() });
    if (zh?.trim()) arr.push({ language: "zh", name: zh.trim() });
    return arr;
  };

  const refresh = async () => {
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(
        `${baseURL}/api/classified_categories?lang=${normalizeLang(lang)}`,
      );
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
      onCategoriesChange?.(data);
    } catch (e) {
      console.error(e);
      setMsg("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  const clearCategoryForm = () => {
    setCatSlug("");
    setCatPosition(0);
    setCatActive(true);
    setCatNameEn("");
    setCatNameEs("");
    setCatNameZh("");
  };

  const clearSubcategoryForm = () => {
    setSubSlug("");
    setSubPosition(0);
    setSubActive(true);
    setSubNameEn("");
    setSubNameEs("");
    setSubNameZh("");
  };

  const createCategory = async () => {
    setMsg("");
    if (!user?.token) return setMsg("Unauthorized.");
    if (!catSlug.trim()) return setMsg("Category slug is required.");

    const translations = buildTranslations({
      en: catNameEn,
      es: catNameEs,
      zh: catNameZh,
    });
    if (translations.length === 0) {
      return setMsg("Add at least one category name (en/es/zh).");
    }

    const payload = {
      classified_category: {
        slug: catSlug.trim(),
        position: Number(catPosition) || 0,
        active: Boolean(catActive),
        classified_category_translations_attributes: translations,
      },
    };

    try {
      const res = await fetch(
        `${baseURL}/api/classified_categories?lang=${normalizeLang(lang)}`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return setMsg(data?.errors?.join(", ") || "Failed to create category.");
      }

      clearCategoryForm();
      await refresh();
      setMsg("Category created.");
    } catch (e) {
      console.error(e);
      setMsg("Failed to create category.");
    }
  };

  const deleteCategory = async (id) => {
    setMsg("");
    if (!user?.token) return setMsg("Unauthorized.");

    const ok = window.confirm(
      "Delete this category? Subcategories will also be removed.",
    );
    if (!ok) return;

    try {
      const res = await fetch(`${baseURL}/api/classified_categories/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return setMsg(data?.errors?.join(", ") || "Failed to delete category.");
      }

      if (String(subParentCategoryId) === String(id))
        setSubParentCategoryId("");

      await refresh();
      setMsg("Category deleted.");
    } catch (e) {
      console.error(e);
      setMsg("Failed to delete category.");
    }
  };

  const createSubcategory = async () => {
    setMsg("");
    if (!user?.token) return setMsg("Unauthorized.");
    if (!subParentCategoryId) return setMsg("Select a parent category.");
    if (!subSlug.trim()) return setMsg("Subcategory slug is required.");

    const translations = buildTranslations({
      en: subNameEn,
      es: subNameEs,
      zh: subNameZh,
    });
    if (translations.length === 0) {
      return setMsg("Add at least one subcategory name (en/es/zh).");
    }

    const payload = {
      classified_subcategory: {
        classified_category_id: Number(subParentCategoryId),
        slug: subSlug.trim(),
        position: Number(subPosition) || 0,
        active: Boolean(subActive),
        classified_subcategory_translations_attributes: translations,
      },
    };

    try {
      const res = await fetch(
        `${baseURL}/api/classified_subcategories?lang=${normalizeLang(lang)}`,
        {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return setMsg(
          data?.errors?.join(", ") || "Failed to create subcategory.",
        );
      }

      clearSubcategoryForm();
      await refresh();
      setMsg("Subcategory created.");
    } catch (e) {
      console.error(e);
      setMsg("Failed to create subcategory.");
    }
  };

  const deleteSubcategory = async (id) => {
    setMsg("");
    if (!user?.token) return setMsg("Unauthorized.");

    const ok = window.confirm("Delete this subcategory?");
    if (!ok) return;

    try {
      const res = await fetch(`${baseURL}/api/classified_subcategories/${id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        return setMsg(
          data?.errors?.join(", ") || "Failed to delete subcategory.",
        );
      }

      await refresh();
      setMsg("Subcategory deleted.");
    } catch (e) {
      console.error(e);
      setMsg("Failed to delete subcategory.");
    }
  };

  return (
    <div className="classifiedCategoriesAdmin">
      <button
        type="button"
        className="classifiedCategoriesAdmin__toggle"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide categories admin" : "Manage categories"}
      </button>

      {open && (
        <div className="classifiedCategoriesAdmin__panel">
          <div className="classifiedCategoriesAdmin__header">
            <strong>Classified categories admin</strong>
            <button
              type="button"
              className="classifiedCategoriesAdmin__refresh"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {msg && <p className="classifiedCategoriesAdmin__message">{msg}</p>}

          <section className="classifiedCategoriesAdmin__section">
            <h4>Create category</h4>

            <label>Slug</label>
            <input
              value={catSlug}
              onChange={(e) => setCatSlug(e.target.value)}
              placeholder="e.g. housing"
            />

            <label>Position</label>
            <input
              type="number"
              value={catPosition}
              onChange={(e) => setCatPosition(e.target.value)}
            />

            <label>
              <input
                type="checkbox"
                checked={catActive}
                onChange={(e) => setCatActive(e.target.checked)}
              />
              Active
            </label>

            <label>Name (en)</label>
            <input
              value={catNameEn}
              onChange={(e) => setCatNameEn(e.target.value)}
            />

            <label>Name (es)</label>
            <input
              value={catNameEs}
              onChange={(e) => setCatNameEs(e.target.value)}
            />

            <label>Name (zh)</label>
            <input
              value={catNameZh}
              onChange={(e) => setCatNameZh(e.target.value)}
            />

            <button type="button" onClick={createCategory}>
              Create category
            </button>
          </section>

          <section className="classifiedCategoriesAdmin__section">
            <h4>Create subcategory</h4>

            <label>Parent category</label>
            <select
              value={subParentCategoryId}
              onChange={(e) => setSubParentCategoryId(e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>

            <label>Slug</label>
            <input
              value={subSlug}
              onChange={(e) => setSubSlug(e.target.value)}
              placeholder="e.g. rooms"
            />

            <label>Position</label>
            <input
              type="number"
              value={subPosition}
              onChange={(e) => setSubPosition(e.target.value)}
            />

            <label>
              <input
                type="checkbox"
                checked={subActive}
                onChange={(e) => setSubActive(e.target.checked)}
              />
              Active
            </label>

            <label>Name (en)</label>
            <input
              value={subNameEn}
              onChange={(e) => setSubNameEn(e.target.value)}
            />

            <label>Name (es)</label>
            <input
              value={subNameEs}
              onChange={(e) => setSubNameEs(e.target.value)}
            />

            <label>Name (zh)</label>
            <input
              value={subNameZh}
              onChange={(e) => setSubNameZh(e.target.value)}
            />

            <button type="button" onClick={createSubcategory}>
              Create subcategory
            </button>
          </section>

          <section className="classifiedCategoriesAdmin__section">
            <h4>Existing categories</h4>

            {categories.length === 0 ? (
              <p>No categories yet.</p>
            ) : (
              categories.map((c) => (
                <div key={c.id} className="classifiedCategoriesAdmin__category">
                  <div className="classifiedCategoriesAdmin__row">
                    <div>
                      <strong>{c.name}</strong> <span>({c.slug})</span>{" "}
                      {!c.active && <span>(inactive)</span>}
                    </div>
                    <button type="button" onClick={() => deleteCategory(c.id)}>
                      Delete
                    </button>
                  </div>

                  {Array.isArray(c.subcategories) &&
                    c.subcategories.length > 0 && (
                      <ul className="classifiedCategoriesAdmin__subcats">
                        {c.subcategories.map((sc) => (
                          <li
                            key={sc.id}
                            className="classifiedCategoriesAdmin__row"
                          >
                            <span>
                              {sc.name} ({sc.slug}) {!sc.active && "(inactive)"}
                            </span>
                            <button
                              type="button"
                              onClick={() => deleteSubcategory(sc.id)}
                            >
                              Delete
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              ))
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default ClassifiedCategoriesAdmin;
