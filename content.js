(function () {
  const seen = new WeakSet();
  let allowlist = [];
  let threshold = CLBHeuristics.BLOCK_THRESHOLD;
  let previewMode = false;

  async function loadSettings() {
    const stored = await chrome.storage.local.get(["allowlist", "threshold", "previewMode"]);
    allowlist = stored.allowlist || [];
    threshold = stored.threshold || CLBHeuristics.BLOCK_THRESHOLD;
    previewMode = Boolean(stored.previewMode);
  }

  function isAllowed() {
    return allowlist.includes(location.hostname);
  }

  function describe(el) {
    const cls = typeof el.className === "string" ? el.className.trim() : "";
    return el.tagName + (cls ? "." + cls.split(/\s+/).join(".") : "");
  }

  function flagElement(el, score, reasons) {
    if (previewMode) {
      el.style.setProperty("outline", "3px dashed #e11d48", "important");
      el.title = `Cognitive Load Blocker (preview): ${reasons.join(", ")} [score ${score}]`;
      return;
    }

    el.style.setProperty("display", "none", "important");
    logBlock({
      type: "dark_pattern",
      score,
      reasons,
      selector: describe(el),
      url: location.hostname,
      time: Date.now()
    });
  }

  function handleElement(el) {
    if (seen.has(el)) return;
    seen.add(el);
    if (!el.getBoundingClientRect) return;
    if (isAllowed()) return;

    const { score, reasons } = CLBHeuristics.scoreElement(el);
    if (score >= threshold) flagElement(el, score, reasons);
  }

  function scanTree(root) {
    if (root.nodeType !== 1) return;
    handleElement(root);
    root.querySelectorAll?.("div, section, aside, video").forEach(handleElement);
  }

  function logBlock(entry) {
    chrome.runtime.sendMessage({ type: "LOG_BLOCK", entry });
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => scanTree(node));
    }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    await loadSettings();
    scanTree(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.allowlist) allowlist = changes.allowlist.newValue || [];
    if (changes.threshold) threshold = changes.threshold.newValue || CLBHeuristics.BLOCK_THRESHOLD;
    if (changes.previewMode) previewMode = Boolean(changes.previewMode.newValue);
  });
})();