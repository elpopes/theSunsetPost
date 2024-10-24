import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStories } from "../features/stories/storiesSlice";
import { useTranslation } from "react-i18next"; // Import useTranslation

const StoriesList = () => {
  const { t } = useTranslation(); // Access translation function
  const dispatch = useDispatch();

  const stories = useSelector((state) => state.stories.items);
  const status = useSelector((state) => state.stories.status);
  const error = useSelector((state) => state.stories.error);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchStories());
    }
  }, [status, dispatch]);

  let content;

  if (status === "loading") {
    content = <p>{t("loading")}</p>;
  } else if (status === "succeeded") {
    content = (
      <ul>
        {stories.map((story) => (
          <li key={story.id}>{story.title}</li>
        ))}
      </ul>
    );
  } else if (status === "failed") {
    content = <p>{error}</p>;
  }

  return (
    <section>
      <h2>{t("stories")}</h2>
      {content}
    </section>
  );
};

export default StoriesList;
