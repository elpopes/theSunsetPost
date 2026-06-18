import React, { useEffect, useRef } from "react";
import "./NewsletterSignup.css";

const FORM_BY_LANG = {
  en: {
    uid: "c9d3e02664",
    src: "https://the-sunset-post.kit.com/c9d3e02664/index.js",
    label: "Subscribe to the Sunset Post email newsletter",
  },
  es: {
    uid: "27ef5c6bad",
    src: "https://the-sunset-post.kit.com/27ef5c6bad/index.js",
    label: "Suscríbete al boletín por correo electrónico de Sunset Post",
  },
  zh: {
    uid: "8d18d99b1d",
    src: "https://the-sunset-post.kit.com/8d18d99b1d/index.js",
    label: "订阅 Sunset Post 电子邮件通讯",
  },
};

const NewsletterSignup = ({ lang }) => {
  const containerRef = useRef(null);
  const language = (lang || "en").split("-")[0];
  const form = FORM_BY_LANG[language] || FORM_BY_LANG.en;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    container.replaceChildren();

    const script = document.createElement("script");
    script.async = true;
    script.dataset.uid = form.uid;
    script.src = form.src;
    container.appendChild(script);

    return () => {
      container.replaceChildren();
    };
  }, [form.src, form.uid]);

  return (
    <section
      className="newsletter-signup info-space"
      aria-label={form.label}
      ref={containerRef}
    />
  );
};

export default NewsletterSignup;
