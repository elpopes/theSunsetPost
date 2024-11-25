import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const PostForm = () => {
  const user = useSelector((state) => state.auth.user); // Get user from Redux
  const [authors, setAuthors] = useState([]); // Fetch authors from the backend
  const [sections, setSections] = useState([]); // Fetch sections from the backend
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]); // Selected sections
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorBio, setNewAuthorBio] = useState("");
  const [newAuthorImage, setNewAuthorImage] = useState(null); // New author image
  const [titleEn, setTitleEn] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [titleEs, setTitleEs] = useState("");
  const [contentEs, setContentEs] = useState("");
  const [titleZh, setTitleZh] = useState("");
  const [contentZh, setContentZh] = useState("");
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  // Fetch authors and sections from the backend on component mount
  useEffect(() => {
    const fetchAuthorsAndSections = async () => {
      try {
        const [authorsResponse, sectionsResponse] = await Promise.all([
          fetch("http://localhost:3000/api/authors"),
          fetch("http://localhost:3000/api/sections"),
        ]);
        const authorsData = await authorsResponse.json();
        const sectionsData = await sectionsResponse.json();
        setAuthors(authorsData);
        setSections(sectionsData);
      } catch (error) {
        console.error("Error fetching authors or sections:", error);
      }
    };
    fetchAuthorsAndSections();
  }, []);

  // Handle author selection
  const handleAuthorChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedAuthors(selected);
  };

  // Handle section selection
  const handleSectionChange = (e) => {
    const selected = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedSections(selected);
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorName.trim()) {
      alert("Author name cannot be empty!");
      return;
    }

    try {
      // Use FormData to handle image upload
      const formData = new FormData();
      formData.append("name", newAuthorName);
      formData.append("bio", newAuthorBio);
      if (newAuthorImage) {
        formData.append("image", newAuthorImage);
      }

      const response = await fetch("http://localhost:3000/api/authors", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`, // Include the token for authentication
        },
        body: formData,
      });

      if (response.ok) {
        const newAuthor = await response.json();
        setAuthors((prevAuthors) => [...prevAuthors, newAuthor]);
        setNewAuthorName("");
        setNewAuthorBio("");
        setNewAuthorImage(null);
        setMessage("Author added successfully!");
      } else {
        const error = await response.json();
        console.error("Error adding author:", error);
        setMessage(error.message || "Failed to add author.");
      }
    } catch (error) {
      console.error("Error adding author:", error);
      setMessage("An error occurred while adding the author.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post a story.");
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
    formData.append("author_ids", JSON.stringify(selectedAuthors));
    formData.append("section_ids", JSON.stringify(selectedSections)); // Include selected sections

    try {
      const response = await fetch("http://localhost:3000/api/stories", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${user.token}`,
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
        setSelectedAuthors([]);
        setSelectedSections([]);
      } else {
        setMessage(data.error || "Failed to post the story.");
      }
    } catch (error) {
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

        {/* Section Selection */}
        <div>
          <label>Select Sections:</label>
          <select multiple onChange={handleSectionChange}>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Post Story</button>
      </form>

      {/* Add New Author Form */}
      <h3>Add New Author</h3>
      <form onSubmit={handleAddAuthor}>
        <div>
          <label>Author Name:</label>
          <input
            type="text"
            value={newAuthorName}
            onChange={(e) => setNewAuthorName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Author Bio:</label>
          <textarea
            value={newAuthorBio}
            onChange={(e) => setNewAuthorBio(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label>Author Image:</label>
          <input
            type="file"
            onChange={(e) => setNewAuthorImage(e.target.files[0])}
          />
        </div>
        <button type="submit">Add Author</button>
      </form>

      <p>{message}</p>
    </div>
  );
};

export default PostForm;
