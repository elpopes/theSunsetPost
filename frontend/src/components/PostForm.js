import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const PostForm = () => {
  const user = useSelector((state) => state.auth.user); // Get user from Redux
  const [authors, setAuthors] = useState([]); // Fetch authors from the backend
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [titleEn, setTitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [contentEs, setContentEs] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch authors from the backend on component mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/authors");
        const data = await response.json();
        setAuthors(data);
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };
    fetchAuthors();
  }, []);

  // Handle author selection
  const handleAuthorChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedAuthors(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post a story.");
      console.error("Authorization token is missing.");
      return;
    }

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
    formData.append("author_ids", JSON.stringify(selectedAuthors)); // Include selected authors

    try {
      console.log("Submitting the form...");
      console.log("Translations to be sent:", translations);
      console.log("Selected Authors:", selectedAuthors);
      console.log("Authorization Token:", user?.token);

      const response = await fetch("http://localhost:3000/api/stories", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${user.token}`, // Include token
        },
      });

      console.log("Response received. Status:", response.status);

      const data = await response.json();

      if (response.ok) {
        console.log("Story posted successfully!", data);
        setMessage("Story posted successfully!");
        // Reset form fields
        setTitleEn("");
        setContentEn("");
        setTitleEs("");
        setContentEs("");
        setTitleZh("");
        setContentZh("");
        setImage(null);
        setSelectedAuthors([]);
      } else {
        console.error("Failed to post story:", data.error);
        setMessage(data.error || "Failed to post the story.");
      }
    } catch (error) {
      console.error("Post form error:", error);
      setMessage("Error posting the story. Please try again.");
    }
  };

  return (
    <div>
      <h2>Create a New Story</h2>
      <form onSubmit={handleSubmit}>
        {/* English Translation */}
        <h3>English</h3>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={contentEn}
            onChange={(e) => setContentEn(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Spanish Translation */}
        <h3>Spanish</h3>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={titleEs}
            onChange={(e) => setTitleEs(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={contentEs}
            onChange={(e) => setContentEs(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Chinese Translation */}
        <h3>Chinese</h3>
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={titleZh}
            onChange={(e) => setTitleZh(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Content:</label>
          <textarea
            value={contentZh}
            onChange={(e) => setContentZh(e.target.value)}
            required
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label>Image:</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        {/* Author Selection */}
        <div>
          <label>Select Authors:</label>
          <select multiple onChange={handleAuthorChange}>
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Post Story</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default PostForm;
