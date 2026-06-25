import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { deleteStory } from "../features/stories/storiesSlice";
import { baseURL } from "../config";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import StoryEditor from "./StoryEditor";
import AuthorsForm from "./AuthorsForm";
import SectionsForm from "./SectionsForm";
import ImageUpload from "./ImageUpload";
import PrintQrLinkGenerator from "./PrintQrLinkGenerator";
import useStoryEngagement from "../utils/useStoryEngagement";
import { Helmet } from "react-helmet";
import "./StoryDetail.css";

const DATE_LOCALES = {
  en: "en-US",
  es: "es-US",
  zh: "zh-CN",
};

const isNumericIdentifier = (identifier) => /^\d+$/.test(identifier || "");

const StoryDetail = () => {
  const { id, lang } = useParams();
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const stories = useSelector((state) => state.stories.items);

  const [story, setStory] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editError, setEditError] = useState("");
  const [slug, setSlug] = useState("");
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [image, setImage] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);

  const language = (
    i18n.resolvedLanguage ||
    i18n.language ||
    "en"
  ).split("-")[0];
  const storyDetailRef = useStoryEngagement({
    storyId: story?.id,
    language,
    enabled: Boolean(story?.id && !user?.admin),
  });

  const initializeEditForm = (sourceStory) => {
    setTranslations(sourceStory.translations || []);
    setSlug(sourceStory.slug || "");
    setSelectedAuthors((sourceStory.authors || []).map((author) => String(author.id)));
    setSelectedSections((sourceStory.sections || []).map((section) => String(section.id)));
    setImage(null);
    setRemoveImage(false);
    setEditError("");
  };

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const existingStory = stories.find((s) => {
          if (isNumericIdentifier(id)) return s.id === Number(id);
          return s.slug === id;
        });

        if (existingStory) {
          setStory(existingStory);
          setTranslations(existingStory.translations);
        } else {
          const response = await fetch(`${baseURL}/api/stories/${id}`);
          if (!response.ok) throw new Error(t("Failed to fetch story data"));
          const data = await response.json();
          setStory(data);
          setTranslations(data.translations);
        }
      } catch (err) {
        console.error("[StoryDetail] Error fetching story:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, stories, t]);

  const handleDelete = () => {
    if (user?.token) {
      dispatch(deleteStory({ storyId: story.id, token: user.token })).then(() =>
        navigate("/")
      );
    }
  };

  const handleEdit = async () => {
    if (!user?.token) return;
    setEditError("");

    if (selectedAuthors.length === 0) {
      setEditError("Please select at least one author.");
      return;
    }

    if (selectedSections.length === 0) {
      setEditError("Please select at least one section.");
      return;
    }

    const sanitizedTranslations = translations.map(({ id, ...rest }) => rest);
    const formData = new FormData();
    formData.append("translations", JSON.stringify(sanitizedTranslations));
    formData.append("slug", slug);
    formData.append("author_ids", JSON.stringify(selectedAuthors));
    formData.append("section_ids", JSON.stringify(selectedSections));

    if (image) formData.append("image", image);
    if (removeImage) formData.append("remove_image", "true");

    try {
      const response = await fetch(`${baseURL}/api/stories/${story.id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: ["Bearer", user.token].join(" "),
        },
      });

      const responseBody = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          responseBody?.errors?.join(", ") ||
            responseBody?.error ||
            "Failed to edit story"
        );
      }

      setStory(responseBody);
      initializeEditForm(responseBody);
      setEditMode(false);

      if (responseBody.slug && responseBody.slug !== id) {
        const storyPathPrefix = lang ? `/${lang}/stories` : "/stories";
        navigate(`${storyPathPrefix}/${responseBody.slug}`, { replace: true });
      }
    } catch (err) {
      console.error("[StoryDetail] Error editing story:", err.message);
      setEditError(err.message);
    }
  };

  const handleTranslationChange = (idx, field, value) => {
    setTranslations((prev) =>
      prev.map((tr, i) => (i !== idx ? tr : { ...tr, [field]: value }))
    );
  };

  const startEdit = () => {
    initializeEditForm(story);
    setEditMode(true);
  };

  const cancelEdit = () => {
    initializeEditForm(story);
    setEditMode(false);
  };

  const handleImageChange = (nextImage) => {
    setImage(nextImage);
    if (nextImage) setRemoveImage(false);
  };

  if (loading) return <p>{t("Loading story...")}</p>;
  if (error) return <p>{error}</p>;
  if (!story) return <p>{t("Story not found.")}</p>;

  const currentTranslation = story.translations.find(
    (translation) => translation.language === language
  );
  const title = currentTranslation?.title || story.title;
  const content = currentTranslation?.content || story.content;
  const caption = currentTranslation?.caption || "";
  const metaDescription =
    currentTranslation?.meta_description || "The Sunset Post";

  const createdAt = story.created_at ? new Date(story.created_at) : null;
  const publishedDate =
    createdAt && !Number.isNaN(createdAt.getTime())
      ? new Intl.DateTimeFormat(DATE_LOCALES[language] || DATE_LOCALES.en, {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "America/New_York",
        }).format(createdAt)
      : null;

  return (
    <div className="story-detail" ref={storyDetailRef}>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        {story.created_at && (
          <meta property="article:published_time" content={story.created_at} />
        )}
        <link
          rel="canonical"
          href={`https://www.sunsetpost.org/stories/${story.slug}`}
        />
      </Helmet>

      {editMode ? (
        <form onSubmit={(e) => e.preventDefault()}>
          <section>
            <h3>{t("Story Settings")}</h3>

            <label>{t("Slug / Permalink")}</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="story-url-slug"
            />
            <p>
              {t(
                "Use lowercase words separated by hyphens. Saving will clean up spaces automatically."
              )}
            </p>

            <AuthorsForm
              selectedAuthors={selectedAuthors}
              setSelectedAuthors={setSelectedAuthors}
            />

            <SectionsForm
              selectedSections={selectedSections}
              setSelectedSections={setSelectedSections}
            />

            <h3>{t("Featured Image")}</h3>
            {story.image_url && !image && !removeImage && (
              <div style={{ marginBottom: 12 }}>
                <p>{t("Current featured image")}</p>
                <img
                  src={story.image_url}
                  alt={title}
                  style={{ maxWidth: "100%", maxHeight: "240px" }}
                />
              </div>
            )}
            {story.image_url && !image && (
              <label>
                <input
                  type="checkbox"
                  checked={removeImage}
                  onChange={(e) => setRemoveImage(e.target.checked)}
                />
                {" "}
                {t("Remove current featured image")}
              </label>
            )}
            {image && <p>{t("New featured image selected.")}</p>}
            <ImageUpload image={image} setImage={handleImageChange} />
          </section>

          {translations.map((translation, idx) => (
            <div key={translation.language}>
              <h3>{t(`Edit Translation (${translation.language})`)}</h3>

              <label>{t("Title")}</label>
              <input
                type="text"
                value={translation.title || ""}
                onChange={(e) =>
                  handleTranslationChange(idx, "title", e.target.value)
                }
              />

              <label>{t("Content")}</label>
              <StoryEditor
                value={translation.content || ""}
                onChange={(newMarkdown) =>
                  handleTranslationChange(idx, "content", newMarkdown)
                }
              />

              <label>{t("Caption")}</label>
              <input
                type="text"
                value={translation.caption || ""}
                onChange={(e) =>
                  handleTranslationChange(idx, "caption", e.target.value)
                }
                placeholder={t("Add a caption for the photo")}
              />

              <label>{t("Meta Description")}</label>
              <input
                type="text"
                value={translation.meta_description || ""}
                onChange={(e) =>
                  handleTranslationChange(
                    idx,
                    "meta_description",
                    e.target.value
                  )
                }
                placeholder={t("Add a meta description")}
              />
            </div>
          ))}
          {editError && <p className="story-detail__edit-error">{editError}</p>}
          <button type="button" onClick={handleEdit}>
            {t("Save Changes")}
          </button>
          <button type="button" onClick={cancelEdit}>
            {t("Cancel Edit")}
          </button>
        </form>
      ) : (
        <>
          <header className="story-detail__header">
            <h2 className="story-detail__title">{title}</h2>
          </header>

          {story.image_url && (
            <figure className="story-detail__image-container">
              <img
                src={story.image_url}
                alt={title}
                className="story-detail__image"
              />
              {caption && (
                <figcaption className="story-detail__caption">
                  {caption}
                </figcaption>
              )}
            </figure>
          )}

          {publishedDate && (
            <time className="story-detail__date" dateTime={story.created_at}>
              {publishedDate}
            </time>
          )}

          <div className="story-detail__content">
            <ReactMarkdown
              rehypePlugins={[rehypeRaw]}
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, children, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                img: ({ node, ...props }) => (
                  <figure>
                    <img
                      {...props}
                      alt={props.alt}
                      style={{ maxWidth: "100%", height: "auto" }}
                    />
                    {props.alt && (
                      <figcaption className="story-detail__caption">
                        {props.alt}
                      </figcaption>
                    )}
                  </figure>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </>
      )}

      <div className="story-detail__authors">
        <h3>{t("Written by")}</h3>
        {story.authors.length > 0 ? (
          story.authors.map((author) => {
            const authorTranslation = author.translations?.find(
              (trans) => trans.language === language
            );
            const bio = authorTranslation?.bio || author.bio;

            return (
              <div key={author.id} className="story-detail__author">
                {author.image_url && (
                  <img
                    src={author.image_url}
                    alt={author.name}
                    className="story-detail__author-image"
                  />
                )}
                <div className="story-detail__author-info">
                  <h4>{author.name}</h4>
                  <p className="story-detail__author-bio">{bio}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>{t("No authors available for this story.")}</p>
        )}
      </div>

      {user?.admin && (
        <div className="story-detail__admin-actions">
          <button onClick={editMode ? cancelEdit : startEdit}>
            {editMode ? t("Cancel Edit") : t("Edit")}
          </button>
          <button onClick={handleDelete}>{t("Delete")}</button>
          <PrintQrLinkGenerator story={story} targetLanguage={language} />
        </div>
      )}
    </div>
  );
};

export default StoryDetail;
