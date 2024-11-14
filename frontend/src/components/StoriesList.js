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
    .map((story) => {
      const translation = story.translations.find(
        (t) => t.language === language
      );
      if (translation) {
        const truncatedContent =
          translation.content.split(" ").slice(0, 25).join(" ") + "…";
        return {
          ...story,
          title: translation.title,
          content: truncatedContent,
        };
      }
      return null;
    })
    .filter((story) => story !== null);

  return (
    <section className="stories-section">
      <h2>{t("Stories")}</h2>

      {/* Display error message if there is an error */}
      {error && (
        <p className="error-message">
          {t("Error fetching stories")}: {error}
        </p>
      )}

      {/* Display a loading message if the stories are being fetched */}
      {status === "loading" && <p>{t("Loading stories...")}</p>}

      {/* Display the stories list if available */}
      {status === "succeeded" && filteredStories.length > 0 ? (
        <ul className="stories-list">
          {filteredStories.map((story) => (
            <li key={story.id} className="story-item">
              <h3 className="story-title">
                <Link to={`/stories/${story.id}`}>{story.title}</Link>
              </h3>
              {story.image_url && (
                <img
                  src={story.image_url}
                  alt={story.title}
                  className="story-image"
                />
              )}
              <p className="story-content">{story.content}</p>
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
