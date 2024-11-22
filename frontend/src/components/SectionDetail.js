import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchSectionById } from "../features/sections/sectionsSlice";
import { Link } from "react-router-dom";
import "./SectionDetail.css";

const SectionDetail = () => {
  const { id } = useParams(); // Get section ID from the route
  const { t, i18n } = useTranslation(); // For translations
  const language = i18n.language; // Current language
  const dispatch = useDispatch();

  const section = useSelector((state) => state.sections.currentSection); // Current section from Redux
  const status = useSelector((state) => state.sections.status);
  const error = useSelector((state) => state.sections.error);

  useEffect(() => {
    if (id) {
      dispatch(fetchSectionById(id)); // Fetch section data by ID
    }
  }, [id, dispatch]);

  if (status === "loading") return <p>{t("Loading section...")}</p>;
  if (error)
    return (
      <p>
        {t("Error loading section")}: {error}
      </p>
    );
  if (!section) return <p>{t("Section not found.")}</p>;

  const filteredStories = section.stories.map((story) => {
    const translation = story.translations.find((t) => t.language === language);
    return {
      ...story,
      title: translation ? translation.title : story.title,
      content: translation ? translation.content : story.content,
    };
  });

  return (
    <div className="section-detail">
      <h2>{section.name}</h2>
      <p>{section.description}</p>

      <ul className="section-stories">
        {filteredStories.length > 0 ? (
          filteredStories.map((story) => (
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
            </li>
          ))
        ) : (
          <p>{t("No stories available for this section.")}</p>
        )}
      </ul>
    </div>
  );
};

export default SectionDetail;
