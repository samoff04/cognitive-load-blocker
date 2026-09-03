const fs = require("fs");
const path = require("path");
const code = fs.readFileSync(path.join(__dirname, "../lib/heuristics.js"), "utf8");
eval(code);

function makeElement({ position = "static", zIndex = "0", width = 100, height = 100, text = "" } = {}) {
  const el = document.createElement("div");
  el.style.position = position;
  el.style.zIndex = zIndex;
  Object.defineProperty(el, "getBoundingClientRect", {
    value: () => ({ width, height })
  });
  el.innerText = text;
  return el;
}

test("plain div scores 0", () => {
  const el = makeElement();
  const { score } = CLBHeuristics.scoreElement(el);
  expect(score).toBe(0);
});

test("urgency text adds to score", () => {
  const el = makeElement({ text: "Only 2 left, hurry!" });
  const { score, reasons } = CLBHeuristics.scoreElement(el);
  expect(score).toBeGreaterThan(0);
  expect(reasons).toContain("Manufactured urgency language");
});

test("large fixed overlay is flagged", () => {
  const el = makeElement({
    position: "fixed",
    zIndex: "9999",
    width: window.innerWidth,
    height: window.innerHeight
  });
  const { score, reasons } = CLBHeuristics.scoreElement(el);
  expect(reasons).toContain("Fixed full-screen overlay");
  expect(score).toBeGreaterThanOrEqual(3);
});

test("autoplay video with sound is flagged", () => {
  const video = document.createElement("video");
  video.autoplay = true;
  video.muted = false;
  const { score, reasons } = CLBHeuristics.scoreElement(video);
  expect(reasons).toContain("Autoplay video with sound");
  expect(score).toBeGreaterThanOrEqual(4);
});