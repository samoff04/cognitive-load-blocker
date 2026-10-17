const fs = require("fs");
const path = require("path");

const SOURCE_URL = "https://easylist.to/easylist/easylist.txt";
const OUTPUT_PATH = path.join(__dirname, "..", "rules", "ad_rules.json");
const DEFAULT_MAX_RULES = 20000;
const DOMAIN_RULE = /^\|\|([a-z0-9][a-z0-9.-]*\.[a-z]{2,})\^(?:\$(.+))?$/i;

function convert(text, maxRules = DEFAULT_MAX_RULES) {
  const seen = new Set();
  const rules = [];

  for (const rawLine of text.split(/\r?\n/)) {
    if (rules.length >= maxRules) break;

    const line = rawLine.trim();
    if (!line || line.startsWith("!") || line.startsWith("[") || line.startsWith("@@")) continue;

    const match = line.match(DOMAIN_RULE);
    if (!match) continue;

    const domain = match[1].toLowerCase();
    const options = match[2] ? match[2].split(",") : [];
    if (options.some((option) => option !== "third-party")) continue;
    const thirdParty = options.includes("third-party");

    const key = `${domain}|${thirdParty}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const condition = { urlFilter: `||${domain}^` };
    if (thirdParty) condition.domainType = "thirdParty";

    rules.push({
      id: rules.length + 1,
      priority: 1,
      action: { type: "block" },
      condition
    });
  }

  return rules;
}

async function main() {
  const args = process.argv.slice(2);
  const url = args.find((arg) => arg.startsWith("http")) || SOURCE_URL;
  const maxArg = args.find((arg) => arg.startsWith("--max="));
  const max = maxArg ? parseInt(maxArg.split("=")[1], 10) : DEFAULT_MAX_RULES;

  if (!Number.isInteger(max) || max < 1) {
    throw new Error("--max must be a positive number");
  }

  console.log(`Downloading ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const text = await res.text();

  const rules = convert(text, max);
  if (rules.length === 0) {
    throw new Error("No usable rules found, existing file left untouched.");
  }

  const body = "[\n" + rules.map((rule) => "  " + JSON.stringify(rule)).join(",\n") + "\n]\n";
  fs.writeFileSync(OUTPUT_PATH, body);
  console.log(`Wrote ${rules.length} rules to ${OUTPUT_PATH}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { convert };