import React, { useEffect, useMemo, useState } from "react";
import { FaCopy, FaQrcode } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "./PrintQrLinkGenerator.css";

const PRODUCTION_ORIGIN = "https://www.sunsetpost.org";
const PRINT_LANGUAGE_KEY = "sunsetpost_print_qr_language";
const ISSUE_KEY = "sunsetpost_print_qr_issue";
const SUPPORTED_LANGUAGES = ["en", "es", "zh"];

const normalizeLanguage = (language) => {
  const normalized = (language || "en").toLowerCase();
  if (normalized.startsWith("es")) return "es";
  if (normalized.startsWith("zh")) return "zh";
  return "en";
};

export const getNextIssue = (date = new Date()) => {
  const issueDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  const year = issueDate.getFullYear();
  const month = String(issueDate.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export const buildPrintQrUrl = ({
  storyIdentifier,
  printLanguage,
  targetLanguage,
  issue,
}) => {
  const url = new URL(
    `/${targetLanguage}/stories/${storyIdentifier}`,
    PRODUCTION_ORIGIN
  );

  url.searchParams.set("utm_source", "print");
  url.searchParams.set("utm_medium", "qr");
  url.searchParams.set("utm_campaign", issue);
  url.searchParams.set(
    "utm_content",
    `${storyIdentifier}_print-${printLanguage}_target-${targetLanguage}`
  );

  return url.toString();
};

const getStoredPrintLanguage = () => {
  try {
    const storedLanguage = window.localStorage.getItem(PRINT_LANGUAGE_KEY);
    return SUPPORTED_LANGUAGES.includes(storedLanguage)
      ? storedLanguage
      : "en";
  } catch {
    return "en";
  }
};

const getStoredIssue = () => {
  try {
    const storedIssue = window.sessionStorage.getItem(ISSUE_KEY);
    return /^\d{4}-\d{2}$/.test(storedIssue || "")
      ? storedIssue
      : getNextIssue();
  } catch {
    return getNextIssue();
  }
};

const fallbackCopy = (value) => {
  const textArea = document.createElement("textarea");
  textArea.value = value;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!copied) throw new Error("Copy command failed");
};

const PrintQrLinkGenerator = ({ story, targetLanguage }) => {
  const { t } = useTranslation();
  const normalizedTargetLanguage = normalizeLanguage(targetLanguage);
  const storyIdentifier = story.slug || story.id;
  const panelId = `print-qr-panel-${story.id}`;

  const [isOpen, setIsOpen] = useState(false);
  const [printLanguage, setPrintLanguage] = useState(
    getStoredPrintLanguage
  );
  const [issue, setIssue] = useState(getStoredIssue);
  const [copyStatus, setCopyStatus] = useState("");

  const printUrl = useMemo(
    () =>
      buildPrintQrUrl({
        storyIdentifier,
        printLanguage,
        targetLanguage: normalizedTargetLanguage,
        issue,
      }),
    [storyIdentifier, printLanguage, normalizedTargetLanguage, issue]
  );

  useEffect(() => {
    setCopyStatus("");
  }, [printUrl]);

  useEffect(() => {
    setIsOpen(false);
  }, [story.id]);

  const handlePrintLanguageChange = (event) => {
    const nextLanguage = event.target.value;
    setPrintLanguage(nextLanguage);

    try {
      window.localStorage.setItem(PRINT_LANGUAGE_KEY, nextLanguage);
    } catch {
      // The selection still works for this session.
    }
  };

  const handleIssueChange = (event) => {
    const nextIssue = event.target.value;
    setIssue(nextIssue);

    try {
      window.sessionStorage.setItem(ISSUE_KEY, nextIssue);
    } catch {
      // The selection still works for this page.
    }
  };

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(printUrl);
      } else {
        fallbackCopy(printUrl);
      }

      setCopyStatus("copied");
    } catch (error) {
      console.warn("[PrintQrLinkGenerator] Copy failed:", error);
      setCopyStatus("failed");
    }
  };

  return (
    <>
      <button
        type="button"
        className="print-qr-generator__toggle"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
      >
        <FaQrcode aria-hidden="true" />
        {t("print_qr.open")}
      </button>

      {isOpen && (
        <section
          className="print-qr-generator__panel"
          id={panelId}
          aria-label={t("print_qr.open")}
        >
          <label className="print-qr-generator__field">
            <span>{t("print_qr.print_language")}</span>
            <select
              value={printLanguage}
              onChange={handlePrintLanguageChange}
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="zh">ZH</option>
            </select>
          </label>

          <label className="print-qr-generator__field">
            <span>{t("print_qr.issue")}</span>
            <input
              type="month"
              value={issue}
              required
              onChange={handleIssueChange}
            />
          </label>

          <div className="print-qr-generator__field">
            <span>{t("print_qr.target_language")}</span>
            <output>{normalizedTargetLanguage.toUpperCase()}</output>
          </div>

          <label className="print-qr-generator__field print-qr-generator__url">
            <span>{t("print_qr.url")}</span>
            <input
              type="text"
              value={printUrl}
              readOnly
              onFocus={(event) => event.target.select()}
            />
          </label>

          <div className="print-qr-generator__copy-row">
            <button type="button" disabled={!issue} onClick={handleCopy}>
              <FaCopy aria-hidden="true" />
              {t("print_qr.copy")}
            </button>
            <span className="print-qr-generator__status" aria-live="polite">
              {copyStatus === "copied" && t("print_qr.copied")}
              {copyStatus === "failed" && t("print_qr.copy_failed")}
            </span>
          </div>
        </section>
      )}
    </>
  );
};

export default PrintQrLinkGenerator;
