const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "assets/favicon.svg",
  "assets/astrid-hero-portrait.webp",
  "assets/astrid-on-camera.webp",
  "assets/astrid-voice-studio.webp",
  "scripts/serve.mjs",
  "vercel.json",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

const countMatches = (source, pattern) => source.match(pattern)?.length ?? 0;
const portfolioMarkup = html.match(/<section class="portfolio[\s\S]*?<\/section>/)?.[0] ?? "";

const checks = [
  ["has exactly one main landmark", countMatches(html, /<main\b/g) === 1],
  ["has a labeled primary navigation", /<nav[^>]+aria-label="Primary navigation"/.test(html)],
  ["has a keyboard skip link", /class="skip-link"[^>]+href="#main-content"/.test(html)],
  ["has an accessible mobile navigation toggle", /aria-expanded="false"[^>]+aria-controls="primary-navigation"/.test(html)],
  ["has work and contact sections", ["work", "contact"].every((id) => html.includes(`id="${id}"`))],
  ["removes verbose lower-page sections", !/How I show up|id="services"|id="about"|class="approach"/.test(html)],
  ["uses three image-led portfolio figures", countMatches(portfolioMarkup, /class="portfolio-item"/g) === 3],
  ["keeps portfolio copy to practical captions", countMatches(portfolioMarkup, /<p\b/g) === 0 && countMatches(portfolioMarkup, /<figcaption>/g) === 3],
  ["removes decorative lower-page artwork", !/community-pattern|about-sun|about-weave|contact-pattern/.test(html)],
  ["has native image dimensions", countMatches(html, /<img[^>]+width="\d+"[^>]+height="\d+"/g) >= 4],
  ["lazy-loads below-fold images", countMatches(html, /loading="lazy"/g) >= 3],
  ["uses local optimized portfolio images", ["astrid-hero-portrait.webp", "astrid-on-camera.webp", "astrid-voice-studio.webp"].every((asset) => html.includes(asset))],
  ["has social sharing metadata", /property="og:image"/.test(html) && /name="twitter:card"/.test(html)],
  ["has Person structured data", /"@type": "Person"/.test(html)],
  ["supports Escape to close mobile navigation", /event\.key === "Escape"/.test(script)],
  ["supports reduced motion", /prefers-reduced-motion: reduce/.test(css)],
  ["uses visible focus treatment", /:focus-visible/.test(css)],
  ["keeps recommended touch target sizing", /min-height: 48px/.test(css)],
  ["does not remove focus outlines", !/outline:\s*none/.test(css)],
  ["contains no empty placeholder links", !/href="#"/.test(html)],
  ["removes old climate-finance positioning", !/climate finance|environmental policy/i.test(html)],
  ["omits Korean mobile phone numbers", !/\b01\d[- ]?\d{3,4}[- ]?\d{4}\b/.test(html)],
  ["omits detailed street or unit address", !/\b\d{3,4}\s+\d{3,4}\b/.test(html)],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);

if (failed.length > 0) {
  console.error(`Site checks failed: ${failed.join(", ")}`);
  process.exit(1);
}

console.log(`Static site checks passed (${checks.length} checks).`);
