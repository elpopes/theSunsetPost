import React, { useRef, useEffect } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const StoryEditor = ({ value, onChange }) => {
  const editorRef = useRef();

  // Sync editor contents with external value on first render or when switching language
  useEffect(() => {
    if (editorRef.current && value !== undefined) {
      editorRef.current.getInstance().setMarkdown(value);
    }
  }, [value]);

  // Pull markdown from editor when user types
  const handleEditorChange = () => {
    const markdown = editorRef.current?.getInstance().getMarkdown();
    onChange(markdown);
  };

  return (
    <Editor
      ref={editorRef}
      initialValue={value}
      previewStyle="vertical"
      height="300px"
      initialEditType="wysiwyg"
      useCommandShortcut={true}
      onChange={handleEditorChange}
    />
  );
};

export default StoryEditor;
