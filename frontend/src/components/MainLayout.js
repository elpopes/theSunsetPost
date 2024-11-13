// src/components/MainLayout.js
import React from "react";
import Header from "./Header";
import "./MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header /> {/* Full-width header */}
      <div className="main-layout__container">
        <aside className="main-layout__sidebar">
          <div className="ad-space">
            <h4>Advertisement</h4>
            <p>Your Ad Here</p>
          </div>
        </aside>
        <div className="main-layout__content">{children}</div>
        <aside className="main-layout__sidebar">
          <div className="ad-space">
            <h4>Advertisement</h4>
            <p>Your Ad Here</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MainLayout;
