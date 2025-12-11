import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";
import { baseURL } from "../config";
import "./SearchBar.css";

const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const currentLang = i18n.language || "en";

  // Close bubble when clicking outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
        setQuery(""); // clear when closing
        setSuggestions([]);
        setError("");
        setLoading(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Fetch suggestions as user types (debounced)
  useEffect(() => {
    const trimmed = query.trim();

    // If bubble is closed or query is too short, reset suggestions
    if (!open || trimmed.length < 2) {
      setSuggestions([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        q: trimmed,
        language: currentLang, // your current backend supports this
        limit: "7", // 7 suggestions
      });

      fetch(`${baseURL}/api/search?${params.toString()}`, {
        signal: controller.signal,
      })
        .then((res) => {
          if (!res.ok) throw new Error("Search failed");
          return res.json();
        })
        .then((data) => {
          setSuggestions(Array.isArray(data.results) ? data.results : []);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          console.error("Search suggestions error:", err);
          setError(t("Error fetching suggestions"));
        })
        .finally(() => setLoading(false));
    }, 250); // 250ms debounce

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, currentLang, open, t]);

  const handleIconClick = () => {
    setOpen((prev) => {
      const next = !prev;

      if (!next) {
        // just closed
        setQuery("");
        setSuggestions([]);
        setError("");
        setLoading(false);
      } else {
        // just opened
        setSuggestions([]);
        setError("");
      }

      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setOpen(false);
    setQuery(""); // clear after search
    setSuggestions([]);
    setError("");
    setLoading(false);

    navigate(`/${currentLang}/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSuggestionClick = (item) => {
    setOpen(false);
    setQuery("");
    setSuggestions([]);
    setError("");
    setLoading(false);

    // item.url is like "/stories/slug"
    navigate(`/${currentLang}${item.url}`);
  };

  return (
    <div className="masthead-search" ref={containerRef}>
      <button
        type="button"
        className="masthead-search__icon-button"
        onClick={handleIconClick}
        aria-label={t("Search stories")}
      >
        <FiSearch className="masthead-search__icon" />
      </button>

      {open && (
        <div className="masthead-search__bubble">
          <form
            className="masthead-search__form"
            onSubmit={handleSubmit}
            role="search"
          >
            <input
              type="search"
              className="masthead-search__input"
              placeholder={t("Search stories")}
              aria-label={t("Search stories")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </form>

          {loading && (
            <div className="masthead-search__status">{t("Searching")}…</div>
          )}

          {error && (
            <div className="masthead-search__status masthead-search__status--error">
              {error}
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <ul className="masthead-search__suggestions">
              {suggestions.map((item) => (
                <li
                  key={`${item.type}-${item.id}-${item.slug || "noslug"}`}
                  className="masthead-search__suggestions-item"
                >
                  <button
                    type="button"
                    className="masthead-search__suggestion"
                    onClick={() => handleSuggestionClick(item)}
                  >
                    <span className="masthead-search__suggestion-title">
                      {item.title || item.slug || t("Untitled Story")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading &&
            !error &&
            query.trim().length >= 2 &&
            suggestions.length === 0 && (
              <div className="masthead-search__status masthead-search__status--empty">
                {t("No results yet")}
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
