import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { baseURL } from "../config";

const AuthorsForm = ({ selectedAuthors, setSelectedAuthors }) => {
  const user = useSelector((state) => state.auth.user); // Get user from Redux
  const [authors, setAuthors] = useState([]);
  const [newAuthor, setNewAuthor] = useState({
    name: "",
    bios: { en: "", es: "", zh: "" },
    image: null,
  });
  const [message, setMessage] = useState("");

  // Fetch existing authors on component mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`${baseURL}/api/authors`);
        if (response.ok) {
          setAuthors(await response.json());
        } else {
          console.error("Failed to fetch authors");
        }
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };

    fetchAuthors();
  }, []);

  // Handle selecting existing authors
  const handleSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (opt) => opt.value);
    setSelectedAuthors(selected);
    console.log("Selected Authors:", selected);
  };

  // Handle adding a new author
  const handleAddAuthor = async () => {
    if (!newAuthor.name.trim()) {
      alert("Author name cannot be empty!");
      return;
    }

    const formData = new FormData();
    formData.append("name", newAuthor.name);

    // Prepare translations as a JSON array
    const translations = Object.entries(newAuthor.bios).map(
      ([language, bio]) => ({
        language,
        bio,
      })
    );
    formData.append("translations", JSON.stringify(translations));

    if (newAuthor.image) {
      formData.append("image", newAuthor.image);
    }

    // Debug: Log formData entries
    console.log("FormData being sent:");
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await fetch(`${baseURL}/api/authors`, {
      method: "POST",
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData,
    });

    if (response.ok) {
      const newAuthorData = await response.json();
      console.log("API Response:", newAuthorData); // Debug: Log API response
      setAuthors((prev) => [...prev, newAuthorData]);
      setNewAuthor({
        name: "",
        bios: { en: "", es: "", zh: "" },
        image: null,
      });
      setMessage("Author added successfully!");
    } else {
      const errorResponse = await response.json();
      console.error("API Error Response:", errorResponse); // Debug: Log error response
      setMessage("Failed to add author.");
    }
  };

  const handleBioChange = (lang, value) => {
    setNewAuthor((prev) => ({
      ...prev,
      bios: { ...prev.bios, [lang]: value },
    }));
  };

  return (
    <div>
      <h3>Select Authors</h3>
      <select multiple onChange={handleSelect}>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.name}
          </option>
        ))}
      </select>

      <h3>Add New Author</h3>
      <div>
        <div>
          <label>Author Name:</label>
          <input
            type="text"
            value={newAuthor.name}
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        {["en", "es", "zh"].map((lang) => (
          <div key={lang}>
            <label>{`Bio (${lang.toUpperCase()}):`}</label>
            <textarea
              value={newAuthor.bios[lang]}
              onChange={(e) => handleBioChange(lang, e.target.value)}
            ></textarea>
          </div>
        ))}
        <div>
          <label>Author Image:</label>
          <input
            type="file"
            onChange={(e) =>
              setNewAuthor((prev) => ({ ...prev, image: e.target.files[0] }))
            }
          />
        </div>
        <button type="button" onClick={handleAddAuthor}>
          Add Author
        </button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

export default AuthorsForm;
