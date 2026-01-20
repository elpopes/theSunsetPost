import React, { useMemo, useState } from "react";
import TranslationsForm from "./TranslationsForm";
import AuthorsForm from "./AuthorsForm";
import SectionsForm from "./SectionsForm";
import ImageUpload from "./ImageUpload";
import ClassifiedPostForm from "./ClassifiedPostForm";
import { useSelector } from "react-redux";
import { baseURL } from "../config";

const PostForm = () => {
  const user = useSelector((state) => state.auth.user);

  const [postType, setPostType] = useState("story"); // "story" | "classified"

  // Story-only state
  const [translations, setTranslations] = useState({
    en: { title: "", content: "", metaDescription: "", caption: "" },
    es: { title: "", content: "", metaDescription: "", caption: "" },
    zh: { title: "", content: "", metaDescription: "", caption: "" },
  });
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const canSubmitStory = useMemo(() => {
    if (!user?.token) return false;
    return selectedAuthors.length > 0 && selectedSections.length > 0;
  }, [user?.token, selectedAuthors, selectedSections]);

  const resetStory = () => {
    setTranslations({
      en: { title: "", content: "", metaDescription: "", caption: "" },
      es: { title: "", content: "", metaDescription: "", caption: "" },
      zh: { title: "", content: "", metaDescription: "", caption: "" },
    });
    setImage(null);
    setSelectedAuthors([]);
    setSelectedSections([]);
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post.");
      return;
    }
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
        resetStory();
      } else {
        const err = await response.json().catch(() => null);
        setMessage(err?.errors?.join(", ") || "Failed to post the story.");
      }
    } catch (error) {
      console.error("Error posting the story:", error);
      setMessage("An error occurred while posting the story.");
    }
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

      {postType === "story" ? (
        <>
          <form onSubmit={handleStorySubmit}>
            <TranslationsForm
              translations={translations}
              setTranslations={setTranslations}
            />

            <AuthorsForm
              selectedAuthors={selectedAuthors}
              setSelectedAuthors={setSelectedAuthors}
            />

            <SectionsForm
              selectedSections={selectedSections}
              setSelectedSections={setSelectedSections}
            />

            <ImageUpload image={image} setImage={setImage} />

            <button
              type="submit"
              disabled={!canSubmitStory}
              style={{ marginTop: 12 }}
            >
              Post Story
            </button>
          </form>

          <p>{message}</p>
        </>
      ) : (
        <ClassifiedPostForm />
      )}
    </div>
  );
};

export default PostForm;
