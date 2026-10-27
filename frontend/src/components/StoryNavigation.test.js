import React, { act } from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { getStoryNavigation } from "../utils/storyNavigation";
import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import zh from "../locales/zh/translation.json";
import StoryNavigation from "./StoryNavigation";

const makeStory = (id, overrides = {}) => ({
  id,
  slug: `story-${id}`,
  created_at: `2026-07-0${id}T12:00:00Z`,
  image_url: `/hero-${id}.jpg`,
  sections: [{ name: "People" }],
  translations: [
    { language: "en", title: `Story ${id}`, meta_description: `Summary ${id}` },
    { language: "es", title: `Historia ${id}`, meta_description: `Resumen ${id}` },
    { language: "zh", title: `文章${id}`, meta_description: `摘要${id}` },
  ],
  ...overrides,
});

const renderNavigation = ({
  stories = [makeStory(3), makeStory(1), makeStory(2)],
  storyId = 2,
  language = "en",
} = {}) => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: language,
    fallbackLng: "en",
    initImmediate: false,
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
    },
  });
  render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <StoryNavigation
          navigation={getStoryNavigation(stories, storyId, language)}
          language={language}
        />
      </MemoryRouter>
    </I18nextProvider>
  );
};

const originalFetch = global.fetch;
afterEach(() => {
  global.fetch = originalFetch;
});

test.each([
  ["en", "Previous story", "Next story", "Story 1", "Summary 1"],
  ["es", "Historia anterior", "Historia siguiente", "Historia 1", "Resumen 1"],
  ["zh", "上一篇", "下一篇", "文章1", "摘要1"],
])("shows chronological neighbors and localized previews in %s", (
  language,
  previousLabel,
  nextLabel,
  title,
  description
) => {
  global.fetch = jest.fn();
  renderNavigation({ language });
  const previous = screen.getByRole("link", { name: new RegExp(previousLabel) });
  const next = screen.getByRole("link", { name: new RegExp(nextLabel) });

  expect(previous).toHaveAttribute("href", `/${language}/stories/story-1/`);
  expect(previous).toHaveAttribute("rel", "prev");
  expect(next).toHaveAttribute("href", `/${language}/stories/story-3/`);
  expect(next).toHaveAttribute("rel", "next");
  expect(within(previous).queryByText(title)).not.toBeInTheDocument();
  expect(within(previous).getByText(description)).toBeInTheDocument();
  expect(within(previous).getByAltText("")).toHaveAttribute(
    "src", "/hero-1.jpg"
  );
  expect(global.fetch).not.toHaveBeenCalled();
});

test("skips untranslated stories and classified listings", () => {
  renderNavigation({
    language: "es",
    storyId: 4,
    stories: [
      makeStory(1),
      makeStory(2, {
        translations: [{ language: "en", title: "English only" }],
      }),
      makeStory(3, { sections: [{ name: "Classifieds" }] }),
      makeStory(4),
    ],
  });
  expect(screen.getAllByRole("link")).toHaveLength(1);
  expect(screen.getByRole("link")).toHaveAttribute(
    "href", "/es/stories/story-1/"
  );
  expect(screen.queryByText("English only")).not.toBeInTheDocument();
});

test.each([
  [3, "Previous story", "Next story"],
  [1, "Next story", "Previous story"],
])("does not wrap around at story %s", (storyId, available, missing) => {
  renderNavigation({ storyId });
  expect(
    screen.getByRole("link", { name: new RegExp(available) })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("link", { name: new RegExp(missing) })
  ).not.toBeInTheDocument();
});

test("omits navigation when there are no neighbors or the current story is absent", () => {
  renderNavigation({ stories: [makeStory(2)] });
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  renderNavigation({ stories: [makeStory(1), makeStory(3)] });
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
});

test("handles missing hero images, descriptions, and slugs without broken previews", () => {
  renderNavigation({
    stories: [makeStory(2), makeStory(1, {
      slug: null,
      image_url: null,
      translations: [{ language: "en", title: "Text-only story" }],
    })],
  });
  const link = screen.getByRole("link", { name: /Previous story/ });
  expect(within(link).queryByText("Text-only story")).not.toBeInTheDocument();
  expect(link).toHaveAttribute("href", "/en/stories/1/");
  expect(link.querySelector("img")).toBeNull();
  expect(link.querySelector(".story-navigation__description")).toBeNull();
});

test("orders stories sharing a publication date consistently by ID", () => {
  const created_at = "2026-07-01T12:00:00Z";
  renderNavigation({ stories: [
    makeStory(1, { created_at }),
    makeStory(3, { created_at }),
    makeStory(2, { created_at }),
  ] });
  expect(screen.getByRole("link", { name: /Previous story/ })).toHaveAttribute(
    "href", "/en/stories/story-1/"
  );
  expect(screen.getByRole("link", { name: /Next story/ })).toHaveAttribute(
    "href", "/en/stories/story-3/"
  );
});

test("does not request the archive when navigation data is unavailable", () => {
  global.fetch = jest.fn();
  renderNavigation({ stories: [] });
  expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

test("updates neighbors and descriptions when the reader switches languages", async () => {
  // The same mounted component receives the new language from StoryDetail.
  const i18n = i18next.createInstance();
  i18n.init({
    lng: "en",
    initImmediate: false,
    resources: { en: { translation: en }, es: { translation: es } },
  });
  const stories = [makeStory(1), makeStory(2), makeStory(3, {
    translations: [{ language: "en", title: "English only" }],
  })];
  const view = (language) => (
    <I18nextProvider i18n={i18n}>
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <StoryNavigation
          navigation={getStoryNavigation(stories, 2, language)}
          language={language}
        />
      </MemoryRouter>
    </I18nextProvider>
  );
  const { rerender } = render(view("en"));
  expect(screen.getByRole("link", { name: /Next story/ })).toBeInTheDocument();
  await act(() => i18n.changeLanguage("es"));
  rerender(view("es"));
  expect(screen.getByRole("link", { name: /Historia anterior/ })).toHaveAttribute(
    "href", "/es/stories/story-1/"
  );
  expect(screen.getByText("Resumen 1")).toBeInTheDocument();
  expect(screen.queryByText("English only")).not.toBeInTheDocument();
});
