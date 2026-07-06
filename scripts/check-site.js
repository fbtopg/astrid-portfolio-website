const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "script.js",
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
  ["has main landmark", /<main id="main">/.test(html)],
  ["has primary navigation label", /aria-label="Primary navigation"/.test(html)],
  ["has skip link", /class="skip-link"/.test(html)],
  ["has hero image alt text", /alt="Workspace with climate policy charts/.test(html)],
  ["omits Korean mobile phone numbers", !/\b01\d[- ]?\d{3,4}[- ]?\d{4}\b/.test(html)],
  ["omits detailed street/unit address", !/\b\d{3,4}\s+\d{3,4}\b/.test(html)],
];

const failed = checks.filter(([, passed]) => !passed).map(([name]) => name);
if (failed.length > 0) {
  console.error(`Site checks failed: ${failed.join(", ")}`);
  process.exit(1);
}

console.log("Static site checks passed.");
