import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "./StoryDetail.css";

const StoryDetail = () => {
  const { id } = useParams(); // Get story ID from the route
  const { i18n } = useTranslation(); // For translations
  const language = i18n.language; // Current language
  const stories = useSelector((state) => state.stories.items); // Stories from Redux store
  const [story, setStory] = useState(null); // Local state for the story
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Check if the story exists in the Redux store first
    const existingStory = stories.find((s) => s.id === parseInt(id));
    if (existingStory) {
      setStory(existingStory);
      setLoading(false);
      return;
    }

    // Fetch the story from the backend if not found in Redux
    const fetchStory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3000/api/stories/${id}`);
        if (!response.ok) throw new Error("Failed to fetch story data");
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

  // Use the selected translation or fallback to primary language
  const translation = story.translations.find((t) => t.language === language);
  const title = translation ? translation.title : story.title;
  const content = translation ? translation.content : story.content;

  return (
    <div className="story-detail">
      <h2 className="story-detail__title">{title}</h2>
      {story.image_url && (
        <img
          src={story.image_url}
          alt={title}
          className="story-detail__image"
        />
      )}
      <p className="story-detail__content">{content}</p>

      {/* Render authors */}
      <div className="story-detail__authors">
        {story.authors.length > 0 ? (
          story.authors.map((author) => {
            // Use the selected translation for author bio or fallback to primary language
            const translation = author.translations?.find(
              (t) => t.language === language
            );
            const bio = translation ? translation.bio : author.bio;

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
                  <p>{bio}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p>No authors available for this story.</p>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;
