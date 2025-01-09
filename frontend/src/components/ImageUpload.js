import React from "react";

const ImageUpload = ({ image, setImage }) => (
  <div>
    <label>Featured Image (used for social sharing):</label>
    <input type="file" onChange={(e) => setImage(e.target.files[0])} />
  </div>
);

export default ImageUpload;
