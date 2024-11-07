import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories } from "../features/stories/storiesSlice";
import { useTranslation } from "react-i18next";
import "./StoriesList.css"; // Import the CSS file

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
    console.log("Fetched stories:", stories); // Check if data is fetched
  }, [status, dispatch, stories]);

  // Update filtering to handle translations
  const filteredStories = stories
    .map((story) => {
      const translation = story.translations.find(
        (t) => t.language === language
      );
      return translation
        ? {
            ...story,
            title: translation.title,
            content: translation.content,
          }
        : null;
    })
    .filter((story) => story !== null);

  console.log("Filtered stories:", filteredStories); // Check if filtering is working

  const renderedStories = filteredStories.length ? (
    filteredStories.map((story) => (
      <li key={story.id} className="story-item">
        <h3 className="story-title">{story.title}</h3>
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
