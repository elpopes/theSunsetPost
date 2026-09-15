const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const FRONTEND_ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(FRONTEND_ROOT, 'build');
const TEMPLATE_PATH = path.join(BUILD_DIR, 'index.html');
const SITE_URL = 'https://www.sunsetpost.org';
const API_URL = (process.env.REACT_APP_API_PROD || 'https://thesunsetpost.onrender.com').replace(/\/$/, '');
const LANGUAGES = ['en', 'es', 'zh'];
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;
const MAX_ARTICLE_CHARS = 30000;

const HOME_COPY = {
  en: {
    title: 'The Sunset Post | Sunset Park, Brooklyn News',
    description: 'Hyperlocal news and community information for Sunset Park, Brooklyn, published in English, Spanish and Chinese.',
    heading: 'Sunset Park, Brooklyn News',
    intro: 'The Sunset Post is a trilingual, hyperlocal community newspaper covering Sunset Park, Brooklyn.',
    latest: 'Latest stories',
  },
  es: {
    title: 'The Sunset Post | Noticias de Sunset Park, Brooklyn',
    description: 'Noticias hiperlocales e información comunitaria de Sunset Park, Brooklyn, publicadas en inglés, español y chino.',
    heading: 'Noticias de Sunset Park, Brooklyn',
    intro: 'The Sunset Post es un periódico comunitario trilingüe e hiperlocal que cubre Sunset Park, Brooklyn.',
    latest: 'Últimas historias',
  },
  zh: {
    title: 'The Sunset Post | 布鲁克林日落公园新闻',
    description: '面向布鲁克林日落公园社区的超本地新闻与社区信息，以英文、西班牙文和中文发布。',
    heading: '布鲁克林日落公园新闻',
    intro: 'The Sunset Post 是一份报道布鲁克林日落公园的三语超本地社区报纸。',
    latest: '最新报道',
  },
};

const PAGE_COPY = {
  en: {
    about: ['About | The Sunset Post', 'Learn about the Sunset Post and our trilingual, community-powered journalism in Sunset Park, Brooklyn.'],
    contact: ['Contact | The Sunset Post', 'Contact the Sunset Post with story tips, community questions, feedback or advertising inquiries.'],
    classifieds: ['Classifieds | The Sunset Post', 'Classified ads for the Sunset Park, Brooklyn community.'],
  },
  es: {
    about: ['Sobre nosotros | The Sunset Post', 'Conoce al Sunset Post y nuestro periodismo comunitario y trilingüe en Sunset Park, Brooklyn.'],
    contact: ['Contacto | The Sunset Post', 'Contacta al Sunset Post con pistas, preguntas de la comunidad, comentarios o consultas sobre publicidad.'],
    classifieds: ['Clasificados | The Sunset Post', 'Anuncios clasificados para la comunidad de Sunset Park, Brooklyn.'],
  },
  zh: {
    about: ['关于我们 | The Sunset Post', '了解 The Sunset Post 以及我们在布鲁克林日落公园开展的三语社区新闻工作。'],
    contact: ['联系我们 | The Sunset Post', '联系 The Sunset Post，提供新闻线索、社区问题、意见反馈或广告咨询。'],
    classifieds: ['分类信息 | The Sunset Post', '关于布鲁克林日落公园社区的分类广告。'],
  },
};

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: 'The Sunset Post',
  url: SITE_URL,
  areaServed: { '@type': 'Place', name: 'Sunset Park, Brooklyn, New York' },
  knowsLanguage: LANGUAGES,
};

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    const request = client.get(url, { headers: { 'User-Agent': 'SunsetPost-SEO-Prerender/1.0', Accept: 'application/json' } }, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        response.resume();
        resolve(requestJson(new URL(response.headers.location, url).toString()));
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`GET ${url} failed with HTTP ${response.statusCode}`));
        return;
      }
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (error) { reject(new Error(`Invalid JSON from ${url}: ${error.message}`)); }
      });
    });
    request.setTimeout(30000, () => request.destroy(new Error(`GET ${url} timed out`)));
    request.on('error', reject);
  });
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToText(value = '') {
  return String(value)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function articleBodyHtml(content = '') {
  const text = markdownToText(content).slice(0, MAX_ARTICLE_CHARS);
  if (!text) return '';
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.replace(/\n/g, ' '))}</p>`)
    .join('\n');
}

function localeForOg(lang) {
  return lang === 'zh' ? 'zh_CN' : lang === 'es' ? 'es_US' : 'en_US';
}

function routeUrl(lang, routePath = '') {
  const suffix = routePath && routePath !== '/' ? `/${routePath.replace(/^\/+|\/+$/g, '')}` : '';
  return `${SITE_URL}/${lang}${suffix}`;
}

function availableStoryLanguages(story) {
  const present = new Set((story.translations || []).map((translation) => translation.language));
  return LANGUAGES.filter((language) => present.has(language));
}

function translationFor(story, lang) {
  return (story.translations || []).find((translation) => translation.language === lang) || null;
}

function authorBio(author, lang) {
  const translated = (author.translations || []).find((translation) => translation.language === lang);
  return translated?.bio || author.bio || '';
}

function sectionTranslation(section, lang) {
  const translated = (section.translations || []).find((translation) => translation.language === lang);
  return {
    name: translated?.name || section.name || '',
    description: translated?.description || section.description || '',
  };
}

function setTag(html, regex, replacement) {
  return regex.test(html) ? html.replace(regex, replacement) : html.replace('</head>', `  ${replacement}\n</head>`);
}

function renderHead(template, { lang, title, description, canonical, alternates, image = DEFAULT_IMAGE, type = 'website', publishedTime, robots, jsonLd = [] }) {
  let html = template.replace(/<html\s+lang=["'][^"']*["']/i, `<html lang="${escapeHtml(lang)}"`);
  html = setTag(html, /<title[^>]*>[\s\S]*?<\/title>/i, `<title data-react-helmet="true">${escapeHtml(title)}</title>`);
  html = setTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta data-react-helmet="true" name="description" content="${escapeHtml(description)}" />`);
  html = setTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta data-react-helmet="true" property="og:title" content="${escapeHtml(title)}" />`);
  html = setTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta data-react-helmet="true" property="og:description" content="${escapeHtml(description)}" />`);
  html = setTag(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta data-react-helmet="true" property="og:image" content="${escapeHtml(image)}" />`);
  html = setTag(html, /<meta\s+property=["']og:type["'][^>]*>/i, `<meta data-react-helmet="true" property="og:type" content="${escapeHtml(type)}" />`);
  html = setTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta data-react-helmet="true" property="og:url" content="${escapeHtml(canonical)}" />`);
  html = setTag(html, /<meta\s+name=["']twitter:card["'][^>]*>/i, `<meta data-react-helmet="true" name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`);
  html = setTag(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta data-react-helmet="true" name="twitter:title" content="${escapeHtml(title)}" />`);
  html = setTag(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta data-react-helmet="true" name="twitter:description" content="${escapeHtml(description)}" />`);
  html = setTag(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta data-react-helmet="true" name="twitter:image" content="${escapeHtml(image)}" />`);

  const generated = [];
  generated.push(`<link data-react-helmet="true" rel="canonical" href="${escapeHtml(canonical)}" />`);
  for (const alternate of alternates) {
    generated.push(`<link data-react-helmet="true" rel="alternate" hreflang="${escapeHtml(alternate.lang)}" href="${escapeHtml(alternate.url)}" />`);
  }
  const englishAlternate = alternates.find((alternate) => alternate.lang === 'en');
  if (englishAlternate) {
    generated.push(`<link data-react-helmet="true" rel="alternate" hreflang="x-default" href="${escapeHtml(englishAlternate.url)}" />`);
  }
  generated.push(`<meta data-react-helmet="true" property="og:locale" content="${localeForOg(lang)}" />`);
  if (publishedTime) generated.push(`<meta data-react-helmet="true" property="article:published_time" content="${escapeHtml(publishedTime)}" />`);
  if (robots) generated.push(`<meta data-react-helmet="true" name="robots" content="${escapeHtml(robots)}" />`);
  for (const schema of jsonLd.filter(Boolean)) {
    const serialized = JSON.stringify(schema).replace(/</g, '\\u003c');
    generated.push(`<script data-react-helmet="true" type="application/ld+json">${serialized}</script>`);
  }

  return html.replace('</head>', `  <!-- seo-prerender:start -->\n  ${generated.join('\n  ')}\n  <!-- seo-prerender:end -->\n</head>`);
}

function renderPage(template, config, bodyHtml) {
  const withHead = renderHead(template, config);
  if (!withHead.includes('<div id="root"></div>')) throw new Error('Could not find React root placeholder in build/index.html');
  return withHead.replace('<div id="root"></div>', `<div id="root">${bodyHtml}</div>`);
}

function writeRoute(routePath, html) {
  const clean = routePath.replace(/^\/+|\/+$/g, '');
  const destination = path.join(BUILD_DIR, ...clean.split('/'), 'index.html');
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, html, 'utf8');
}

function alternatesForPath(routePath, languages = LANGUAGES) {
  return languages.map((lang) => ({ lang, url: routeUrl(lang, routePath) }));
}

function storySchema(story, translation, lang, canonical) {
  const authors = (story.authors || []).map((author) => ({
    '@type': 'Person',
    name: author.name,
    ...(author.slug ? { url: routeUrl(lang, `authors/${author.slug}`) } : {}),
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: translation.title,
    description: translation.meta_description || 'The Sunset Post',
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    datePublished: story.created_at || undefined,
    dateModified: story.updated_at || story.created_at || undefined,
    image: story.image_url ? [story.image_url] : undefined,
    author: authors,
    articleSection: (story.sections || []).map((section) => section.name),
    publisher: { '@type': 'NewsMediaOrganization', '@id': `${SITE_URL}/#organization`, name: 'The Sunset Post', url: SITE_URL },
    isAccessibleForFree: true,
  };
}

function homeBody(lang, stories) {
  const copy = HOME_COPY[lang];
  const links = stories
    .filter((story) => translationFor(story, lang) && story.slug)
    .slice(0, 24)
    .map((story) => {
      const translation = translationFor(story, lang);
      const summary = markdownToText(translation.meta_description || translation.content || '').slice(0, 220);
      return `<li><a href="/${lang}/stories/${escapeHtml(story.slug)}"><h2>${escapeHtml(translation.title || 'The Sunset Post')}</h2></a>${summary ? `<p>${escapeHtml(summary)}</p>` : ''}</li>`;
    })
    .join('\n');
  return `<main class="stories-list" data-seo-prerender="true"><h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.intro)}</p><h2>${escapeHtml(copy.latest)}</h2><ul>${links}</ul></main>`;
}

function staticPageBody(lang, page, locales) {
  if (page === 'about') {
    const copy = locales[lang]?.about_page || {};
    return `<main data-seo-prerender="true"><h1>${escapeHtml(copy.title || PAGE_COPY[lang].about[0])}</h1>${['intro','bio','recognition','origin','team','get_involved'].map((key) => copy[key] ? `<p>${escapeHtml(copy[key])}</p>` : '').join('')}</main>`;
  }
  if (page === 'contact') {
    const copy = locales[lang]?.contact_page || {};
    return `<main data-seo-prerender="true"><h1>${escapeHtml(copy.title || PAGE_COPY[lang].contact[0])}</h1>${copy.welcome_text ? `<p>${escapeHtml(copy.welcome_text)}</p>` : ''}${copy.recruitment_text ? `<p>${escapeHtml(copy.recruitment_text)}</p>` : ''}</main>`;
  }
  const classifiedCopy = locales[lang]?.classifieds || {};
  return `<main data-seo-prerender="true"><h1>${escapeHtml(classifiedCopy.title || PAGE_COPY[lang].classifieds[0])}</h1><p>${escapeHtml(classifiedCopy.description || PAGE_COPY[lang].classifieds[1])}</p></main>`;
}

function noindexBody(lang, page) {
  const labels = {
    en: { signup: 'Sign Up', login: 'Login', post: 'Post', search: 'Search' },
    es: { signup: 'Regístrate', login: 'Iniciar sesión', post: 'Publicar', search: 'Buscar' },
    zh: { signup: '注册', login: '登录', post: '发布', search: '搜索' },
  };
  return `<main data-seo-prerender="true"><h1>${escapeHtml(labels[lang][page])}</h1></main>`;
}

function loadLocales() {
  const result = {};
  for (const lang of LANGUAGES) {
    const localePath = path.join(FRONTEND_ROOT, 'src', 'locales', lang, 'translation.json');
    result[lang] = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  }
  return result;
}

async function main() {
  if (!fs.existsSync(TEMPLATE_PATH)) throw new Error(`Missing ${TEMPLATE_PATH}. Run react-scripts build first.`);
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const locales = loadLocales();

  console.log(`[seo] Fetching content from ${API_URL}`);
  const [stories, authors, sections] = await Promise.all([
    requestJson(`${API_URL}/api/stories`),
    requestJson(`${API_URL}/api/authors`),
    requestJson(`${API_URL}/api/sections`),
  ]);
  if (!Array.isArray(stories) || !Array.isArray(authors) || !Array.isArray(sections)) {
    throw new Error('SEO prerender API responses must be arrays.');
  }

  let written = 0;

  for (const lang of LANGUAGES) {
    const homePath = '';
    writeRoute(lang, renderPage(template, {
      lang,
      title: HOME_COPY[lang].title,
      description: HOME_COPY[lang].description,
      canonical: routeUrl(lang, homePath),
      alternates: alternatesForPath(homePath),
      jsonLd: [ORG_SCHEMA, { '@context': 'https://schema.org', '@type': 'WebSite', name: 'The Sunset Post', url: SITE_URL, inLanguage: LANGUAGES }],
    }, homeBody(lang, stories)));
    written += 1;

    for (const page of ['about', 'contact', 'classifieds']) {
      const [title, description] = PAGE_COPY[lang][page];
      writeRoute(`${lang}/${page}`, renderPage(template, {
        lang, title, description,
        canonical: routeUrl(lang, page),
        alternates: alternatesForPath(page),
        jsonLd: [ORG_SCHEMA],
      }, staticPageBody(lang, page, locales)));
      written += 1;
    }

    for (const page of ['signup', 'login', 'post', 'search']) {
      const title = `${noindexBody(lang, page).match(/<h1>(.*?)<\/h1>/)?.[1] || page} | The Sunset Post`;
      writeRoute(`${lang}/${page}`, renderPage(template, {
        lang, title, description: 'The Sunset Post',
        canonical: routeUrl(lang, page),
        alternates: [],
        robots: 'noindex,follow',
        jsonLd: [],
      }, noindexBody(lang, page)));
      written += 1;
    }
  }

  for (const story of stories) {
    if (!story.slug) continue;
    const availableLanguages = availableStoryLanguages(story);
    for (const lang of availableLanguages) {
      const translation = translationFor(story, lang);
      if (!translation?.title) continue;
      const routePath = `stories/${story.slug}`;
      const canonical = routeUrl(lang, routePath);
      const description = translation.meta_description || markdownToText(translation.content || '').slice(0, 160) || 'The Sunset Post';
      const authorsHtml = (story.authors || []).map((author) => author.slug ? `<a href="/${lang}/authors/${escapeHtml(author.slug)}">${escapeHtml(author.name)}</a>` : escapeHtml(author.name)).join(', ');
      const body = `<main class="story-detail" data-seo-prerender="true"><article><header><h1>${escapeHtml(translation.title)}</h1>${authorsHtml ? `<p>${authorsHtml}</p>` : ''}${story.created_at ? `<time datetime="${escapeHtml(story.created_at)}">${escapeHtml(story.created_at.slice(0, 10))}</time>` : ''}</header>${story.image_url ? `<figure><img src="${escapeHtml(story.image_url)}" alt="${escapeHtml(translation.title)}" />${translation.caption ? `<figcaption>${escapeHtml(translation.caption)}</figcaption>` : ''}</figure>` : ''}<div class="story-detail__content">${articleBodyHtml(translation.content)}</div></article></main>`;
      writeRoute(`${lang}/${routePath}`, renderPage(template, {
        lang,
        title: translation.title,
        description,
        canonical,
        alternates: alternatesForPath(routePath, availableLanguages),
        image: story.image_url || DEFAULT_IMAGE,
        type: 'article',
        publishedTime: story.created_at,
        jsonLd: [storySchema(story, translation, lang, canonical)],
      }, body));
      written += 1;
    }

    const english = translationFor(story, 'en') || translationFor(story, availableLanguages[0]);
    if (english) {
      const canonical = routeUrl('en', `stories/${story.slug}`);
      const legacyBody = `<main data-seo-prerender="true"><h1>${escapeHtml(english.title || 'The Sunset Post')}</h1><p><a href="${escapeHtml(canonical)}">Continue to the English version of this story.</a></p><script>window.location.replace(${JSON.stringify(`/en/stories/${story.slug}`)});</script></main>`;
      writeRoute(`stories/${story.slug}`, renderPage(template, {
        lang: 'en', title: english.title || 'The Sunset Post',
        description: english.meta_description || 'The Sunset Post',
        canonical,
        alternates: alternatesForPath(`stories/${story.slug}`, availableLanguages),
        image: story.image_url || DEFAULT_IMAGE,
        type: 'article',
        publishedTime: story.created_at,
        jsonLd: [],
      }, legacyBody));
      written += 1;
    }
  }

  const authorStories = new Map();
  for (const story of stories) {
    for (const author of story.authors || []) {
      if (!author.id) continue;
      if (!authorStories.has(author.id)) authorStories.set(author.id, []);
      authorStories.get(author.id).push(story);
    }
  }
  for (const author of authors) {
    if (!author.slug) continue;
    for (const lang of LANGUAGES) {
      const bio = authorBio(author, lang);
      const routePath = `authors/${author.slug}`;
      const title = `${author.name} | The Sunset Post`;
      const description = markdownToText(bio).slice(0, 160) || `Stories by ${author.name} in The Sunset Post.`;
      const storyLinks = (authorStories.get(author.id) || []).filter((story) => translationFor(story, lang) && story.slug).map((story) => `<li><a href="/${lang}/stories/${escapeHtml(story.slug)}">${escapeHtml(translationFor(story, lang).title)}</a></li>`).join('');
      const body = `<main data-seo-prerender="true"><h1>${escapeHtml(author.name)}</h1>${author.image_url ? `<img src="${escapeHtml(author.image_url)}" alt="${escapeHtml(author.name)}" />` : ''}${bio ? `<p>${escapeHtml(markdownToText(bio))}</p>` : ''}<h2>${lang === 'es' ? 'Historias' : lang === 'zh' ? '文章' : 'Stories'}</h2><ul>${storyLinks}</ul></main>`;
      writeRoute(`${lang}/${routePath}`, renderPage(template, {
        lang, title, description,
        canonical: routeUrl(lang, routePath),
        alternates: alternatesForPath(routePath),
        image: author.image_url || DEFAULT_IMAGE,
        jsonLd: [{ '@context': 'https://schema.org', '@type': 'Person', name: author.name, url: routeUrl(lang, routePath), description: description }],
      }, body));
      written += 1;
    }
  }

  const storiesBySection = new Map();
  for (const story of stories) {
    for (const section of story.sections || []) {
      if (!section.id) continue;
      if (!storiesBySection.has(section.id)) storiesBySection.set(section.id, []);
      storiesBySection.get(section.id).push(story);
    }
  }
  for (const section of sections) {
    if (!section.name || String(section.name).toLowerCase() === 'classifieds') continue;
    const routeName = String(section.name).toLowerCase();
    const routePath = `sections/${routeName}`;
    const canonicalRoutePath = `sections/${encodeURIComponent(routeName)}`;
    for (const lang of LANGUAGES) {
      const translated = sectionTranslation(section, lang);
      const title = `${translated.name} | The Sunset Post`;
      const description = markdownToText(translated.description).slice(0, 160) || `Local ${translated.name} coverage from The Sunset Post.`;
      const storyLinks = (storiesBySection.get(section.id) || []).filter((story) => translationFor(story, lang) && story.slug).map((story) => `<li><a href="/${lang}/stories/${escapeHtml(story.slug)}"><h2>${escapeHtml(translationFor(story, lang).title)}</h2></a><p>${escapeHtml(markdownToText(translationFor(story, lang).meta_description || translationFor(story, lang).content || '').slice(0, 220))}</p></li>`).join('');
      const body = `<main class="section-detail" data-seo-prerender="true"><h1>${escapeHtml(translated.name)}</h1>${translated.description ? `<p>${escapeHtml(markdownToText(translated.description))}</p>` : ''}<ul>${storyLinks}</ul></main>`;
      writeRoute(`${lang}/${routePath}`, renderPage(template, {
        lang, title, description,
        canonical: routeUrl(lang, canonicalRoutePath),
        alternates: alternatesForPath(canonicalRoutePath),
        jsonLd: [ORG_SCHEMA],
      }, body));
      written += 1;
    }
  }

  console.log(`[seo] Wrote ${written} prerendered route files.`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[seo] Prerender failed: ${error.stack || error.message}`);
    process.exit(1);
  });
}

module.exports = { escapeHtml, markdownToText, renderPage, renderHead, storySchema, routeUrl, alternatesForPath };
