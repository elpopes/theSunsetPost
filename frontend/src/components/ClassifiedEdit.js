// src/components/ClassifiedEdit.js
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchClassifiedCategories,
  updateClassified,
} from "../features/classifieds/classifiedsSlice";
import { baseURL as defaultBaseURL } from "../config";

const normalizeLang = (raw) => {
  const s = (raw || "en").toLowerCase();
  if (s.startsWith("zh")) return "zh";
  if (s.startsWith("es")) return "es";
  return "en";
};

const LANGS = ["en", "es", "zh"];

const clamp = (s, max) => (s || "").slice(0, max);

const ClassifiedEdit = ({
  idOrSlug,
  lang: routeLang = "en",
  onCancel,
  onSaved,
  baseURL = defaultBaseURL,
}) => {
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const lang = useMemo(
    () => normalizeLang(routeLang || i18n.language || "en"),
    [routeLang, i18n.language],
  );

  const auth = useSelector((s) => s.auth);
  const token =
    auth?.token ||
    auth?.user?.token ||
    auth?.user?.jwt ||
    auth?.user?.accessToken;

  const { categories, categoriesStatus } = useSelector((s) => s.classifieds);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [classifiedId, setClassifiedId] = useState(null);

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [expiresAt, setExpiresAt] = useState(""); // YYYY-MM-DD
  const [linkUrl, setLinkUrl] = useState("");
  const [photo, setPhoto] = useState(null); // new file only

  // translations we actually send to backend
  const [trs, setTrs] = useState({
    en: { title: "", body: "" },
    es: { title: "", body: "" },
    zh: { title: "", body: "" },
  });

  // fetch categories if needed (for dropdowns)
  useEffect(() => {
    if (categoriesStatus === "idle") {
      dispatch(fetchClassifiedCategories({ lang }));
    }
  }, [dispatch, categoriesStatus, lang]);

  // fetch 3 language versions so admin can edit en/es/zh in one form
  useEffect(() => {
    const run = async () => {
      if (!idOrSlug) return;

      setLoading(true);
      setError("");

      try {
        const fetchOne = async (l) => {
          const res = await fetch(
            `${baseURL}/api/classifieds/${idOrSlug}?lang=${l}`,
          );
          if (!res.ok) {
            const err = await res.json().catch(() => null);
            throw new Error(err?.errors?.join(", ") || `Failed to load (${l})`);
          }
          return res.json();
        };

        const [enData, esData, zhData] = await Promise.all([
          fetchOne("en"),
          fetchOne("es"),
          fetchOne("zh"),
        ]);

        // scalar fields: take from any (should match)
        const any = enData || esData || zhData;

        setClassifiedId(any.id);

        setCategoryId(any.category?.id ? String(any.category.id) : "");
        setSubcategoryId(any.subcategory?.id ? String(any.subcategory.id) : "");

        // expires_at from API is ISO; convert to YYYY-MM-DD for <input type="date">
        setExpiresAt(any.expires_at ? String(any.expires_at).slice(0, 10) : "");

        setLinkUrl(any.link_url || "");

        setTrs({
          en: { title: enData.title || "", body: enData.body || "" },
          es: { title: esData.title || "", body: esData.body || "" },
          zh: { title: zhData.title || "", body: zhData.body || "" },
        });
      } catch (e) {
        setError(e.message || "Failed to load classified.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [idOrSlug, baseURL]);

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(categoryId),
  );
  const subcategories = selectedCategory?.subcategories || [];

  const updateTr = (l, key, value) => {
    setTrs((prev) => ({
      ...prev,
      [l]: {
        ...prev[l],
        [key]: key === "title" ? clamp(value, 60) : clamp(value, 250),
      },
    }));
  };

  const buildPayload = () => {
    const translations = LANGS.map((l) => ({
      language: l,
      title: clamp(trs[l].title, 60),
      body: clamp(trs[l].body, 250),
    }));

    const payload = {
      classified_category_id: categoryId ? String(categoryId) : "",
      classified_subcategory_id: subcategoryId ? String(subcategoryId) : "",
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : "",
      link_url: (linkUrl || "").trim(),
      translations,
      photo,
    };

    return payload;
  };

  const canSave =
    !!token &&
    !!classifiedId &&
    !!categoryId &&
    (trs[lang]?.title || "").trim().length > 0;

  const handleSave = async () => {
    if (!canSave) return;

    setSaving(true);
    setError("");

    const result = await dispatch(
      updateClassified({
        id: classifiedId,
        classified: buildPayload(),
        token,
        lang, // controls response language
      }),
    );

    setSaving(false);

    if (updateClassified.fulfilled.match(result)) {
      onSaved?.();
    } else {
      setError(result?.error?.message || "Failed to save.");
    }
  };

  if (loading) {
    return <p>{t("loading", "Loading…")}</p>;
  }

  return (
    <div className="classified-edit">
      {error ? <p className="classified-detail-error">{error}</p> : null}

      <div className="classified-detail-actions" style={{ marginBottom: 12 }}>
        <button type="button" className="classifieds-cta" onClick={onCancel}>
          {t("classifieds.cancel", "Cancel")}
        </button>

        <button
          type="button"
          className="classifieds-cta"
          onClick={handleSave}
          disabled={!canSave || saving}
          title={!token ? "Missing auth token" : ""}
        >
          {saving
            ? t("classifieds.saving", "Saving…")
            : t("classifieds.save", "Save")}
        </button>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>{t("classifieds.filters.category", "Category")}:</label>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSubcategoryId("");
          }}
          style={{ width: "100%", marginTop: 4 }}
        >
          <option value="">{t("classifieds.filters.all", "All")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.slug})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          {t("classifieds.filters.subcategory", "Subcategory")} (
          {t("classifieds.optional", "optional")}):
        </label>
        <select
          value={subcategoryId}
          onChange={(e) => setSubcategoryId(e.target.value)}
          style={{ width: "100%", marginTop: 4 }}
          disabled={!categoryId}
        >
          <option value="">{t("classifieds.none", "None")}</option>
          {subcategories.map((sc) => (
            <option key={sc.id} value={sc.id}>
              {sc.name} ({sc.slug})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          {t("classifieds.expiresAt", "Expires at")} (
          {t("classifieds.optional", "optional")}):
        </label>
        <input
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          style={{ width: "100%", marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          {t("classifieds.linkUrl", "Link")} (
          {t("classifieds.optional", "optional")}):
        </label>
        <input
          type="url"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ width: "100%", marginTop: 4 }}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          {t("classifieds.photo", "Photo")} (
          {t("classifieds.optional", "optional")}):
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          style={{ width: "100%", marginTop: 4 }}
        />
      </div>

      {/* translations */}
      {LANGS.map((l) => (
        <div
          key={l}
          style={{ borderTop: "1px solid #eee", paddingTop: 10, marginTop: 10 }}
        >
          <h3 style={{ margin: "6px 0" }}>
            {t("classifieds.translation", "Translation")}: {l}
          </h3>

          <label>
            {t("classifieds.title", "Title")}{" "}
            <span style={{ opacity: 0.7 }}>
              ({(trs[l].title || "").length}/60)
            </span>
          </label>
          <input
            type="text"
            value={trs[l].title}
            onChange={(e) => updateTr(l, "title", e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />

          <label style={{ marginTop: 10, display: "block" }}>
            {t("classifieds.body", "Body")}{" "}
            <span style={{ opacity: 0.7 }}>
              ({(trs[l].body || "").length}/250)
            </span>
          </label>
          <textarea
            value={trs[l].body}
            onChange={(e) => updateTr(l, "body", e.target.value)}
            rows={5}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>
      ))}
    </div>
  );
};

export default ClassifiedEdit;
