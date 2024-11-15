import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import StoriesList from "./components/StoriesList";
import StoryDetail from "./components/StoryDetail";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <StoriesList />
            </MainLayout>
          }
        />
        <Route
          path="/stories/:id"
          element={
            <MainLayout>
              <StoryDetail />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout>
              <SignUpForm />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginForm />
            </MainLayout>
          }
        />
        <Route
          path="/post"
          element={
            <MainLayout>
              <PostForm />
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
