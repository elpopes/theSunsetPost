import React, { useState, useEffect } from "react";
import { baseURL } from "../config";

const SectionsForm = ({ selectedSections, setSelectedSections }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const response = await fetch(`${baseURL}/api/sections`);
        if (response.ok) {
          const data = await response.json();
          setSections(data);
        } else {
          console.error("Failed to fetch sections, status:", response.status);
        }
      } catch (error) {
        console.error("Error fetching sections:", error);
      }
    };

    fetchSections();
  }, []);

  const handleSelectionChange = (e) => {
    const selectedValues = Array.from(
      e.target.selectedOptions,
      (opt) => opt.value
    );
    setSelectedSections(selectedValues);
  };

  return (
    <div>
      <h3>Select Sections</h3>
      {sections.length === 0 && <p>Loading sections...</p>}
      <select multiple onChange={handleSelectionChange}>
        {sections.map((section) => (
          <option key={section.id} value={section.id}>
            {section.name}
          </option>
        ))}
      </select>
      <p>Currently selected sections: {JSON.stringify(selectedSections)}</p>
    </div>
  );
};

export default SectionsForm;
