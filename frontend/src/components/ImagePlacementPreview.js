import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./StoriesList.css";
import "./StoryDetail.css";
import "./ImagePlacementPreview.css";

const ImagePlacementPreview = ({
  image,
  imageUrl = "",
  variant = "story",
  authorName = "",
  authorBio = "",
}) => {
  const { t } = useTranslation();
  const [localPreview, setLocalPreview] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [failedSource, setFailedSource] = useState("");

  useEffect(() => {
    if (!image) return undefined;
    const url = URL.createObjectURL(image);
    setLocalPreview({ image, url });
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const source = image
    ? (localPreview?.image === image ? localPreview.url : "")
    : imageUrl;

  if (!source) return null;

  return (
    <section
      className={`image-placement-preview image-placement-preview--${variant}`}
      aria-label={t("image_preview.region")}
    >
      {failedSource === source ? (
        <p role="alert">{t("image_preview.load_error")}</p>
      ) : (
        <div className="image-placement-preview__grid">
          <figure>
            <figcaption>{t("image_preview.original")}</figcaption>
            <img
              className="image-placement-preview__original"
              src={source}
              alt={t("image_preview.original")}
              onLoad={(event) => setDimensions({
                source,
                width: event.currentTarget.naturalWidth,
                height: event.currentTarget.naturalHeight,
              })}
              onError={() => setFailedSource(source)}
            />
            {dimensions?.source === source && (
              <p className="image-placement-preview__note">
                {t("image_preview.dimensions", dimensions)}
              </p>
            )}
          </figure>

          {variant === "story" && (
            <figure>
              <figcaption>{t("image_preview.homepage")}</figcaption>
              <div className="story-image-slot image-placement-preview__story-slot">
                <img className="story-image" src={source} alt={t("image_preview.homepage_crop")} />
              </div>
              <p className="image-placement-preview__note">{t("image_preview.story_note")}</p>
            </figure>
          )}

          {variant === "author" && (
            <figure>
              <figcaption>{t("image_preview.byline")}</figcaption>
              <div className="story-detail__author">
                <img className="story-detail__author-image" src={source} alt={t("image_preview.author_crop")} />
                <div className="story-detail__author-info">
                  <h4>{authorName || t("image_preview.author_name")}</h4>
                  {authorBio && <p className="story-detail__author-bio">{authorBio}</p>}
                </div>
              </div>
              <p className="image-placement-preview__note">{t("image_preview.author_note")}</p>
            </figure>
          )}
        </div>
      )}
    </section>
  );
};

export default ImagePlacementPreview;
