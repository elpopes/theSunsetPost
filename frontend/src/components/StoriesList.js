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

  // Filter and shorten story content
  const filteredStories = stories
    .map((story) => {
      const translation = story.translations.find(
        (t) => t.language === language
      );
      if (translation) {
        const truncatedContent =
          translation.content.split(" ").slice(0, 25).join(" ") + "…"; // Limit to first 25 words
        return {
          ...story,
          title: translation.title,
          content: truncatedContent,
        };
      }
      return null;
    })
    .filter((story) => story !== null);

  const renderedStories = filteredStories.length ? (
    filteredStories.map((story) => (
      <li key={story.id} className="story-item">
        <h3 className="story-title">
          <Link to={`/stories/${story.id}`}>{story.title}</Link>
        </h3>
        <p className="story-content">{story.content}</p>
        {story.image_url && (
          <img
            src={story.image_url}
            alt={story.title}
            className="story-image"
          />
        )}
      </li>
    ))
  ) : (
    <p>{t("noStoriesAvailable")}</p>
  );

  return (
    <section className="stories-section">
      <h2>{t("stories")}</h2>
      {status === "loading" ? <p>{t("loading")}</p> : null}
      {status === "failed" ? <p>{error}</p> : null}
      <ul className="stories-list">{renderedStories}</ul>
    </section>
  );
};

export default StoriesList;
