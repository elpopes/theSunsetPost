import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const PostForm = () => {
  const user = useSelector((state) => state.auth.user); // Get user from Redux
  const [authors, setAuthors] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    bio: "",
    image: null,
  });
  const [translations, setTranslations] = useState({
    en: { title: "", content: "", metaDescription: "" },
    es: { title: "", content: "", metaDescription: "" },
    zh: { title: "", content: "", metaDescription: "" },
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchAuthorsAndSections = async () => {
      try {
        const [authorsResponse, sectionsResponse] = await Promise.all([
          fetch("http://localhost:3000/api/authors"),
          fetch("http://localhost:3000/api/sections"),
        ]);
        setAuthors(await authorsResponse.json());
        setSections(await sectionsResponse.json());
      } catch (error) {
        console.error("Error fetching authors or sections:", error);
      }
    };
    fetchAuthorsAndSections();
  }, []);

  const handleTranslationChange = (lang, field, value) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  const handleAddAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthor.name.trim()) {
      alert("Author name cannot be empty!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newAuthor.name);
      formData.append("bio", newAuthor.bio);
      if (newAuthor.image) formData.append("image", newAuthor.image);

      const response = await fetch("http://localhost:3000/api/authors", {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData,
      });

      if (response.ok) {
        const newAuthorData = await response.json(); // Await response here
        setAuthors((prev) => [...prev, newAuthorData]); // Then update the state
        setNewAuthor({ name: "", bio: "", image: null });
        setMessage("Author added successfully!");
      } else {
        setMessage("Failed to add author.");
      }
    } catch (error) {
      console.error("Error adding author:", error);
      setMessage("An error occurred while adding the author.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) {
      setMessage("Unauthorized: Please log in to post a story.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image); // This is now the featured AND social image
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
          en: { title: "", content: "", metaDescription: "" },
          es: { title: "", content: "", metaDescription: "" },
          zh: { title: "", content: "", metaDescription: "" },
        });
        setImage(null);
        setSelectedAuthors([]);
        setSelectedSections([]);
      } else {
        setMessage("Failed to post the story.");
      }
    } catch (error) {
      setMessage("Error posting the story. Please try again.");
    }
  };

  return (
    <div>
      <h2>Create a New Story</h2>
      <form onSubmit={handleSubmit}>
        {["en", "es", "zh"].map((lang) => (
          <div key={lang}>
            <h3>{lang.toUpperCase()}</h3>
            <div>
              <label>Title:</label>
              <input
                type="text"
                value={translations[lang].title}
                onChange={(e) =>
                  handleTranslationChange(lang, "title", e.target.value)
                }
                required
              />
            </div>
            <div>
              <label>Content:</label>
              <textarea
                value={translations[lang].content}
                onChange={(e) =>
                  handleTranslationChange(lang, "content", e.target.value)
                }
                required
              ></textarea>
            </div>
            <div>
              <label>Meta Description:</label>
              <textarea
                value={translations[lang].metaDescription}
                onChange={(e) =>
                  handleTranslationChange(
                    lang,
                    "metaDescription",
                    e.target.value
                  )
                }
                maxLength="160"
              ></textarea>
            </div>
          </div>
        ))}

        <div>
          <label>Featured Image (used for social sharing):</label>
          <input type="file" onChange={(e) => setImage(e.target.files[0])} />
        </div>

        <div>
          <label>Select Authors:</label>
          <select
            multiple
            onChange={(e) =>
              setSelectedAuthors(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
          >
            {authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Select Sections:</label>
          <select
            multiple
            onChange={(e) =>
              setSelectedSections(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Post Story</button>
      </form>

      <h3>Add New Author</h3>
      <form onSubmit={handleAddAuthor}>
        <div>
          <label>Author Name:</label>
          <input
            type="text"
            value={newAuthor.name}
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>
        <div>
          <label>Author Bio:</label>
          <textarea
            value={newAuthor.bio}
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, bio: e.target.value }))
            }
          ></textarea>
        </div>
        <div>
          <label>Author Image:</label>
          <input
            type="file"
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, image: e.target.files[0] }))
            }
          />
        </div>
        <button type="submit">Add Author</button>
      </form>

      <p>{message}</p>
    </div>
  );
};

export default PostForm;
