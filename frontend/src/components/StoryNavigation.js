import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchStories } from "../features/stories/storiesSlice";
import "./StoryNavigation.css";

const StoryNavigation = ({ storyId, language }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { items: stories, status } = useSelector((state) => state.stories);

  useEffect(() => {
    // Story links can be opened directly without first visiting the homepage.
    if (status === "idle") dispatch(fetchStories());
  }, [dispatch, status]);

  if (status !== "succeeded") return null;

  const localizedStories = stories
    .filter(
      (story) =>
        !story.sections?.some(
          (section) => section.name?.toLowerCase() === "classifieds"
        )
    )
    .map((story) => ({
      ...story,
      translation: story.translations?.find(
        (translation) => translation.language === language
      ),
    }))
    .filter((story) => story.translation?.title?.trim())
    .sort(
      (a, b) =>
        new Date(b.created_at || 0) - new Date(a.created_at || 0) || b.id - a.id
    );

  const currentIndex = localizedStories.findIndex(
    (story) => story.id === storyId
  );
  if (currentIndex === -1) return null;

  const previous = localizedStories[currentIndex + 1];
  const next = localizedStories[currentIndex - 1];
  if (!previous && !next) return null;

  return (
    <nav className="story-navigation" aria-label={t("Story navigation")}>
      <h3 className="story-navigation__heading">{t("Continue reading")}</h3>
      <div className="story-navigation__cards">
        {[
          { story: previous, direction: "prev", label: t("Previous story") },
          { story: next, direction: "next", label: t("Next story") },
        ].map(({ story, direction, label }) =>
          story ? (
            <Link
              key={direction}
              className={`story-navigation__card story-navigation__card--${direction}`}
              to={`/${language}/stories/${story.slug || story.id}/`}
              rel={direction}
            >
              <span className="story-navigation__direction">
                {direction === "prev" && <span aria-hidden="true">← </span>}
                {label}
                {direction === "next" && <span aria-hidden="true"> →</span>}
              </span>
              <div className="story-navigation__preview">
                {story.image_url && (
                  <img
                    className="story-navigation__image"
                    src={story.image_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <div className="story-navigation__text">
                  {story.translation.meta_description?.trim() && (
                    <p className="story-navigation__description">
                      {story.translation.meta_description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ) : null
        )}
      </div>
    </nav>
  );
};

export default StoryNavigation;
