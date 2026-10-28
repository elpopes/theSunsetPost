import React, { useId } from "react";
import { useTranslation } from "react-i18next";
import ImagePlacementPreview from "./ImagePlacementPreview";

const ImageUpload = ({ image, setImage, existingImageUrl = "", previewVariant = "story" }) => {
  const inputId = useId();
  const { t } = useTranslation();
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  return (
    <div>
      <label htmlFor={inputId}>{t("image_preview.featured_image")}</label>
      <input id={inputId} type="file" accept="image/*" onChange={handleChange} />
      <ImagePlacementPreview image={image} imageUrl={existingImageUrl} variant={previewVariant} />
    </div>
  );
};

export default ImageUpload;
