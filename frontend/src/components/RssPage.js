import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import "./RssPage.css";

const COPY = {
  en: {
    title: "Follow the Sunset Post by RSS",
    intro:
      "RSS lets you receive new Sunset Post stories in a feed reader without relying on social media or email.",
    choose: "Choose a feed",
    directions:
      "Copy a feed address into your RSS reader, or open it and use your reader’s subscribe option.",
    labels: { en: "English", es: "Spanish", zh: "Chinese" },
    help: "Popular RSS readers include Feedly, Inoreader, NewsBlur and NetNewsWire.",
  },
  es: {
    title: "Sigue al Sunset Post por RSS",
    intro:
      "RSS te permite recibir nuevas historias del Sunset Post en un lector de noticias sin depender de las redes sociales ni del correo electrónico.",
    choose: "Elige un canal",
    directions:
      "Copia la dirección del canal en tu lector RSS, o ábrela y usa la opción de suscripción de tu lector.",
    labels: { en: "Inglés", es: "Español", zh: "Chino" },
    help: "Algunos lectores RSS populares son Feedly, Inoreader, NewsBlur y NetNewsWire.",
  },
  zh: {
    title: "通过 RSS 关注 the Sunset Post",
    intro:
      "RSS 可以让你在新闻阅读器中接收 the Sunset Post 的最新报道，无需依赖社交媒体或电子邮件。",
    choose: "选择订阅源",
    directions: "将订阅源地址复制到 RSS 阅读器中，或打开链接并使用阅读器的订阅功能。",
    labels: { en: "英文", es: "西班牙文", zh: "中文" },
    help: "常见的 RSS 阅读器包括 Feedly、Inoreader、NewsBlur 和 NetNewsWire。",
  },
};

const FEEDS = {
  en: "https://www.sunsetpost.org/rss.xml",
  es: "https://www.sunsetpost.org/es/rss.xml",
  zh: "https://www.sunsetpost.org/zh/rss.xml",
};

const RssPage = () => {
  const { lang = "en" } = useParams();
  const language = ["en", "es", "zh"].includes(lang) ? lang : "en";
  const copy = COPY[language];

  return (
    <main className="rss-page">
      <Helmet>
        <title>{copy.title} | The Sunset Post</title>
        <meta name="description" content={copy.intro} />
        <link rel="canonical" href={`https://www.sunsetpost.org/${language}/rss`} />
      </Helmet>

      <header className="rss-page__header">
        <p className="rss-page__eyebrow">RSS</p>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </header>

      <section aria-labelledby="rss-feed-list">
        <h2 id="rss-feed-list">{copy.choose}</h2>
        <p>{copy.directions}</p>

        <div className="rss-page__feeds">
          {Object.entries(FEEDS).map(([feedLanguage, url]) => (
            <article className="rss-page__feed" key={feedLanguage}>
              <h3>{copy.labels[feedLanguage]}</h3>
              <a href={url} type="application/rss+xml">
                {url}
              </a>
            </article>
          ))}
        </div>

        <p className="rss-page__help">{copy.help}</p>
      </section>
    </main>
  );
};

export default RssPage;
