const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "assets/favicon.svg",
  "assets/astrid-rahardjo-hero-white-top.jpg",
  "assets/astrid-on-camera.webp",
  "assets/astrid-voice-studio.webp",
  "assets/juvelook-indonesia-reel.webp",
  "assets/teuida-app-model.jpg",
  "assets/teuida-greetings-practice.jpg",
  "assets/teuida-greetings-overview.jpg",
  "assets/sns-ttobagi-wanju.jpg",
  "assets/sns-ttobagi-iksan.jpg",
  "assets/sns-oh-my-gyeonggi-osan.jpg",
  "assets/sns-oh-my-gyeonggi-dongtan.jpg",
  "assets/kexplorer-street-interview-1530.webp",
  "assets/kexplorer-street-interview-1617.webp",
  "assets/kexplorer-street-interview-1714.webp",
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
const server = fs.readFileSync(path.join(root, "scripts/serve.mjs"), "utf8");

const countMatches = (source, pattern) => source.match(pattern)?.length ?? 0;
const portfolioMarkup = html.match(/<section class="portfolio[\s\S]*?<\/section>/)?.[0] ?? "";
const supporterProgramsMarkup = html.match(/<section class="supporter-programs[\s\S]*?<\/section>/)?.[0] ?? "";
const worldFriendsMarkup = html.match(/<section class="world-friends[\s\S]*?<\/section>/)?.[0] ?? "";
const worldFriendsVideoIds = ["lx6Cmv2QUO0", "pcRmtfuUnww", "sK8qkDCfdUg"];

const checks = [
  ["has exactly one main landmark", countMatches(html, /<main\b/g) === 1],
  ["has a labeled primary navigation", /<nav[^>]+aria-label="Primary navigation"/.test(html)],
  ["has a keyboard skip link", /class="skip-link"[^>]+href="#main-content"/.test(html)],
  ["has an accessible mobile navigation toggle", /aria-expanded="false"[^>]+aria-controls="primary-navigation"/.test(html)],
  ["has work, SNS supporter, World Friends, and contact sections", ["work", "sns-supporters", "world-friends", "contact"].every((id) => html.includes(`id="${id}"`))],
  ["links the primary navigation to SNS supporter programs", /class="nav-menu"[\s\S]*?href="#sns-supporters"/.test(html)],
  ["removes verbose lower-page sections", !/How I show up|id="services"|id="about"|class="approach"/.test(html)],
  ["uses five image-led portfolio figures", countMatches(portfolioMarkup, /class="portfolio-item(?:\s[^"]*)?"/g) === 5],
  ["keeps portfolio copy to practical captions", countMatches(portfolioMarkup, /<p\b/g) === 0 && countMatches(portfolioMarkup, /<figcaption>/g) === 5],
  ["removes decorative lower-page artwork", !/community-pattern|about-sun|about-weave|contact-pattern/.test(html)],
  ["has native image dimensions", countMatches(html, /<img[^>]+width="\d+"[^>]+height="\d+"/g) >= 4],
  ["lazy-loads below-fold images", countMatches(html, /loading="lazy"/g) >= 3],
  ["uses Astrid's supplied portrait throughout the landing-page hero", countMatches(html, /astrid-rahardjo-hero-white-top\.jpg/g) === 4 && !/astrid-hero-portrait\.webp/.test(html)],
  ["features World Friends in selected work", /href="#world-friends"/.test(portfolioMarkup) && /class="portfolio-media portfolio-media-world-friends"/.test(portfolioMarkup) && /<span>World Friends<\/span>/.test(portfolioMarkup) && /On-camera talent · Representing Indonesia/.test(portfolioMarkup)],
  ["uses all three official World Friends thumbnails in selected work", worldFriendsVideoIds.every((id) => portfolioMarkup.includes(`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`)) && countMatches(portfolioMarkup, /class="world-friends-work-shot(?:\s[^"]*)?"/g) === 3],
  ["keeps the decorative World Friends collage out of the link name", /class="world-friends-work-thumbnail" aria-hidden="true"/.test(portfolioMarkup) && countMatches(portfolioMarkup, /class="world-friends-work-shot[^"]*"[\s\S]*?<img[^>]+alt=""/g) === 3],
  ["gives SNS supporter programs a dedicated selected-work thumbnail", /href="#sns-supporters"/.test(portfolioMarkup) && /class="portfolio-media portfolio-media-supporters"/.test(portfolioMarkup) && /class="sns-work-thumbnail" aria-hidden="true"/.test(portfolioMarkup) && ["sns-ttobagi-iksan.jpg", "sns-oh-my-gyeonggi-dongtan.jpg"].every((asset) => portfolioMarkup.includes(`assets/${asset}`)) && /class="sns-work-tour-story"/.test(portfolioMarkup)],
  ["keeps the decorative SNS thumbnail collage out of the link name", countMatches(portfolioMarkup, /class="sns-work-shot(?:\s[^\"]*)?"[\s\S]*?<img[^>]+alt=""/g) === 2],
  ["features Juvelook Indonesia voice dubbing in selected work", /href="https:\/\/www\.instagram\.com\/reel\/DO0rRiBD0Sn\/"[^>]+target="_blank" rel="noopener noreferrer"/.test(portfolioMarkup) && /Juvelook Indonesia/.test(portfolioMarkup) && /Bahasa Indonesia voice dubbing · Marketing reel/.test(portfolioMarkup)],
  ["uses the optimized Juvelook campaign reel cover", /assets\/juvelook-indonesia-reel\.webp/.test(portfolioMarkup)],
  ["labels the Juvelook external link for assistive technology", /opens on Instagram in a new tab/.test(portfolioMarkup)],
  ["features Astrid's TEUIDA app modeling in selected work", /id="teuida"/.test(portfolioMarkup) && /href="https:\/\/apps\.apple\.com\/id\/app\/teuida-learn-languages\/id1457532562"[^>]+target="_blank" rel="noopener noreferrer"/.test(portfolioMarkup) && /<span>TEUIDA<\/span>/.test(portfolioMarkup) && /Episode 1 · Greetings &amp; Introduction/.test(portfolioMarkup) && /Level 3 · TEUIDA Games/.test(portfolioMarkup)],
  ["uses all three supplied TEUIDA photo thumbnails", ["teuida-greetings-practice.jpg", "teuida-app-model.jpg", "teuida-greetings-overview.jpg"].every((asset) => portfolioMarkup.includes(`assets/${asset}`)) && countMatches(portfolioMarkup, /class="teuida-thumbnail(?:\s[^\"]*)?"/g) === 3],
  ["keeps the decorative TEUIDA thumbnail collage out of the link name", /class="teuida-thumbnail-grid" aria-hidden="true"/.test(portfolioMarkup) && countMatches(portfolioMarkup, /<div class="teuida-thumbnail(?:\s[^"]*)?">\s*<img[^>]+alt=""/g) === 3],
  ["serves supplied JPEG thumbnails with the correct media type", /"\.jpg": "image\/jpeg"/.test(server) && /"\.jpeg": "image\/jpeg"/.test(server)],
  ["labels the TEUIDA external link for assistive technology", /opens on the App Store in a new tab/.test(portfolioMarkup)],
  ["features Astrid's K Explorer street interview from 15:07", /id="kexplorer"/.test(portfolioMarkup) && /href="https:\/\/youtu\.be\/gyNbS2rxA1Y\?t=907"[^>]+target="_blank" rel="noopener noreferrer"/.test(portfolioMarkup) && /<span>K Explorer Street Interview<\/span>/.test(portfolioMarkup) && /Featured correspondent/.test(portfolioMarkup) && /Scene begins at 15:07/.test(portfolioMarkup)],
  ["uses three local K Explorer interview frames", ["kexplorer-street-interview-1530.webp", "kexplorer-street-interview-1617.webp", "kexplorer-street-interview-1714.webp"].every((asset) => portfolioMarkup.includes(`assets/${asset}`)) && countMatches(portfolioMarkup, /class="kexplorer-work-shot(?:\s[^"]*)?"/g) === 3],
  ["keeps the decorative K Explorer collage out of the link name", /class="kexplorer-work-thumbnail" aria-hidden="true"/.test(portfolioMarkup) && countMatches(portfolioMarkup, /<div class="kexplorer-work-shot(?:\s[^"]*)?">\s*<img[^>]+alt=""/g) === 3],
  ["labels the timestamped K Explorer link for assistive technology", /opens on YouTube in a new tab at 15 minutes and 7 seconds/.test(portfolioMarkup)],
  ["features exactly three SNS supporter programs", countMatches(supporterProgramsMarkup, /<article class="supporter-program"/g) === 3],
  ["features the 2025 Tour Story supporter program", /Tour Story Travel Agency SNS Supporter/.test(supporterProgramsMarkup) && /href="https:\/\/ktourstory\.com\/"[^>]+target="_blank" rel="noopener noreferrer"/.test(supporterProgramsMarkup)],
  ["features the 2022 and 2023 Ttobagi rural tourism program", /Global Rural Tourism Supporter \/ Ttobagi Family Farm/.test(supporterProgramsMarkup) && /Ministry of Agriculture, Food and Rural Affairs \(MAFRA\)/.test(supporterProgramsMarkup) && /Korea Rural Community Corporation/.test(supporterProgramsMarkup)],
  ["links both supplied Ttobagi campaign posts", ["CkGbVzFprCa", "Cj7-0D4JtT7"].every((id) => supporterProgramsMarkup.includes(id))],
  ["features the 2022 Oh My Gyeonggi foreign supporter program", /Gyeonggi Tourism Foreign Supporters — Oh! My Gyeonggi/.test(supporterProgramsMarkup) && /international audiences/.test(supporterProgramsMarkup) && /potential visitors overseas/.test(supporterProgramsMarkup)],
  ["links both supplied Oh My Gyeonggi campaign posts", ["CleECemJv3z", "CldU8xcuj8c"].every((id) => supporterProgramsMarkup.includes(id))],
  ["uses four local supporter campaign thumbnails", ["sns-ttobagi-wanju.jpg", "sns-ttobagi-iksan.jpg", "sns-oh-my-gyeonggi-osan.jpg", "sns-oh-my-gyeonggi-dongtan.jpg"].every((asset) => supporterProgramsMarkup.includes(`assets/${asset}`))],
  ["opens all five SNS program links safely", countMatches(supporterProgramsMarkup, /target="_blank" rel="noopener noreferrer"/g) === 5],
  ["presents Astrid as Indonesian talent for World Friends", /Representing <em>Indonesia<\/em> on World Friends/.test(worldFriendsMarkup) && /on-camera talent representing Indonesia/.test(worldFriendsMarkup)],
  ["links all three supplied World Friends videos", worldFriendsVideoIds.every((id) => countMatches(worldFriendsMarkup, new RegExp(id, "g")) === 2)],
  ["uses three official World Friends thumbnails", countMatches(worldFriendsMarkup, /https:\/\/i\.ytimg\.com\/vi\/[^/]+\/maxresdefault\.jpg/g) === 3],
  ["uses semantic linked video cards", countMatches(worldFriendsMarkup, /<article class="video-card"/g) === 3 && countMatches(worldFriendsMarkup, /class="video-card-link"/g) === 3],
  ["opens video links safely", countMatches(worldFriendsMarkup, /target="_blank" rel="noopener noreferrer"/g) === 3],
  ["has social sharing metadata", /property="og:image"/.test(html) && /name="twitter:card"/.test(html)],
  ["has Person structured data", /"@type": "Person"/.test(html)],
  ["supports Escape to close mobile navigation", /event\.key === "Escape"/.test(script)],
  ["keeps the responsive navigation breakpoint aligned", /window\.matchMedia\("\(min-width: 901px\)"\)/.test(script) && /@media \(max-width: 900px\)/.test(css)],
  ["supports reduced motion", /prefers-reduced-motion: reduce/.test(css)],
  ["uses visible focus treatment", /:focus-visible/.test(css)],
  ["keeps recommended touch target sizing", /min-height: 48px/.test(css) && /min-height: 44px/.test(css)],
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
