import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories } from "../features/stories/storiesSlice";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./StoriesList.css";

const StoriesList = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const stories = useSelector((state) => state.stories.items);
  const status = useSelector((state) => state.stories.status);
  const error = useSelector((state) => state.stories.error);

  const language = i18n.language;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchStories());
    }
  }, [status, dispatch]);

  const filteredStories = stories
    .filter((story) => {
      const sectionNames = story.sections?.map((section) => section.name) || [];
      const isClassifieds = sectionNames.includes("Classifieds");
      return sectionNames.length > 0 && !isClassifieds;
    })
    .map((story) => {
      const translation = story.translations?.find(
        (t) => t.language === language
      );

      const title = translation?.title || story.title || t("Untitled Story");
      const rawContent =
        translation?.content || story.content || t("No content available.");

      const isCJK = ["zh", "zh-CN", "zh-TW"].includes(language);
      const content = isCJK
        ? rawContent.substring(0, 100) + "…"
        : rawContent.split(" ").slice(0, 26).join(" ") + "…";

      return {
        ...story,
        title,
        content,
      };
    });

  return (
    <section className="stories-section">
      {error && (
        <p className="error-message">
          {t("Error fetching stories")}: {error}
        </p>
      )}

      {status === "loading" && <p>{t("Loading stories...")}</p>}

      {status === "succeeded" && filteredStories.length > 0 ? (
        <ul className="stories-list">
          {filteredStories.map((story) => (
            <li key={story.id} className="story-item">
              <Link
                to={`/stories/${story.slug || story.id}`}
                className="story-link"
              >
                {story.image_url && (
                  <img
                    src={story.image_url}
                    alt={story.title}
                    className="story-image"
                  />
                )}
                <h3 className="story-title">{story.title}</h3>
                <p className="story-content">{story.content}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>{t("No stories available.")}</p>
      )}
    </section>
  );
};

export default StoriesList;
