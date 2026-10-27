import React, { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import storiesReducer from "../features/stories/storiesSlice";
import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import StoryDetail from "./StoryDetail";

// The editor and Markdown plugins are unrelated to article/navigation fetching.
jest.mock("./StoryEditor", () => () => null);
jest.mock("react-markdown", () => ({ children }) => <div>{children}</div>);
jest.mock("rehype-raw", () => () => {});
jest.mock("remark-gfm", () => () => {});
jest.mock("../utils/useStoryEngagement", () => () => null);
jest.mock("./SeoHead", () => () => null);
jest.mock("react-helmet", () => ({ Helmet: () => null }));

const makeStory = (id) => ({
  id,
  slug: `story-${id}`,
  created_at: `2026-07-0${id}T12:00:00Z`,
  authors: [],
  sections: [],
  translations: [
    { language: "en", title: `Article ${id}`, content: "Article body", meta_description: `English summary ${id}` },
    { language: "es", title: `Artículo ${id}`, content: "Texto del artículo", meta_description: `Resumen ${id}` },
  ],
});

const apiStory = (language = "en") => ({
  ...makeStory(2),
  navigation: {
    language,
    previous: { id: 1, slug: "story-1", meta_description: language === "es" ? "Resumen 1" : "English summary 1" },
    next: { id: 3, slug: "story-3", meta_description: language === "es" ? "Resumen 3" : "English summary 3" },
  },
});

const renderArticle = ({ stories = [], status = "idle" } = {}) => {
  const store = configureStore({
    reducer: { stories: storiesReducer, auth: () => ({ user: null }) },
    preloadedState: { stories: { items: stories, status, error: null } },
  });
  const i18n = i18next.createInstance();
  i18n.init({
    lng: "en",
    initImmediate: false,
    resources: { en: { translation: en }, es: { translation: es } },
  });
  render(
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <MemoryRouter
          initialEntries={["/en/stories/story-2/"]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/:lang/stories/:id" element={<StoryDetail />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </Provider>
  );
  return i18n;
};

const originalFetch = global.fetch;
afterEach(() => { global.fetch = originalFetch; });

test("opens a story with both cards from one small request and never fetches the archive", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => apiStory() });
  renderArticle();
  expect(await screen.findByText("Article body")).toBeInTheDocument();
  expect(screen.getByText("English summary 1")).toBeInTheDocument();
  expect(screen.getByText("English summary 3")).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch.mock.calls[0][0]).toMatch(/\/api\/stories\/story-2\?navigation_language=en$/);
});

test("reuses a complete homepage cache without making any story requests", async () => {
  global.fetch = jest.fn();
  renderArticle({ stories: [makeStory(3), makeStory(1), makeStory(2)], status: "succeeded" });
  expect(await screen.findByText("Article body")).toBeInTheDocument();
  expect(screen.getByText("English summary 1")).toBeInTheDocument();
  expect(screen.getByText("English summary 3")).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("requests localized previews when switching language without fetching the archive", async () => {
  global.fetch = jest.fn().mockImplementation(async (url) => ({
    ok: true,
    json: async () => apiStory(url.endsWith("=es") ? "es" : "en"),
  }));
  const i18n = renderArticle();
  await screen.findByText("English summary 1");
  await act(() => i18n.changeLanguage("es"));
  expect(await screen.findByText("Resumen 1")).toBeInTheDocument();
  expect(screen.queryByText("English summary 1")).not.toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(2);
  expect(global.fetch.mock.calls[1][0]).toMatch(/\?navigation_language=es$/);
});

test("keeps the article usable if an older backend omits navigation during rollout", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => makeStory(2) });
  renderArticle();
  expect(await screen.findByText("Article body")).toBeInTheDocument();
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

test("ignores an outdated response when the reader changes language during loading", async () => {
  let resolveEnglish;
  global.fetch = jest.fn().mockImplementation((url) => {
    if (url.endsWith("=en")) return new Promise((resolve) => { resolveEnglish = resolve; });
    return Promise.resolve({ ok: true, json: async () => apiStory("es") });
  });
  const i18n = renderArticle();
  await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
  await act(() => i18n.changeLanguage("es"));
  await screen.findByText("Resumen 1");
  await act(async () => {
    resolveEnglish({ ok: true, json: async () => apiStory("en") });
  });
  expect(screen.getByText("Resumen 1")).toBeInTheDocument();
  expect(screen.queryByText("English summary 1")).not.toBeInTheDocument();
});
