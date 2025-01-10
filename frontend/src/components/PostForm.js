import React, { useState } from "react";
import TranslationsForm from "./TranslationsForm";
import AuthorsForm from "./AuthorsForm";
import SectionsForm from "./SectionsForm";
import ImageUpload from "./ImageUpload";
import { useSelector } from "react-redux";

const PostForm = () => {
  const user = useSelector((state) => state.auth.user);
  const [translations, setTranslations] = useState({
    en: { title: "", content: "", metaDescription: "", caption: "" },
    es: { title: "", content: "", metaDescription: "", caption: "" },
    zh: { title: "", content: "", metaDescription: "", caption: "" },
  });

  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post a story.");
      return;
    }

    if (selectedAuthors.length === 0) {
      setMessage("Please select at least one author.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append(
      "translations",
      JSON.stringify(
        Object.entries(translations).map(([lang, data]) => ({
          ...data,
          language: lang,
        }))
      )
    );
    formData.append("author_ids", JSON.stringify(selectedAuthors));
    formData.append("section_ids", JSON.stringify(selectedSections));

    try {
      const response = await fetch("http://localhost:3000/api/stories", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      if (response.ok) {
        setMessage("Story posted successfully!");
        setTranslations({
          en: { title: "", content: "", metaDescription: "", caption: "" },
          es: { title: "", content: "", metaDescription: "", caption: "" },
          zh: { title: "", content: "", metaDescription: "", caption: "" },
        });

        setImage(null);
        setSelectedAuthors([]);
        setSelectedSections([]);
      } else {
        setMessage("Failed to post the story.");
      }
    } catch (error) {
      console.error("Error posting the story:", error);
      setMessage("An error occurred while posting the story.");
    }
  };

  return (
    <div>
      <h2>Create a New Story</h2>
      <form onSubmit={handleSubmit}>
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

        <button type="submit">Post Story</button>
      </form>

      <p>{message}</p>
    </div>
  );
};

export default PostForm;
