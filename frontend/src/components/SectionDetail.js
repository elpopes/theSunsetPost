import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchSectionById } from "../features/sections/sectionsSlice";
import "./SectionDetail.css";

const SectionDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const dispatch = useDispatch();

  const section = useSelector((state) => state.sections.currentSection);
  const status = useSelector((state) => state.sections.status);
  const error = useSelector((state) => state.sections.error);

  useEffect(() => {
    if (id) {
      dispatch(fetchSectionById(id));
    }
  }, [id, dispatch]);

  if (status === "loading") {
    return <p>{t("loading")}</p>;
  }

  if (error) {
    console.error("[SectionDetail] Error:", error);
    return (
      <p>
        {t("Error fetching section data")}: {error}
      </p>
    );
  }

  if (!section) {
    return <p>{t("Section not found.")}</p>;
  }

  const currentTranslation = section.translations.find(
    (t) => t.language === language
  ) || {
    name: section.name,
    description: section.description,
  };

  const translatedStories = section.stories.map((story) => {
    const translation = story.translations.find(
      (t) => t.language === language
    ) || {
      title: story.title || "Untitled",
      content: story.content || "",
    };

    return { ...story, ...translation };
  });

  return (
    <div className="section-detail">
      <h2>{currentTranslation.name}</h2>
      <p>{currentTranslation.description}</p>

      <ul className="section-stories">
        {translatedStories.length > 0 ? (
          translatedStories.map((story) => (
            <li key={story.id} className="section-story-item">
              <Link to={`/stories/${story.id}`} className="section-story-link">
                {story.image_url && (
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="section-story-image"
                  />
                )}
                <h3>{story.title}</h3>
                <p>{story.content.split(" ").slice(0, 25).join(" ")}...</p>
              </Link>
            </li>
          ))
        ) : (
          <p>
            {t("no_stories.development")}{" "}
            <Link to="/contact">{t("no_stories.contact_link")}</Link>
          </p>
        )}
      </ul>
    </div>
  );
};

export default SectionDetail;
