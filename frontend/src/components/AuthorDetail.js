import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet";
import { baseURL } from "../config";
import "./AuthorDetail.css";

const LANGUAGES = ["en", "es", "zh"];

const stripMarkdownForExcerpt = (input = "") => {
  let text = input;
  text = text.replace(/<br\s*\/?>/gi, " ");
  text = text.replace(/<\/?[^>]+>/g, "");
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, "");
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  text = text.replace(/`{1,3}[^`]*`{1,3}/g, "");
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  text = text.replace(/^\s{0,3}>\s?/gm, "");
  text = text.replace(/[*_~]/g, "");
  text = text.replace(/\s+/g, " ").trim();
  return text;
};

const makeExcerpt = (rawContent, language) => {
  const text = stripMarkdownForExcerpt(rawContent || "");
  if (!text) return "";

  if (language === "zh") {
    return text.length > 100 ? `${text.slice(0, 100)}…` : text;
  }

  const words = text.split(" ");
  return words.length > 26 ? `${words.slice(0, 26).join(" ")}…` : text;
};

const translationFor = (translations = [], language) =>
  translations.find((translation) => translation.language === language) ||
  translations.find((translation) => translation.language === "en") ||
  translations[0];

const buildTranslationState = (translations = []) =>
  LANGUAGES.reduce((memo, language) => {
    const translation = translations.find((tr) => tr.language === language);
    memo[language] = { bio: translation?.bio || "" };
    return memo;
  }, {});

const AuthorDetail = () => {
  const { idOrSlug } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).split("-")[0];

  const [author, setAuthor] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [translations, setTranslations] = useState(buildTranslationState());
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [replacementAuthorId, setReplacementAuthorId] = useState("");

  const fetchAuthor = async () => {
    setLoading(true);
    setError(null);

    try {
      const [authorResponse, authorsResponse] = await Promise.all([
        fetch(`${baseURL}/api/authors/${idOrSlug}`),
        fetch(`${baseURL}/api/authors`),
      ]);

      if (!authorResponse.ok) throw new Error(t("Failed to fetch author"));
      if (!authorsResponse.ok) throw new Error(t("Failed to fetch authors"));

      const authorData = await authorResponse.json();
      const authorsData = await authorsResponse.json();

      setAuthor(authorData);
      setAuthors(authorsData);
      initializeEditForm(authorData, authorsData);
    } catch (err) {
      console.error("[AuthorDetail] Error fetching author:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeEditForm = (sourceAuthor, allAuthors = authors) => {
    setName(sourceAuthor?.name || "");
    setSlug(sourceAuthor?.slug || "");
    setTranslations(buildTranslationState(sourceAuthor?.translations || []));
    setImage(null);
    setRemoveImage(false);
    setEditError("");

    const staff = allAuthors.find(
      (candidate) =>
        candidate.id !== sourceAuthor?.id &&
        candidate.name?.toLowerCase?.().trim() === "staff"
    );
    const fallback = allAuthors.find((candidate) => candidate.id !== sourceAuthor?.id);
    setReplacementAuthorId(String(staff?.id || fallback?.id || ""));
  };

  useEffect(() => {
    fetchAuthor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idOrSlug, language]);

  const currentAuthorTranslation = translationFor(author?.translations, language);
  const bio = currentAuthorTranslation?.bio || author?.bio || "";

  const storyCards = useMemo(() => {
    return (author?.stories || []).map((story) => {
      const storyTranslation = translationFor(story.translations, language);
      const title = storyTranslation?.title || t("Untitled Story");
      const content = storyTranslation?.content || "";

      return {
        ...story,
        title,
        excerpt: makeExcerpt(content, language),
      };
    });
  }, [author?.stories, language, t]);

  const otherAuthors = useMemo(() => {
    return authors.filter((candidate) => candidate.id !== author?.id);
  }, [authors, author?.id]);

  const handleTranslationChange = (lang, value) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { bio: value },
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file || null);
    if (file) setRemoveImage(false);
  };

  const handleUpdate = async () => {
    if (!user?.token || !author) return;
    setEditError("");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append(
      "translations",
      JSON.stringify(
        Object.entries(translations).map(([lang, data]) => ({
          language: lang,
          bio: data.bio,
        }))
      )
    );

    if (image) formData.append("image", image);
    if (removeImage) formData.append("remove_image", "true");

    try {
      const response = await fetch(`${baseURL}/api/authors/${author.id}`, {
        method: "PUT",
        headers: {
          Authorization: ["Bearer", user.token].join(" "),
        },
        body: formData,
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.errors?.join(", ") ||
            responseBody?.error ||
            "Failed to update author"
        );
      }

      setAuthor(responseBody);
      setAuthors((prev) =>
        prev.map((candidate) =>
          candidate.id === responseBody.id ? { ...candidate, ...responseBody } : candidate
        )
      );
      initializeEditForm(responseBody);
      setEditMode(false);

      if (responseBody.slug && responseBody.slug !== idOrSlug) {
        navigate(`/${language}/authors/${responseBody.slug}`, { replace: true });
      }
    } catch (err) {
      console.error("[AuthorDetail] Error updating author:", err.message);
      setEditError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!user?.token || !author) return;
    setEditError("");

    const hasStories = (author.stories || []).length > 0;
    if (hasStories && !replacementAuthorId) {
      setEditError("Choose a replacement author before deleting this author.");
      return;
    }

    const confirmed = window.confirm(
      hasStories
        ? "Delete this author and reassign their stories to the selected replacement author?"
        : "Delete this author?"
    );
    if (!confirmed) return;

    const query = hasStories
      ? `?replacement_author_id=${encodeURIComponent(replacementAuthorId)}`
      : "";

    try {
      const response = await fetch(`${baseURL}/api/authors/${author.id}${query}`, {
        method: "DELETE",
        headers: {
          Authorization: ["Bearer", user.token].join(" "),
        },
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(responseBody?.error || "Failed to delete author");
      }

      navigate(`/${language}`, { replace: true });
    } catch (err) {
      console.error("[AuthorDetail] Error deleting author:", err.message);
      setEditError(err.message);
    }
  };

  const cancelEdit = () => {
    initializeEditForm(author);
    setEditMode(false);
  };

  if (loading) return <p>{t("Loading author...")}</p>;
  if (error) return <p>{error}</p>;
  if (!author) return <p>{t("Author not found.")}</p>;

  return (
    <section className="author-detail">
      <Helmet>
        <title>{author.name}</title>
        <meta name="description" content={bio || "The Sunset Post"} />
        <link
          rel="canonical"
          href={`https://www.sunsetpost.org/authors/${author.slug}`}
        />
      </Helmet>

      <header className="author-detail__header">
        {author.image_url && (
          <img
            src={author.image_url}
            alt={author.name}
            className="author-detail__image"
          />
        )}
        <div>
          <h2>{author.name}</h2>
          {bio && <p className="author-detail__bio">{bio}</p>}
        </div>
      </header>

      {user?.admin && (
        <section className="author-detail__admin">
          <div className="author-detail__admin-meta">
            <span>Author ID: {author.id}</span>
            <span>Slug: {author.slug}</span>
            <span>Stories attached: {(author.stories || []).length}</span>
          </div>

          {!editMode ? (
            <div className="author-detail__admin-actions">
              <button type="button" onClick={() => setEditMode(true)}>
                Edit author
              </button>
              <button type="button" onClick={handleDelete}>
                Delete author
              </button>
              {(author.stories || []).length > 0 && (
                <label>
                  Replacement author:
                  <select
                    value={replacementAuthorId}
                    onChange={(event) => setReplacementAuthorId(event.target.value)}
                  >
                    <option value="">Choose replacement</option>
                    {otherAuthors.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          ) : (
            <form className="author-detail__edit-form" onSubmit={(e) => e.preventDefault()}>
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <label>
                Slug / Permalink
                <input
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                />
              </label>

              {LANGUAGES.map((lang) => (
                <label key={lang}>
                  Bio ({lang.toUpperCase()})
                  <textarea
                    value={translations[lang]?.bio || ""}
                    onChange={(event) => handleTranslationChange(lang, event.target.value)}
                  />
                </label>
              ))}

              {author.image_url && !image && !removeImage && (
                <img
                  src={author.image_url}
                  alt={author.name}
                  className="author-detail__image-preview"
                />
              )}

              {author.image_url && !image && (
                <label className="author-detail__checkbox-label">
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(event) => setRemoveImage(event.target.checked)}
                  />
                  Remove current author image
                </label>
              )}

              <label>
                Replace author image
                <input type="file" accept="image/*" onChange={handleImageChange} />
              </label>

              {image && <p>New image selected: {image.name}</p>}

              {editError && <p className="author-detail__error">{editError}</p>}

              <div className="author-detail__admin-actions">
                <button type="button" onClick={handleUpdate}>
                  Save author
                </button>
                <button type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!editMode && editError && <p className="author-detail__error">{editError}</p>}
        </section>
      )}

      <section className="author-detail__stories">
        <h3>{t("Stories by this author")}</h3>
        {storyCards.length > 0 ? (
          <ul className="author-detail__story-list">
            {storyCards.map((story) => (
              <li key={story.id} className="author-detail__story-card">
                <Link to={`/${language}/stories/${story.slug || story.id}`}>
                  <div className="author-detail__story-image-slot">
                    {story.image_url && (
                      <img
                        src={story.image_url}
                        alt={story.title}
                        className="author-detail__story-image"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <h4>{story.title}</h4>
                  {story.excerpt && <p>{story.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>{t("No stories available for this author.")}</p>
        )}
      </section>

      {otherAuthors.length > 0 && (
        <section className="author-detail__other-authors">
          <h3>{t("Other authors")}</h3>
          <div className="author-detail__author-carousel">
            {otherAuthors.map((candidate) => (
              <Link
                key={candidate.id}
                to={`/${language}/authors/${candidate.slug || candidate.id}`}
                className="author-detail__other-author-card"
              >
                <div className="author-detail__other-author-image-slot">
                  {candidate.image_url && (
                    <img
                      src={candidate.image_url}
                      alt={candidate.name}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
                <span>{candidate.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </section>
  );
};

export default AuthorDetail;
