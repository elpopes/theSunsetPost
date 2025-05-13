import React from "react";

const ImageUpload = ({ image, setImage }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  return (
    <div>
      <label>Featured Image (used for social sharing):</label>
      <input type="file" accept="image/*" onChange={handleChange} />
      {image && (
        <div style={{ marginTop: "10px" }}>
          <p>Preview:</p>
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            style={{ maxWidth: "100%", maxHeight: "300px" }}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
