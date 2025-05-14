import React, { useRef, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { useSelector } from "react-redux";
import { baseURL } from "../config";

const StoryEditor = ({ value, onChange }) => {
  const editorRef = useRef();
  const user = useSelector((state) => state.auth.user);
  const initialized = useRef(false);

  // Set initial markdown content only once, when first loaded or value changes externally
  useEffect(() => {
    if (editorRef.current && value !== undefined && !initialized.current) {
      editorRef.current.getInstance().setMarkdown(value);
      initialized.current = true;
    }
  }, [value]);

  // Safe image click deletion in WYSIWYG mode
  useEffect(() => {
    const editorInstance = editorRef.current?.getInstance();
    const editorRoot = editorInstance?.getRootElement?.();

    if (!editorRoot) return;

    const handleClick = (e) => {
      const target = e.target;
      if (target.tagName === "IMG") {
        const confirmDelete = window.confirm("Delete this image?");
        if (confirmDelete) {
          target.remove();
        }
      }
    };

    editorRoot.addEventListener("click", handleClick);

    return () => {
      editorRoot.removeEventListener("click", handleClick);
    };
  }, []);

  const handleEditorChange = () => {
    const markdown = editorRef.current?.getInstance().getMarkdown();
    onChange(markdown);
  };

  const handleImageUpload = async (blob, callback) => {
    const formData = new FormData();
    formData.append("image", blob);

    try {
      const res = await fetch(`${baseURL}/api/upload_image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      });

      const data = await res.json();

      // When Toast UI calls `callback(url, altText)`, altText is set by the "Description" field.
      // So we just return the URL here — the editor handles the rest.
      callback(data.url, blob.name.replace(/\.[^/.]+$/, "")); // fallback alt if Toast doesn’t handle it
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  };

  return (
    <Editor
      ref={editorRef}
      initialValue={value}
      previewStyle="vertical"
      height="400px"
      initialEditType="wysiwyg"
      useCommandShortcut={true}
      onChange={handleEditorChange}
      hooks={{
        addImageBlobHook: handleImageUpload,
      }}
    />
  );
};

export default StoryEditor;
