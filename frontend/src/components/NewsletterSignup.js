import React, { useEffect, useRef } from "react";
import useInfoView from "../utils/useInfoView";
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

const NewsletterSignup = ({
  lang,
  variant = "sidebar",
  slot = "newsletter_signup",
  path = "",
}) => {
  const containerRef = useRef(null);
  const language = (lang || "en").split("-")[0];
  const form = FORM_BY_LANG[language] || FORM_BY_LANG.en;

  const infoRef = useInfoView({
    slot,
    info_id: "newsletter",
    lng: language,
    path,
  });

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
      className={`newsletter-signup newsletter-signup--${variant} info-space`}
      aria-label={form.label}
      ref={infoRef}
    >
      <div className="newsletter-signup__embed" ref={containerRef} />
    </section>
  );
};

export default NewsletterSignup;
