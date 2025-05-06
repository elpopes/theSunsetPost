import React, { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import MainLayout from "./components/MainLayout";
import StoriesList from "./components/StoriesList";
import StoryDetail from "./components/StoryDetail";
import SectionDetail from "./components/SectionDetail";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";
import ContactForm from "./components/ContactForm";
import About from "./components/About";
import Footer from "./components/Footer"; // Import the new Footer component
import { login } from "./features/auth/authSlice";

function App() {
  const dispatch = useDispatch();

  // Rehydrate user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(login(user)); // Dispatch login action to restore user state
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app-container">
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
            path="/about"
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MainLayout>
                <ContactForm />
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
            path="/sections/:name"
            element={
              <MainLayout>
                <SectionDetail />
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
        <Footer /> {/* Add Footer component here */}
      </div>
    </BrowserRouter>
  );
}

export default App;
