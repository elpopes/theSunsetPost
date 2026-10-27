import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./StoryNavigation.css";

const StoryNavigation = ({ navigation, language }) => {
  const { t } = useTranslation();
  if (!navigation || navigation.language !== language) return null;
  const { previous, next } = navigation;
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
                  {story.meta_description?.trim() && (
                    <p className="story-navigation__description">
                      {story.meta_description}
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
