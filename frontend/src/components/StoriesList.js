import React, { useEffect, useMemo, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { fetchStories } from "../features/stories/storiesSlice";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./StoriesList.css";

const PAGE_SIZE = 30;

const stripMarkdownForExcerpt = (input = "") => {
  let s = input;

  s = s.replace(/<br\s*\/?>/gi, " ");
  s = s.replace(/<\/?[^>]+>/g, "");
  s = s.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  s = s.replace(/`{1,3}[^`]*`{1,3}/g, "");
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  s = s.replace(/^\s{0,3}>\s?/gm, "");
  s = s.replace(/[*_~]/g, "");
  s = s.replace(/\s+/g, " ").trim();

  return s;
};

const makeExcerpt = (rawContent, isCJK) => {
  const text = stripMarkdownForExcerpt(rawContent || "");
  if (!text) return "";

  if (isCJK) {
    const maxChars = 100;
    return text.length > maxChars ? text.slice(0, maxChars) + "…" : text;
  }

  const words = text.split(" ");
  const maxWords = 26;
  return words.length > maxWords
    ? words.slice(0, maxWords).join(" ") + "…"
    : text;
};

const StoriesList = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();

  const stories = useSelector((state) => state.stories?.items);
  const status = useSelector((state) => state.stories?.status);
  const error = useSelector((state) => state.stories?.error);

  const language = i18n.language;
  const isCJK = ["zh", "zh-CN", "zh-TW"].includes(language);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (status === "idle" || !status) dispatch(fetchStories());
  }, [status, dispatch]);

  const filteredStories = useMemo(() => {
    const safeStories = Array.isArray(stories) ? stories : [];

    return safeStories
      .filter((story) => {
        const sectionNames =
          story.sections?.map((section) => section.name) || [];
        const isClassifieds = sectionNames.includes("Classifieds");
        return sectionNames.length > 0 && !isClassifieds;
      })
      .map((story) => {
        const translation = story.translations?.find(
          (tr) => tr.language === language
        );
        const title = translation?.title || story.title || t("Untitled Story");
        const rawContent = translation?.content || story.content || "";

        return {
          ...story,
          title,
          excerpt: makeExcerpt(rawContent, isCJK),
        };
      });
  }, [stories, language, t, isCJK]);

  const visibleStories = filteredStories.slice(0, visibleCount);
  const canLoadMore = visibleCount < filteredStories.length;

  return (
    <section className="stories-section">
      {error && (
        <p className="error-message">
          {t("Error fetching stories")}: {error}
        </p>
      )}

      {status === "loading" && <p>{t("Loading stories...")}</p>}

      {status === "succeeded" && visibleStories.length > 0 && (
        <>
          <ul className="stories-list">
            {visibleStories.map((story) => (
              <li key={story.id} className="story-item">
                <Link
                  to={`/${i18n.language}/stories/${story.slug || story.id}`}
                  className="story-image-link"
                >
                  <div className="story-image-slot">
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="story-image"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                </Link>

                <h3 className="story-title">
                  <Link
                    to={`/${i18n.language}/stories/${story.slug || story.id}`}
                    className="story-link"
                  >
                    {story.title}
                  </Link>
                </h3>

                <div className="story-content">
                  <p className="story-excerpt">{story.excerpt}</p>
                </div>
              </li>
            ))}
          </ul>

          {canLoadMore && (
            <div className="stories-load-more">
              <button
                type="button"
                className="stories-load-more__btn"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              >
                {t("Load more stories")}
              </button>
            </div>
          )}
        </>
      )}

      {status === "succeeded" && filteredStories.length === 0 && !error && (
        <p>{t("No stories available.")}</p>
      )}

      {!status && !error && <p>{t("Loading stories...")}</p>}
    </section>
  );
};

export default StoriesList;
