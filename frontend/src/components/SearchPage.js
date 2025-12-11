// src/components/SearchPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import { baseURL } from "../config";
import "./SearchPage.css";

const SearchPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();

  const [stories, setStories] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const query = (searchParams.get("q") || "").trim();
  const language = i18n.language;

  // Fetch once per query; we don't depend on language here.
  useEffect(() => {
    if (!query) {
      setStories([]);
      setStatus("idle");
      setError("");
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        setStatus("loading");
        setError("");

        const params = new URLSearchParams({
          q: query,
          limit: "20",
        });

        const res = await fetch(`${baseURL}/api/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();

        setStories(Array.isArray(data.results) ? data.results : []);
        setStatus("succeeded");
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Search error:", err);
        setError(t("Error fetching search results"));
        setStatus("failed");
      }
    };

    fetchResults();

    return () => controller.abort();
  }, [query, t]);

  // Now, like SectionDetail, build language-specific view
  const translatedStories = stories.map((story) => {
    const translation =
      story.translations?.find((tr) => tr.language === language) ||
      story.translations?.[0] ||
      {};

    const { id: translationId, ...safeTranslation } = translation;

    return {
      ...story,
      ...safeTranslation,
    };
  });

  return (
    <section className="search-page">
      <h2 className="search-page__title">
        {t("Search results for")} “{query}”
      </h2>

      {status === "loading" && (
        <p className="search-page__status">{t("Searching")}…</p>
      )}

      {error && (
        <p className="search-page__status search-page__status--error">
          {error}
        </p>
      )}

      {status === "succeeded" && translatedStories.length === 0 && (
        <p className="search-page__status">{t("No results yet")}</p>
      )}

      {status === "succeeded" && translatedStories.length > 0 && (
        <ul className="search-page__results">
          {translatedStories.map((story) => {
            const isCJK = ["zh", "zh-CN", "zh-TW"].includes(language);
            const snippet = isCJK
              ? story.content?.slice(0, 60) + "..."
              : story.content?.split(" ").slice(0, 25).join(" ") + "...";

            return (
              <li key={story.id} className="search-page__result">
                <Link
                  to={`/${language}/stories/${story.slug || story.id}`}
                  className="search-page__result-link"
                >
                  {story.image_url && (
                    <img
                      src={story.image_url}
                      alt={story.title}
                      className="search-page__thumb"
                    />
                  )}

                  <div className="search-page__result-text">
                    <h3 className="search-page__result-title">{story.title}</h3>

                    {snippet && (
                      <div className="search-page__result-snippet">
                        <ReactMarkdown
                          components={{
                            a: ({ node, children, ...props }) => (
                              <a
                                {...props}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {snippet}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default SearchPage;
