const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "..", "build");
const ROOT_INDEX = path.join(BUILD_DIR, "index.html");
const SITE_URL = "https://www.sunsetpost.org";
const LANGUAGE_PATH = /^\/(en|es|zh)(?:\/|$)/;

const ensureRobots = (html, content) => {
  const tag = `<meta name="robots" content="${content}" />`;
  const robotsPattern = /<meta\s+[^>]*name=["']robots["'][^>]*>/i;

  if (robotsPattern.test(html)) {
    return html.replace(robotsPattern, tag);
  }

  return html.replace("</head>", `  ${tag}\n</head>`);
};

const canonicalizeSiteUrl = (value) => {
  if (!value.startsWith(SITE_URL)) return value;

  try {
    const url = new URL(value);
    if (url.origin !== SITE_URL || !LANGUAGE_PATH.test(url.pathname)) return value;
    if (url.pathname.endsWith("/")) return value;

    url.pathname = `${url.pathname}/`;
    return url.toString();
  } catch (_error) {
    return value;
  }
};

const addSlashToInternalHref = (value) => {
  if (!LANGUAGE_PATH.test(value) || value.endsWith("/")) return value;
  if (value.includes("?") || value.includes("#")) {
    const match = value.match(/^([^?#]+)([?#].*)$/);
    if (!match) return value;
    return `${match[1].replace(/\/+$/, "")}/${match[2]}`;
  }
  return `${value}/`;
};

const normalizeGeneratedHtml = (html) => {
  const robotsPattern = /<meta\s+[^>]*name=["']robots["'][^>]*>/i;
  let output = robotsPattern.test(html) ? html : ensureRobots(html, "index,follow");

  output = output.replace(
    /https:\/\/www\.sunsetpost\.org\/(?:en|es|zh)(?:\/[^\s"'<>]*)?/g,
    (url) => canonicalizeSiteUrl(url)
  );

  output = output.replace(
    /href=["'](\/(?:en|es|zh)(?:\/[^"']*)?)["']/g,
    (_match, href) => `href="${addSlashToInternalHref(href)}"`
  );

  return output;
};

const walk = (directory) => {
  const results = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (entry.isFile() && entry.name === "index.html") {
      results.push(fullPath);
    }
  }
  return results;
};

if (!fs.existsSync(ROOT_INDEX)) {
  throw new Error(`Missing ${ROOT_INDEX}. Run the production build first.`);
}

const routeIndexes = walk(BUILD_DIR);

for (const filePath of routeIndexes) {
  const html = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath, normalizeGeneratedHtml(html), "utf8");
}

const spaFallbackPath = path.join(BUILD_DIR, "spa-fallback.html");
if (fs.existsSync(spaFallbackPath)) {
  const fallbackHtml = fs.readFileSync(spaFallbackPath, "utf8");
  fs.writeFileSync(spaFallbackPath, ensureRobots(fallbackHtml, "noindex,follow"), "utf8");
}

console.log(
  `[seo] Finalized ${routeIndexes.length} prerendered pages with trailing-slash canonicals; separate SPA fallback remains noindex.`
);
