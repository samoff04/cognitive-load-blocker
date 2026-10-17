const CLBHeuristics = require("../lib/heuristics.js");

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

function addTinyCloseButton(parent) {
  const btn = document.createElement("button");
  btn.textContent = "close";
  Object.defineProperty(btn, "getBoundingClientRect", {
    value: () => ({ width: 5, height: 5 })
  });
  parent.appendChild(btn);
  return btn;
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

test("a timestamp alone is not treated as urgency", () => {
  const el = makeElement({ text: "Video length 1:02:33" });
  expect(CLBHeuristics.scoreElement(el).score).toBe(0);
});

test("long text containers are ignored by text checks", () => {
  const el = makeElement({ text: "Hurry, offer ends in 01:02:03. " + "lorem ipsum ".repeat(60) });
  expect(CLBHeuristics.scoreElement(el).score).toBe(0);
});

test("cookie consent banners are exempt", () => {
  const el = makeElement({
    position: "fixed",
    zIndex: "9999",
    width: window.innerWidth,
    height: window.innerHeight,
    text: "We use cookies to improve your experience."
  });
  const { score, reasons } = CLBHeuristics.scoreElement(el);
  expect(score).toBe(0);
  expect(reasons[0]).toMatch(/exempt/);
});

test("tiny close button counts inside a floating popup", () => {
  const el = makeElement({ position: "fixed", zIndex: "9999", width: 300, height: 200 });
  addTinyCloseButton(el);
  const { score, reasons } = CLBHeuristics.scoreElement(el);
  expect(reasons).toContain("Close button hidden or too small to tap");
  expect(score).toBe(3);
});

test("tiny button is ignored when the element is not floating", () => {
  const el = makeElement();
  addTinyCloseButton(el);
  expect(CLBHeuristics.scoreElement(el).score).toBe(0);
});

test("full fake-urgency popup crosses the block threshold", () => {
  const el = makeElement({
    position: "fixed",
    zIndex: "9999",
    width: window.innerWidth,
    height: window.innerHeight,
    text: "Hurry! Only 2 left, offer ends in 00:02:15"
  });
  addTinyCloseButton(el);
  const { score } = CLBHeuristics.scoreElement(el);
  expect(score).toBeGreaterThanOrEqual(CLBHeuristics.BLOCK_THRESHOLD);
});