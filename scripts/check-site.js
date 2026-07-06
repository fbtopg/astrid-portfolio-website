const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "assets/favicon.svg",
  "assets/climate-finance-workspace.png",
  "vercel.json",
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const checks = [
  ["has main landmark", /<main id="main-content">/.test(html)],
  ["has primary navigation label", /aria-label="Primary"/.test(html)],
  ["has skip link", /class="skip-link"/.test(html)],
  ["uses resume-style brand structure", /class="brand-name"/.test(html)],
  ["has favicon", /rel="icon" href="assets\/favicon\.svg"/.test(html)],
  ["uses resume-style metric cards", /class="metric-grid"/.test(html)],
  ["uses mobile nav toggle", /data-nav-toggle/.test(html)],
  ["keeps climate workspace visual alt text", /alt="Workspace with climate policy charts/.test(html)],
  ["omits Korean mobile phone numbers", !/\b01\d[- ]?\d{3,4}[- ]?\d{4}\b/.test(html)],
  ["omits detailed street/unit address", !/\b\d{3,4}\s+\d{3,4}\b/.test(html)],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length > 0) {
  console.error(`Site checks failed: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("Static site checks passed.");
