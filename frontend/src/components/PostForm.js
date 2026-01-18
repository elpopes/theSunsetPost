import React, { useMemo, useState } from "react";
import TranslationsForm from "./TranslationsForm";
import AuthorsForm from "./AuthorsForm";
import SectionsForm from "./SectionsForm";
import ImageUpload from "./ImageUpload";
import { useSelector } from "react-redux";
import { baseURL } from "../config";

// TODO (next): build these
// import ClassifiedFields from "./ClassifiedFields";

const PostForm = () => {
  const user = useSelector((state) => state.auth.user);

  const [postType, setPostType] = useState("story"); // "story" | "classified"

  const [translations, setTranslations] = useState({
    en: { title: "", content: "", metaDescription: "", caption: "" },
    es: { title: "", content: "", metaDescription: "", caption: "" },
    zh: { title: "", content: "", metaDescription: "", caption: "" },
  });

  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);

  // Classified-specific state (for later step)
  const [classifiedCategoryId, setClassifiedCategoryId] = useState("");
  const [classifiedSubcategoryId, setClassifiedSubcategoryId] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [expiresAt, setExpiresAt] = useState(""); // ISO string or yyyy-mm-dd from input

  const [image, setImage] = useState(null); // story image or classified photo (we'll reuse)
  const [message, setMessage] = useState("");

  const canSubmit = useMemo(() => {
    if (!user?.token) return false;

    if (postType === "story") {
      return selectedAuthors.length > 0 && selectedSections.length > 0;
    }

    if (postType === "classified") {
      return Boolean(classifiedCategoryId) && Boolean(submitterEmail.trim());
    }

    return false;
  }, [
    user?.token,
    postType,
    selectedAuthors,
    selectedSections,
    classifiedCategoryId,
    submitterEmail,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post.");
      return;
    }

    if (postType === "story") {
      if (selectedAuthors.length === 0) {
        setMessage("Please select at least one author.");
        return;
      }
      if (selectedSections.length === 0) {
        setMessage("Please select at least one section.");
        return;
      }

      const formData = new FormData();
      if (image) formData.append("image", image);

      formData.append(
        "translations",
        JSON.stringify(
          Object.entries(translations).map(([lang, data]) => ({
            ...data,
            language: lang,
          })),
        ),
      );

      formData.append("author_ids", JSON.stringify(selectedAuthors));
      formData.append("section_ids", JSON.stringify(selectedSections));

      try {
        const response = await fetch(`${baseURL}/api/stories`, {
          method: "POST",
          headers: { Authorization: `Bearer ${user.token}` },
          body: formData,
        });

        if (response.ok) {
          setMessage("Story posted successfully!");
          resetAll();
        } else {
          const err = await response.json().catch(() => null);
          setMessage(err?.errors?.join(", ") || "Failed to post the story.");
        }
      } catch (error) {
        console.error("Error posting the story:", error);
        setMessage("An error occurred while posting the story.");
      }
      return;
    }

    if (postType === "classified") {
      if (!classifiedCategoryId) {
        setMessage("Please select a classifieds category.");
        return;
      }
      if (!submitterEmail.trim()) {
        setMessage("Please enter a submitter email (admin-only).");
        return;
      }

      const payload = {
        classified: {
          classified_category_id: Number(classifiedCategoryId),
          classified_subcategory_id: classifiedSubcategoryId
            ? Number(classifiedSubcategoryId)
            : null,
          submitter_email: submitterEmail.trim(),
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          status: "published", // or "draft" if you want initial drafts
          classified_translations_attributes: Object.entries(translations).map(
            ([lang, data]) => ({
              language: lang,
              title: data.title,
              body: data.content, // reuse `content` from TranslationsForm as body
            }),
          ),
        },
      };

      // If you want photo upload for classifieds in v1, we should use FormData here too.
      // For now, keep JSON only; we can switch to FormData once Classified photo is wired.
      try {
        const response = await fetch(`${baseURL}/api/classifieds`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setMessage("Classified posted successfully!");
          resetAll();
        } else {
          const err = await response.json().catch(() => null);
          setMessage(
            err?.errors?.join(", ") || "Failed to post the classified.",
          );
        }
      } catch (error) {
        console.error("Error posting the classified:", error);
        setMessage("An error occurred while posting the classified.");
      }
    }
  };

  const resetAll = () => {
    setTranslations({
      en: { title: "", content: "", metaDescription: "", caption: "" },
      es: { title: "", content: "", metaDescription: "", caption: "" },
      zh: { title: "", content: "", metaDescription: "", caption: "" },
    });
    setImage(null);
    setSelectedAuthors([]);
    setSelectedSections([]);
    setClassifiedCategoryId("");
    setClassifiedSubcategoryId("");
    setSubmitterEmail("");
    setExpiresAt("");
  };

  return (
    <div>
      <h2>
        {postType === "story"
          ? "Create a New Story"
          : "Create a New Classified"}
      </h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Post type:</label>
        <select value={postType} onChange={(e) => setPostType(e.target.value)}>
          <option value="story">Story</option>
          <option value="classified">Classified</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        <TranslationsForm
          translations={translations}
          setTranslations={setTranslations}
        />

        {postType === "story" && (
          <>
            <AuthorsForm
              selectedAuthors={selectedAuthors}
              setSelectedAuthors={setSelectedAuthors}
            />
            <SectionsForm
              selectedSections={selectedSections}
              setSelectedSections={setSelectedSections}
            />
            <ImageUpload image={image} setImage={setImage} />
          </>
        )}

        {postType === "classified" && (
          <>
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
              <input
                value={classifiedCategoryId}
                onChange={(e) => setClassifiedCategoryId(e.target.value)}
                placeholder="(temporary) category id"
                style={{ width: "100%", marginTop: 4 }}
              />
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
                Temporary input. Next substep: replace with dropdown fed by
                /api/classified_categories.
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <label>Subcategory (optional):</label>
              <input
                value={classifiedSubcategoryId}
                onChange={(e) => setClassifiedSubcategoryId(e.target.value)}
                placeholder="(temporary) subcategory id"
                style={{ width: "100%", marginTop: 4 }}
              />
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

            {/* Later: Classified photo upload */}
            {/* <ImageUpload image={image} setImage={setImage} /> */}
          </>
        )}

        <button type="submit" disabled={!canSubmit} style={{ marginTop: 12 }}>
          {postType === "story" ? "Post Story" : "Post Classified"}
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
};

export default PostForm;
