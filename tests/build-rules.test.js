const { convert } = require("../scripts/build-rules.js");

const sample = [
  "[Adblock Plus 2.0]",
  "! Title: sample",
  "||ads.example.com^",
  "||tracker.example.net^$third-party",
  "||ads.example.com^",
  "||cdn.example.org/ads/banner.js",
  "||img.example.org^$image",
  "@@||allowed.example.com^",
  "example.com##.banner",
  "||*.wild.example.com^"
].join("\n");

test("keeps only simple domain rules and removes duplicates", () => {
  const rules = convert(sample);
  expect(rules).toHaveLength(2);
  expect(rules[0].condition.urlFilter).toBe("||ads.example.com^");
  expect(rules[1].condition.urlFilter).toBe("||tracker.example.net^");
  expect(rules[1].condition.domainType).toBe("thirdParty");
});

test("rules are well formed with sequential ids", () => {
  const rules = convert(sample);
  expect(rules.map((r) => r.id)).toEqual([1, 2]);
  rules.forEach((r) => {
    expect(r.priority).toBe(1);
    expect(r.action.type).toBe("block");
  });
});

test("respects the max rule limit", () => {
  expect(convert(sample, 1)).toHaveLength(1);
});