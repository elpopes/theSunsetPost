import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const PostForm = () => {
  const { t } = useTranslation();
  const [titleEn, setTitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [contentEs, setContentEs] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Create FormData for the request
    const formData = new FormData();
    formData.append("image", image);

    // Add translations for English, Spanish, and Chinese
    const translations = [
      { title: titleEn, content: contentEn, language: "en" },
      { title: titleEs, content: contentEs, language: "es" },
      { title: titleZh, content: contentZh, language: "zh" },
    ];

    formData.append("translations", JSON.stringify(translations));

    try {
      // Send the POST request to the backend
      const response = await fetch("/api/stories", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("user")).token
          }`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Story posted successfully!");
        // Reset form fields
        setTitleEn("");
        setContentEn("");
        setTitleEs("");
        setContentEs("");
        setTitleZh("");
        setContentZh("");
        setImage(null);
      } else {
        setMessage(data.error || "Failed to post the story.");
      }
    } catch (error) {
      setMessage("Error posting the story. Please try again.");
      console.error("Post form error:", error);
    }
  };

  return (
    <div>
      <h2>{t("Create a New Story")}</h2>
      <form onSubmit={handleSubmit}>
        {/* English Translation */}
        <h3>{t("English")}</h3>
        <div>
          <label>{t("Title")}:</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />
        </div>
        <div>
          <label>{t("Content")}:</label>
          <textarea
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Spanish Translation */}
        <h3>{t("Spanish")}</h3>
        <div>
          <label>{t("Title")}:</label>
          <input
            type="text"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            required
          />
        </div>
        <div>
          <label>{t("Content")}:</label>
          <textarea
            value={contentEs}
            onChange={(e) => setContentEs(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Chinese Translation */}
        <h3>{t("Chinese")}</h3>
        <div>
          <label>{t("Title")}:</label>
          <input
            type="text"
            value={titleZh}
            onChange={(e) => setTitleZh(e.target.value)}
            required
          />
        </div>
        <div>
          <label>{t("Content")}:</label>
          <textarea
            value={contentZh}
            onChange={(e) => setContentZh(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label>{t("Image")}:</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <button type="submit">{t("Post Story")}</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default PostForm;
