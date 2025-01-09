import React, { useState, useEffect } from "react";

const SectionsForm = ({ selectedSections, setSelectedSections }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/sections");
        if (response.ok) {
          setSections(await response.json());
        } else {
          console.error("Failed to fetch sections");
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

    fetchSections();
  }, []);

  return (
    <div>
      <h3>Select Sections</h3>
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
  );
};

export default SectionsForm;
