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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [translations, setTranslations] = useState([]);

  useEffect(() => {
    const existingStory = stories.find((s) => s.id === parseInt(id));
    if (existingStory) {
      setStory(existingStory);
      setTranslations(existingStory.translations);
      setLoading(false);
      return;
    }

    const fetchStory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/stories/${id}`);
        if (!response.ok) throw new Error("Failed to fetch story data");
        const data = await response.json();
        setStory(data);
        setTranslations(data.translations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, stories]);

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

  if (loading) return <p>{t("Loading story...")}</p>;
  if (error) return <p>{error}</p>;
  if (!story) return <p>{t("Story not found.")}</p>;

  // Retrieve the current translation for the selected language
  const currentTranslation = story.translations.find(
    (translation) => translation.language === i18n.language
  );
  const title = currentTranslation ? currentTranslation.title : story.title;
  const content = currentTranslation
    ? currentTranslation.content
    : story.content;

  return (
    <div className="story-detail">
      {editMode ? (
        <form onSubmit={(e) => e.preventDefault()}>
          {translations.map((translation, idx) => (
            <div key={idx}>
              <h3>{t(`Edit Translation (${translation.language})`)}</h3>
              <input
                type="text"
                value={translation.title}
                onChange={(e) =>
                  setTranslations((prev) =>
                    prev.map((tr, i) =>
                      i === idx ? { ...tr, title: e.target.value } : tr
                    )
                  )
                }
              />
              <textarea
                value={translation.content}
                onChange={(e) =>
                  setTranslations((prev) =>
                    prev.map((tr, i) =>
                      i === idx ? { ...tr, content: e.target.value } : tr
                    )
                  )
                }
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
            <img
              src={story.image_url}
              alt={title}
              className="story-detail__image"
            />
          )}
          <p className="story-detail__content">{content}</p>
        </>
      )}

      {user?.admin && (
        <div>
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
