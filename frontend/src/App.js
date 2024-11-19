import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import MainLayout from "./components/MainLayout";
import StoriesList from "./components/StoriesList";
import StoryDetail from "./components/StoryDetail";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";
import { login } from "./features/auth/authSlice"; // Import login action

function App() {
  const dispatch = useDispatch();

  // Rehydrate user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log("Rehydrating user from localStorage:", user);
        dispatch(login(user)); // Dispatch login action to restore user state
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, [dispatch]);

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
