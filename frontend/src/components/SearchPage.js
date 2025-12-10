// src/components/SearchPage.js
import React, { useEffect, useState } from "react";
import { useSearchParams, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { baseURL } from "../config";

const SearchPage = () => {
  const { lang } = useParams(); // from route like "/:lang/search"
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const { i18n } = useTranslation();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiLanguage = lang || i18n.language || "en";

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const params = new URLSearchParams({ q: trimmed, language: apiLanguage });

    fetch(`${baseURL}/api/search?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Search request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setResults(Array.isArray(data.results) ? data.results : []);
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError("There was a problem loading search results.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, apiLanguage]);

  const hasQuery = query.trim().length > 0;

  return (
    <main className="search-page">
      <header className="search-page__header">
        <h1 className="search-page__title">
          {hasQuery ? `Search results for “${query}”` : "Search"}
        </h1>
      </header>

      {loading && (
        <p className="search-page__status search-page__status--loading">
          Searching…
        </p>
      )}

      {!loading && error && (
        <p className="search-page__status search-page__status--error">
          {error}
        </p>
      )}

      {!loading && !error && hasQuery && results.length === 0 && (
        <p className="search-page__status search-page__status--empty">
          No results found.
        </p>
      )}

      {!loading && !error && !hasQuery && (
        <p className="search-page__status search-page__status--empty">
          Enter a word or phrase in the search box to find stories.
        </p>
      )}

      {!loading && !error && results.length > 0 && (
        <ul className="search-page__list">
          {results.map((item) => (
            <li
              key={`${item.type}-${item.id}-${item.language || "xx"}`}
              className="search-page__item"
            >
              <Link
                to={`/${apiLanguage}${item.url}`}
                className="search-page__link"
              >
                <article className="search-page__card">
                  {item.image_url && (
                    <div className="search-page__image-wrapper">
                      <img
                        src={item.image_url}
                        alt={item.title || "Story image"}
                        className="search-page__image"
                      />
                    </div>
                  )}

                  <div className="search-page__content">
                    <h2 className="search-page__item-title">{item.title}</h2>

                    <div className="search-page__meta">
                      {item.language && (
                        <span className="search-page__meta-item">
                          {item.language.toUpperCase()}
                        </span>
                      )}
                      {item.created_at && (
                        <span className="search-page__meta-item">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {item.snippet && (
                      <p className="search-page__snippet">{item.snippet}</p>
                    )}
                  </div>
                </article>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default SearchPage;
