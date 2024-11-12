import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./StoryDetail.css";

const StoryDetail = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
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
  }, [id]);

  if (loading) return <p>Loading story...</p>;
  if (error) return <p>{error}</p>;
  if (!story) return <p>Story not found.</p>;

  return (
    <div className="story-detail">
      <h2 className="story-detail__title">{story.title}</h2>
      {story.image_url && (
        <img
          src={story.image_url}
          alt={story.title}
          className="story-detail__image"
        />
      )}
      <p className="story-detail__content">{story.content}</p>
    </div>
  );
};

export default StoryDetail;
