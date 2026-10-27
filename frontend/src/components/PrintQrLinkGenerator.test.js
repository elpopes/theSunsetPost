import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import en from "../locales/en/translation.json";
import PrintQrLinkGenerator from "./PrintQrLinkGenerator";

const story = { id: 42, slug: "neighborhood-story" };

const renderTool = (props = {}) => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: "en",
    initImmediate: false,
    resources: { en: { translation: en } },
  });
  const view = (nextProps) => (
    <I18nextProvider i18n={i18n}>
      <PrintQrLinkGenerator story={story} targetLanguage="en" {...nextProps} />
    </I18nextProvider>
  );
  const result = render(view(props));
  fireEvent.click(screen.getByRole("button", { name: "Print QR link" }));
  return { rerenderTool: (nextProps) => result.rerender(view(nextProps)) };
};

const currentUrl = () => new URL(screen.getByLabelText("QR URL").value);
const selectTarget = (language) => {
  fireEvent.change(screen.getByLabelText("Target language"), {
    target: { value: language },
  });
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test.each(["en", "es", "zh", "es-US", "zh-TW"])(
  "defaults the target to the article's %s language",
  (language) => {
    renderTool({ targetLanguage: language });
    const normalized = language.split("-")[0];
    expect(screen.getByLabelText("Target language")).toHaveValue(normalized);
    expect(currentUrl().pathname).toBe(`/${normalized}/stories/neighborhood-story`);
  }
);

test("switches the URL and target tracking between all three languages independently of print settings", () => {
  localStorage.setItem("sunsetpost_print_qr_language", "es");
  sessionStorage.setItem("sunsetpost_print_qr_issue", "2026-11");
  renderTool();

  for (const language of ["es", "zh", "en"]) {
    selectTarget(language);
    const url = currentUrl();
    expect(url.origin).toBe("https://www.sunsetpost.org");
    expect(url.pathname).toBe(`/${language}/stories/neighborhood-story`);
    expect(url.searchParams.get("utm_source")).toBe("print");
    expect(url.searchParams.get("utm_medium")).toBe("qr");
    expect(url.searchParams.get("utm_campaign")).toBe("2026-11");
    expect(url.searchParams.get("utm_content")).toBe(
      `neighborhood-story_print-es_target-${language}`
    );
    expect(screen.getByLabelText("Print language")).toHaveValue("es");
    expect(screen.getByLabelText("Issue")).toHaveValue("2026-11");
  }

  fireEvent.click(screen.getByRole("button", { name: "Print QR link" }));
  fireEvent.click(screen.getByRole("button", { name: "Print QR link" }));
  expect(screen.getByLabelText("Target language")).toHaveValue("en");
});

test("copies the selected target URL and clears stale copy confirmation after switching targets", async () => {
  const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  try {
    renderTool();
    selectTarget("zh");
    fireEvent.click(screen.getByRole("button", { name: "Copy QR URL" }));
    await screen.findByText("Copied");
    expect(writeText).toHaveBeenLastCalledWith(currentUrl().toString());

    selectTarget("es");
    expect(screen.queryByText("Copied")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Copy QR URL" }));
    await screen.findByText("Copied");
    expect(writeText).toHaveBeenLastCalledWith(currentUrl().toString());
    expect(new URL(writeText.mock.calls[1][0]).pathname).toBe(
      "/es/stories/neighborhood-story"
    );
  } finally {
    if (originalClipboard) {
      Object.defineProperty(navigator, "clipboard", originalClipboard);
    } else {
      delete navigator.clipboard;
    }
  }
});

test("follows the article language when it changes and resets for a different story", async () => {
  const { rerenderTool } = renderTool();
  selectTarget("es");
  rerenderTool({ targetLanguage: "zh" });
  await waitFor(() =>
    expect(screen.getByLabelText("Target language")).toHaveValue("zh")
  );
  selectTarget("en");
  rerenderTool({
    story: { id: 43, slug: "another-story" },
    targetLanguage: "zh",
  });
  expect(screen.queryByLabelText("QR URL")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Print QR link" }));
  expect(screen.getByLabelText("Target language")).toHaveValue("zh");
  expect(currentUrl().pathname).toBe("/zh/stories/another-story");
});
