import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { baseURL } from "../config";
import "./PopularStories.css";

const normalizeLanguage = (language) => {
  const normalized = (language || "en").toLowerCase();
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("zh")) return "zh";
  return "en";
};

const PopularStories = () => {
  const { t, i18n } = useTranslation();
  const language = normalizeLanguage(
    i18n.resolvedLanguage || i18n.language
  );
  const [stories, setStories] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    const fetchPopularStories = async () => {
      setStatus("loading");

      try {
        const response = await fetch(
          `${baseURL}/api/stories/popular?language=${language}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            `Popular stories request failed with ${response.status}`
          );
        }

        const data = await response.json();
        setStories(Array.isArray(data) ? data : []);
        setStatus("succeeded");
      } catch (error) {
        if (error.name === "AbortError") return;

        console.warn("[PopularStories] Failed to load:", error);
        setStories([]);
        setStatus("failed");
      }
    };

    fetchPopularStories();

    return () => controller.abort();
  }, [language]);

  const localizedStories = useMemo(
    () =>
      stories
        .map((story) => {
          const translation = story.translations?.find(
            (item) => item.language === language
          );

          if (!translation?.title) return null;

          return {
            id: story.id,
            slug: story.slug,
            imageUrl: story.image_url,
            title: translation.title,
          };
        })
        .filter(Boolean),
    [stories, language]
  );

  if (status === "failed") return null;

  if (status === "loading") {
    return (
      <section
        className="popular-stories popular-stories--loading"
        aria-label={t("Popular Now")}
        aria-busy="true"
      >
        <h2 className="popular-stories__heading">{t("Popular Now")}</h2>
        <div className="popular-stories__grid" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <div className="popular-stories__skeleton" key={item} />
          ))}
        </div>
      </section>
    );
  }

  if (localizedStories.length === 0) return null;

  return (
    <section className="popular-stories" aria-labelledby="popular-stories-title">
      <h2 className="popular-stories__heading" id="popular-stories-title">
        {t("Popular Now")}
      </h2>

      <ol className="popular-stories__grid">
        {localizedStories.map((story) => (
          <li className="popular-stories__item" key={story.id}>
            <Link
              className="popular-stories__link"
              to={`/${language}/stories/${story.slug || story.id}`}
            >
              <span className="popular-stories__image-slot">
                {story.imageUrl && (
                  <img
                    className="popular-stories__image"
                    src={story.imageUrl}
                    alt=""
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </span>
              <span className="popular-stories__title">{story.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
};

export default PopularStories;
