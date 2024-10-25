import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories } from "../features/stories/storiesSlice";
import { useTranslation } from "react-i18next";

const StoriesList = () => {
  const { t, i18n } = useTranslation(); // Use i18n for language switching
  const dispatch = useDispatch();
  const stories = useSelector((state) => state.stories.items);
  const status = useSelector((state) => state.stories.status);
  const error = useSelector((state) => state.stories.error);

  // Use i18n.language to get the current language
  const language = i18n.language;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchStories());
    }
  }, [status, dispatch]);

  // Filter stories based on the current i18n language
  const filteredStories = stories.filter(
    (story) => story.language === language
  );

  const renderedStories = filteredStories.length ? (
    filteredStories.map((story) => (
      <li key={story.id}>
        <h3>{story.title}</h3>
        <p>{story.content}</p>
        {story.image_url && <img src={story.image_url} alt={story.title} />}
      </li>
    ))
  ) : (
    <p>{t("noStoriesAvailable")}</p>
  ); // Use i18n for translated fallback text

  return (
    <section>
      <h2>{t("stories")}</h2> {/* Translate the "Stories" header */}
      {status === "loading" ? <p>{t("loading")}</p> : null}{" "}
      {/* Translate status text */}
      {status === "failed" ? <p>{error}</p> : null}
      <ul>{renderedStories}</ul>
    </section>
  );
};

export default StoriesList;
