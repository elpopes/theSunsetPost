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
      dispatch(fetchSectionById(id));
    }
  }, [id, dispatch]);

  // Early returns for loading/error states
  if (status === "loading") {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error: {error}</p>;
  }
  if (!section) {
    return <p>Section not found.</p>;
  }

  // Get the current translation for the section
  const currentTranslation = section.translations.find(
    (t) => t.language === language
  ) || { name: section.name, description: section.description };

  // Translate stories dynamically
  const translatedStories = section.stories.map((story) => {
    const translation = story.translations.find(
      (t) => t.language === language
    ) || { title: story.title, content: story.content };

    // Remove `id` from the translation to prevent overwriting `story.id`
    const { id: _, ...safeTranslation } = translation;

    return { ...story, ...safeTranslation };
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
              <p>{story.content.split(" ").slice(0, 25).join(" ")}...</p>
              {/* Log the story ID and link */}
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
