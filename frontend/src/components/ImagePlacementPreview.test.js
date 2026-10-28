import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import en from "../locales/en/translation.json";
import es from "../locales/es/translation.json";
import zh from "../locales/zh/translation.json";
import ImagePlacementPreview from "./ImagePlacementPreview";
import ImageUpload from "./ImageUpload";

const renderPreview = (props = {}, language = "en") => {
  const i18n = i18next.createInstance();
  i18n.init({
    lng: language,
    initImmediate: false,
    resources: { en: { translation: en }, es: { translation: es }, zh: { translation: zh } },
  });
  const view = (nextProps) => (
    <I18nextProvider i18n={i18n}>
      <ImagePlacementPreview {...nextProps} />
    </I18nextProvider>
  );
  const result = render(view(props));
  return { ...result, rerenderPreview: (nextProps) => result.rerender(view(nextProps)) };
};

const originalCreate = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
const originalRevoke = Object.getOwnPropertyDescriptor(URL, "revokeObjectURL");
beforeEach(() => {
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    value: jest.fn().mockReturnValueOnce("blob:first-image").mockReturnValueOnce("blob:second-image"),
  });
  Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: jest.fn() });
});
afterEach(() => {
  if (originalCreate) Object.defineProperty(URL, "createObjectURL", originalCreate);
  else delete URL.createObjectURL;
  if (originalRevoke) Object.defineProperty(URL, "revokeObjectURL", originalRevoke);
  else delete URL.revokeObjectURL;
});

test("shows full and homepage crop previews for an existing image without allocating a local URL", () => {
  renderPreview({ imageUrl: "/saved.jpg" });
  expect(screen.getByAltText("Full image")).toHaveAttribute("src", "/saved.jpg");
  expect(screen.getByAltText("Homepage crop preview")).toHaveAttribute("src", "/saved.jpg");
  expect(screen.getByText("Homepage / story list — 3:2")).toBeInTheDocument();
  expect(URL.createObjectURL).not.toHaveBeenCalled();
});

test("choosing another file releases its predecessor and resets the displayed dimensions", () => {
  const first = new File(["first"], "portrait.png", { type: "image/png" });
  const second = new File(["second"], "landscape.png", { type: "image/png" });
  const { rerenderPreview, unmount } = renderPreview({ image: first });
  const original = screen.getByAltText("Full image");
  Object.defineProperty(original, "naturalWidth", { configurable: true, value: 400 });
  Object.defineProperty(original, "naturalHeight", { configurable: true, value: 800 });
  fireEvent.load(original);
  expect(screen.getByText("Original: 400 × 800 pixels")).toBeInTheDocument();
  expect(screen.getByAltText("Homepage crop preview")).toHaveAttribute("src", "blob:first-image");

  rerenderPreview({ image: second });
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first-image");
  expect(screen.queryByText("Original: 400 × 800 pixels")).not.toBeInTheDocument();
  expect(screen.getByAltText("Homepage crop preview")).toHaveAttribute("src", "blob:second-image");
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:second-image");
});

test("uses one local URL for both previews and releases it when reverting to the saved image", () => {
  const image = new File(["preview"], "new.png", { type: "image/png" });
  const { rerenderPreview } = renderPreview({ image, imageUrl: "/saved.jpg" });
  expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  expect(screen.getByAltText("Full image")).toHaveAttribute("src", "blob:first-image");
  expect(screen.getByAltText("Homepage crop preview")).toHaveAttribute("src", "blob:first-image");
  rerenderPreview({ image: null, imageUrl: "/saved.jpg" });
  expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:first-image");
  expect(screen.getByAltText("Homepage crop preview")).toHaveAttribute("src", "/saved.jpg");
  rerenderPreview({ image: null, imageUrl: "" });
  expect(screen.queryByRole("region")).not.toBeInTheDocument();
});

test("shows the author crop alongside their current name and bio", () => {
  const { rerenderPreview } = renderPreview({ imageUrl: "/author.jpg", variant: "author", authorName: "C.J. Lake", authorBio: "A Brooklyn teacher." });
  expect(screen.getByText("Story byline — 50 × 50 pixels")).toBeInTheDocument();
  expect(screen.getByAltText("Author byline crop preview")).toHaveAttribute("src", "/author.jpg");
  expect(screen.getByRole("heading", { name: "C.J. Lake" })).toBeInTheDocument();
  expect(screen.getByText("A Brooklyn teacher.")).toBeInTheDocument();
  expect(screen.queryByAltText("Homepage crop preview")).not.toBeInTheDocument();
  rerenderPreview({ imageUrl: "/author.jpg", variant: "author", authorName: "Updated name" });
  expect(screen.getByRole("heading", { name: "Updated name" })).toBeInTheDocument();
});

test.each([
  ["en", "Homepage / story list — 3:2"],
  ["es", "Inicio / lista de historias — 3:2"],
  ["zh", "首页／文章列表 — 3:2"],
])("localizes placement guidance in %s", (language, label) => {
  renderPreview({ imageUrl: "/saved.jpg" }, language);
  expect(screen.getByText(label)).toBeInTheDocument();
});

test("keeps the original-only preview for classifieds", () => {
  renderPreview({ imageUrl: "/listing.jpg", variant: "original" });
  expect(screen.getByAltText("Full image")).toBeInTheDocument();
  expect(screen.queryByAltText("Homepage crop preview")).not.toBeInTheDocument();
});

test("handles images the browser cannot load and recovers for a replacement", () => {
  const { rerenderPreview } = renderPreview({ imageUrl: "/broken.jpg" });
  fireEvent.error(screen.getByAltText("Full image"));
  expect(screen.getByRole("alert")).toHaveTextContent("could not be previewed");
  rerenderPreview({ imageUrl: "/replacement.jpg" });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByAltText("Full image")).toHaveAttribute("src", "/replacement.jpg");
});

test("passes the original selected file through the upload control unchanged", () => {
  const onChange = jest.fn();
  const i18n = i18next.createInstance();
  i18n.init({ lng: "en", initImmediate: false, resources: { en: { translation: en } } });
  const Form = () => {
    const [image, setImage] = useState(null);
    return <ImageUpload image={image} setImage={(file) => { onChange(file); setImage(file); }} />;
  };
  const { unmount } = render(<I18nextProvider i18n={i18n}><Form /></I18nextProvider>);
  const file = new File(["original bytes"], "portrait.png", { type: "image/png" });
  fireEvent.change(screen.getByLabelText(/Featured Image/), { target: { files: [file] } });
  expect(onChange).toHaveBeenCalledWith(file);
  expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  expect(screen.getByAltText("Homepage crop preview")).toBeInTheDocument();
  unmount();
});
