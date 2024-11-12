import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import StoriesList from "./components/StoriesList";
import StoryDetail from "./components/StoryDetail";

function App() {
  return (
    <Router>
      <Routes>
        {/* Wrap StoriesList with MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <StoriesList />
            </MainLayout>
          }
        />
        {/* Wrap StoryDetail with MainLayout */}
        <Route
          path="/stories/:id"
          element={
            <MainLayout>
              <StoryDetail />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
