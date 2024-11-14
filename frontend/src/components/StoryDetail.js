import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "./StoryDetail.css";

const StoryDetail = () => {
  const { id } = useParams();
  const { i18n } = useTranslation();
  const language = i18n.language;
  const stories = useSelector((state) => state.stories.items);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Find the story in the Redux store first
    const existingStory = stories.find((s) => s.id === parseInt(id));
    if (existingStory) {
      setStory(existingStory);
      setLoading(false);
      return;
    }

    // Fetch the story from the backend if not found in the Redux store
    const fetchStory = async () => {
      setLoading(true);
      console.log(`Fetching story details for ID: ${id} at /api/stories/${id}`);

      try {
        const response = await fetch(`/api/stories/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch story data");
        }
        const data = await response.json();
        setStory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStory();
  }, [id, stories]);

  if (loading) return <p>Loading story...</p>;
  if (error) return <p>{error}</p>;
  if (!story) return <p>Story not found.</p>;

  // Find the selected translation based on the current language
  const translation = story.translations.find((t) => t.language === language);

  // If no translation is found, display a fallback message
  if (!translation) {
    return <p>No translation available for the selected language.</p>;
  }

  return (
    <div className="story-detail">
      <h2 className="story-detail__title">{translation.title}</h2>
      {story.image_url && (
        <img
          src={story.image_url}
          alt={translation.title}
          className="story-detail__image"
        />
      )}
      <p className="story-detail__content">{translation.content}</p>
    </div>
  );
};

export default StoryDetail;
