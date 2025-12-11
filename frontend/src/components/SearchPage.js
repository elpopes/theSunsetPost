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
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const query = (searchParams.get("q") || "").trim();
  const currentLang = i18n.language || "en";

  useEffect(() => {
    if (!query) {
      setResults([]);
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
          language: currentLang,
          limit: "20", // 👈 cap full search at 20
        });

        const res = await fetch(`${baseURL}/api/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(Array.isArray(data.results) ? data.results : []);
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
  }, [query, currentLang, t]);

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

      {status === "succeeded" && results.length === 0 && (
        <p className="search-page__status">{t("No results yet")}</p>
      )}

      {status === "succeeded" && results.length > 0 && (
        <ul className="search-page__results">
          {results.map((item) => (
            <li
              key={`${item.type}-${item.id}-${item.slug || "noslug"}`}
              className="search-page__result"
            >
              <Link
                to={`/${currentLang}${item.url}`}
                className="search-page__result-link"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="search-page__thumb"
                  />
                )}

                <div className="search-page__result-text">
                  <h3 className="search-page__result-title">{item.title}</h3>

                  {item.snippet && (
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
                        {item.snippet}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default SearchPage;
