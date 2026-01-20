// src/App.js
import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
  useParams,
} from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import MainLayout from "./components/MainLayout";
import StoriesList from "./components/StoriesList";
import StoryDetail from "./components/StoryDetail";
import SectionDetail from "./components/SectionDetail";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";
import ContactForm from "./components/ContactForm";
import About from "./components/About";
import Footer from "./components/Footer";
import LanguageHandler from "./components/LanguageHandler";
import SearchPage from "./components/SearchPage";
import ClassifiedsPage from "./components/ClassifiedsPage";
import ClassifiedDetail from "./components/ClassifiedDetail";
import { login } from "./features/auth/authSlice";
import { initGA, logPageView } from "./analytics";

const normalizeLang = (lng) => {
  const s = (lng || "en").toLowerCase();
  if (s.startsWith("es")) return "es";
  if (s.startsWith("zh")) return "zh";
  return "en";
};

// Redirect /:lang/sections/classifieds -> /:lang/classifieds
const ClassifiedsAlias = () => {
  const { lang } = useParams();
  const l = normalizeLang(lang);
  return <Navigate to={`/${l}/classifieds`} replace />;
};

// Redirect legacy /classifieds (no lang) -> /{detectedLang}/classifieds
const LegacyClassifiedsRedirect = () => {
  const { i18n } = useTranslation();

  const stored =
    (typeof window !== "undefined" && window.localStorage
      ? localStorage.getItem("i18nextLng")
      : null) || "";

  const browser =
    typeof navigator !== "undefined" ? navigator.language || "" : "";

  const l = normalizeLang(stored || i18n.language || browser || "en");
  return <Navigate to={`/${l}/classifieds`} replace />;
};

const LegacyClassifiedDetailRedirect = () => {
  const { idOrSlug } = useParams();
  const { i18n } = useTranslation();

  const stored =
    (typeof window !== "undefined" && window.localStorage
      ? localStorage.getItem("i18nextLng")
      : null) || "";

  const browser =
    typeof navigator !== "undefined" ? navigator.language || "" : "";

  const l = normalizeLang(stored || i18n.language || browser || "en");
  return <Navigate to={`/${l}/classifieds/${idOrSlug}`} replace />;
};

// Nested component to handle GA tracking on route change
const AppRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    logPageView(location.pathname + location.search);
  }, [location]);

  return (
    <div className="app-container">
      <Routes>
        {/* -------------------- */}
        {/* Language-prefixed routes */}
        {/* -------------------- */}
        <Route
          path="/:lang"
          element={
            <MainLayout>
              <LanguageHandler />
              <StoriesList />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/about"
          element={
            <MainLayout>
              <LanguageHandler />
              <About />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/contact"
          element={
            <MainLayout>
              <LanguageHandler />
              <ContactForm />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/signup"
          element={
            <MainLayout>
              <LanguageHandler />
              <SignUpForm />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/login"
          element={
            <MainLayout>
              <LanguageHandler />
              <LoginForm />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/post"
          element={
            <MainLayout>
              <LanguageHandler />
              <PostForm />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/stories/:id"
          element={
            <MainLayout>
              <LanguageHandler />
              <StoryDetail />
            </MainLayout>
          }
        />

        <Route
          path="/:lang/classifieds"
          element={
            <MainLayout>
              <LanguageHandler />
              <ClassifiedsPage />
            </MainLayout>
          }
        />

        <Route
          path="/:lang/sections/classifieds"
          element={<ClassifiedsAlias />}
        />

        <Route
          path="/:lang/classifieds/:idOrSlug"
          element={
            <MainLayout>
              <LanguageHandler />
              <ClassifiedDetail />
            </MainLayout>
          }
        />

        <Route
          path="/:lang/sections/:name"
          element={
            <MainLayout>
              <LanguageHandler />
              <SectionDetail />
            </MainLayout>
          }
        />
        <Route
          path="/:lang/search"
          element={
            <MainLayout>
              <LanguageHandler />
              <SearchPage />
            </MainLayout>
          }
        />

        {/* -------------------- */}
        {/* Legacy routes */}
        {/* -------------------- */}
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
          path="/search"
          element={
            <MainLayout>
              <SearchPage />
            </MainLayout>
          }
        />

        <Route path="/classifieds" element={<LegacyClassifiedsRedirect />} />
        <Route
          path="/sections/classifieds"
          element={<LegacyClassifiedsRedirect />}
        />

        <Route
          path="/classifieds/:idOrSlug"
          element={<LegacyClassifiedDetailRedirect />}
        />
      </Routes>

      <Footer />
    </div>
  );
};

function App() {
  const dispatch = useDispatch();

  // Restore login state on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        dispatch(login(user));
      } catch (error) {
        console.error("Error parsing stored user:", error);
      }
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
