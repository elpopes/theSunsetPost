import React from "react";
import Header from "./Header"; // Import the Header component
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header /> {/* Render the Header at the top */}
      <div className="main-layout__content">{children}</div>
      <aside className="main-layout__sidebar">
        {/* Placeholder for advertisement or other sidebar content */}
        <div className="ad-space">
          <h4>Advertisement</h4>
          <p>Your Ad Here</p>
        </div>
      </aside>
    </div>
  );
};

export default MainLayout;
