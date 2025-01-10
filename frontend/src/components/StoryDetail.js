import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { deleteStory, editStory } from "../features/stories/storiesSlice";
import "./StoryDetail.css";

const StoryDetail = () => {
  const { id } = useParams();
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

  useEffect(() => {
    // Fetch story from Redux or API
    const fetchStory = async () => {
      setLoading(true);
      try {
        const existingStory = stories.find((s) => s.id === parseInt(id));
        if (existingStory) {
          setStory(existingStory);
          setTranslations(existingStory.translations);
        } else {
          const response = await fetch(
            `http://localhost:3000/api/stories/${id}`
          );
          if (!response.ok) throw new Error(t("Failed to fetch story data"));
          const data = await response.json();
          setStory(data);
          setTranslations(data.translations);
        }
      } catch (err) {
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

  const handleEdit = () => {
    if (user?.token) {
      dispatch(
        editStory({ storyId: story.id, translations, token: user.token })
      ).then(() => setEditMode(false));
    }
  };

  const handleTranslationChange = (idx, field, value) => {
    setTranslations((prev) =>
      prev.map((tr, i) => (i === idx ? { ...tr, [field]: value } : tr))
    );
  };

  if (loading) return <p>{t("Loading story...")}</p>;
  if (error) return <p>{error}</p>;
  if (!story) return <p>{t("Story not found.")}</p>;

  const currentTranslation = story.translations.find(
    (translation) => translation.language === i18n.language
  );
  const title = currentTranslation?.title || story.title;
  const content = currentTranslation?.content || story.content;
  const caption = currentTranslation?.caption || "";

  return (
    <div className="story-detail">
      {editMode ? (
        <form onSubmit={(e) => e.preventDefault()}>
          {translations.map((translation, idx) => (
            <div key={translation.language}>
              <h3>{t(`Edit Translation (${translation.language})`)}</h3>
              <label>{t("Title")}</label>
              <input
                type="text"
                value={translation.title}
                onChange={(e) =>
                  handleTranslationChange(idx, "title", e.target.value)
                }
              />
              <label>{t("Content")}</label>
              <textarea
                value={translation.content}
                onChange={(e) =>
                  handleTranslationChange(idx, "content", e.target.value)
                }
              />
              <label>{t("Caption")}</label>
              <input
                type="text"
                value={translation.caption}
                onChange={(e) =>
                  handleTranslationChange(idx, "caption", e.target.value)
                }
                placeholder={t("Add a caption for the photo")}
              />
            </div>
          ))}
          <button type="button" onClick={handleEdit}>
            {t("Save Changes")}
          </button>
        </form>
      ) : (
        <>
          <h2 className="story-detail__title">{title}</h2>
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
          <p className="story-detail__content">{content}</p>
        </>
      )}

      {/* Authors Section */}
      <div className="story-detail__authors">
        <h3>{t("Written by")}</h3>
        {story.authors.length > 0 ? (
          story.authors.map((author) => {
            const authorTranslation = author.translations?.find(
              (t) => t.language === i18n.language
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

      {/* Admin Actions */}
      {user?.admin && (
        <div className="story-detail__admin-actions">
          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? t("Cancel Edit") : t("Edit")}
          </button>
          <button onClick={handleDelete}>{t("Delete")}</button>
        </div>
      )}
    </div>
  );
};

export default StoryDetail;
