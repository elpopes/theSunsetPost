import React from "react";

const TranslationsForm = ({ translations, setTranslations }) => {
  const handleTranslationChange = (lang, field, value) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));
  };

  return (
    <div>
      {["en", "es", "zh"].map((lang) => (
        <div key={lang}>
          <h3>{lang.toUpperCase()}</h3>
          <div>
            <label>Title:</label>
            <input
              type="text"
              value={translations[lang].title}
              onChange={(e) =>
                handleTranslationChange(lang, "title", e.target.value)
              }
              required
            />
          </div>
          <div>
            <label>Content:</label>
            <textarea
              value={translations[lang].content}
              onChange={(e) =>
                handleTranslationChange(lang, "content", e.target.value)
              }
              required
            ></textarea>
          </div>
          <div>
            <label>Meta Description:</label>
            <textarea
              value={translations[lang].meta_description}
              onChange={(e) =>
                handleTranslationChange(
                  lang,
                  "meta_description",
                  e.target.value
                )
              }
              maxLength="160"
            ></textarea>
          </div>
          <div>
            <label>Caption:</label>
            <input
              type="text"
              value={translations[lang].caption}
              onChange={(e) =>
                handleTranslationChange(lang, "caption", e.target.value)
              }
              placeholder="Enter caption for this language"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranslationsForm;
