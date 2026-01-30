// src/components/ClassifiedPostForm.js
import React, { useMemo, useState } from "react";
import TranslationsForm from "./TranslationsForm";
import ImageUpload from "./ImageUpload";
import ClassifiedCategoriesAdmin from "./ClassifiedCategoriesAdmin";
import { useSelector } from "react-redux";
import { baseURL } from "../config";

const ClassifiedPostForm = () => {
  const user = useSelector((state) => state.auth.user);

  const [translations, setTranslations] = useState({
    en: { title: "", content: "", metaDescription: "", caption: "" },
    es: { title: "", content: "", metaDescription: "", caption: "" },
    zh: { title: "", content: "", metaDescription: "", caption: "" },
  });

  const [submitterEmail, setSubmitterEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");

  const [linkUrl, setLinkUrl] = useState(""); // <-- NEW

  const [photo, setPhoto] = useState(null);
  const [message, setMessage] = useState("");

  const [categories, setCategories] = useState([]); // fed by ClassifiedCategoriesAdmin

  const canSubmit = useMemo(() => {
    if (!user?.token) return false;
    return Boolean(submitterEmail.trim()) && Boolean(categoryId);
  }, [user?.token, submitterEmail, categoryId]);

  const selectedCategory = categories.find(
    (c) => String(c.id) === String(categoryId),
  );
  const subcategories = selectedCategory?.subcategories || [];

  const reset = () => {
    setTranslations({
      en: { title: "", content: "", metaDescription: "", caption: "" },
      es: { title: "", content: "", metaDescription: "", caption: "" },
      zh: { title: "", content: "", metaDescription: "", caption: "" },
    });
    setSubmitterEmail("");
    setExpiresAt("");
    setCategoryId("");
    setSubcategoryId("");
    setLinkUrl(""); // <-- NEW
    setPhoto(null);
  };

  // optional helper: normalize URL input
  const normalizeHttpUrl = (raw) => {
    const s = (raw || "").trim();
    if (!s) return "";
    // If they paste "example.com", make it https://example.com
    if (!/^https?:\/\//i.test(s)) return `https://${s}`;
    return s;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post.");
      return;
    }
    if (!categoryId) {
      setMessage("Please select a classifieds category.");
      return;
    }
    if (!submitterEmail.trim()) {
      setMessage("Please enter a submitter email (admin-only).");
      return;
    }

    const normalizedLink = normalizeHttpUrl(linkUrl);

    // optional: if they typed something but it's not http(s), block it early
    if (normalizedLink && !/^https?:\/\//i.test(normalizedLink)) {
      setMessage("Please enter a valid http(s) URL.");
      return;
    }

    const formData = new FormData();

    formData.append("classified_category_id", String(categoryId));
    if (subcategoryId) {
      formData.append("classified_subcategory_id", String(subcategoryId));
    }

    formData.append("submitter_email", submitterEmail.trim());
    formData.append("status", "published");

    if (expiresAt) {
      formData.append("expires_at", new Date(expiresAt).toISOString());
    }

    if (normalizedLink) {
      formData.append("link_url", normalizedLink); // <-- NEW
    }

    formData.append(
      "translations",
      JSON.stringify(
        Object.entries(translations).map(([lang, data]) => ({
          language: lang,
          title: data.title,
          body: data.content,
        })),
      ),
    );

    if (photo) formData.append("photo", photo);

    try {
      const res = await fetch(`${baseURL}/api/classifieds`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      if (res.ok) {
        setMessage("Classified posted successfully!");
        reset();
      } else {
        const err = await res.json().catch(() => null);
        setMessage(err?.errors?.join(", ") || "Failed to post the classified.");
      }
    } catch (error) {
      console.error("Error posting the classified:", error);
      setMessage("An error occurred while posting the classified.");
    }
  };

  return (
    <div>
      <ClassifiedCategoriesAdmin
        lang="en"
        onCategoriesChange={(cats) => {
          setCategories(cats);
          // if current selections become invalid after edits, clear them
          const stillHasCategory = cats.some(
            (c) => String(c.id) === String(categoryId),
          );
          if (categoryId && !stillHasCategory) {
            setCategoryId("");
            setSubcategoryId("");
          } else if (categoryId) {
            const cat = cats.find((c) => String(c.id) === String(categoryId));
            const stillHasSub = (cat?.subcategories || []).some(
              (sc) => String(sc.id) === String(subcategoryId),
            );
            if (subcategoryId && !stillHasSub) setSubcategoryId("");
          }
        }}
      />

      <form onSubmit={handleSubmit}>
        <TranslationsForm
          translations={translations}
          setTranslations={setTranslations}
        />

        <div style={{ marginTop: 10 }}>
          <label>Submitter email (admin-only):</label>
          <input
            type="email"
            value={submitterEmail}
            onChange={(e) => setSubmitterEmail(e.target.value)}
            placeholder="name@example.com"
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Category:</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setSubcategoryId("");
            }}
            style={{ width: "100%", marginTop: 4 }}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Subcategory (optional):</label>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
            disabled={!categoryId}
          >
            <option value="">None</option>
            {subcategories.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name} ({sc.slug})
              </option>
            ))}
          </select>
        </div>

        {/* NEW: link_url */}
        <div style={{ marginTop: 10 }}>
          <label>Link (optional):</label>
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            style={{ width: "100%", marginTop: 4 }}
          />
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            This will appear as a “More info” link on the listing.
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Expires at (optional):</label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            style={{ width: "100%", marginTop: 4 }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Photo (optional):</label>
          <ImageUpload image={photo} setImage={setPhoto} />
        </div>

        <button type="submit" disabled={!canSubmit} style={{ marginTop: 12 }}>
          Post Classified
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
};

export default ClassifiedPostForm;
