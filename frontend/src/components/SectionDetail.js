import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchSectionById } from "../features/sections/sectionsSlice";
import { Link } from "react-router-dom";
import "./SectionDetail.css";

const SectionDetail = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const dispatch = useDispatch();

  // Redux state selectors
  const section = useSelector((state) => state.sections.currentSection);
  const status = useSelector((state) => state.sections.status);
  const error = useSelector((state) => state.sections.error);

  // Fetch the section data on component mount
  useEffect(() => {
    if (id) {
      console.log("[SectionDetail] Fetching section with ID:", id);
      dispatch(fetchSectionById(id));
    }
  }, [id, dispatch]);

  // Early returns for loading/error states
  if (status === "loading") {
    return <p>Loading...</p>;
  }
  if (error) {
    console.error("[SectionDetail] Error:", error);
    return <p>Error: {error}</p>;
  }
  if (!section) {
    console.warn("[SectionDetail] No section found for ID:", id);
    return <p>Section not found.</p>;
  }

  // Get the current translation for the section
  const currentTranslation = section.translations.find(
    (t) => t.language === language
  ) || {
    name: section.name,
    description: section.description,
  };

  // Translate stories dynamically
  const translatedStories = section.stories.map((story) => {
    // If we can't find a matching language translation, fall back to the base story fields
    const translation = story.translations.find(
      (t) => t.language === language
    ) || {
      title: story.title || "Untitled",
      content: story.content || "",
    };

    // Destructure translation.id so we don't overwrite story.id
    const { id: translationId, ...safeTranslation } = translation;

    // Merge the story with the safe translation
    const mergedStory = {
      ...story,
      ...safeTranslation,
      translationId,
    };

    console.log("[SectionDetail] Final merged story:", mergedStory);

    return mergedStory;
  });

  return (
    <div className="section-detail">
      <h2>{currentTranslation.name}</h2>
      <p>{currentTranslation.description}</p>

      <ul className="section-stories">
        {translatedStories.length > 0 ? (
          translatedStories.map((story) => (
            <li key={story.id} className="section-story-item">
              <h3>
                <Link to={`/stories/${story.id}`}>{story.title}</Link>
              </h3>
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="section-story-image"
                />
              )}
              <p>
                {story.content
                  ? story.content.split(" ").slice(0, 25).join(" ")
                  : "No content available"}
                ...
              </p>
            </li>
          ))
        ) : (
          <p>No stories available for this section.</p>
        )}
      </ul>
    </div>
  );
};

export default SectionDetail;
