(function () {
  const seen = new WeakSet();
  let allowlist = [];
  let threshold = CLBHeuristics.BLOCK_THRESHOLD;

  async function loadSettings() {
    const { allowlist: al = [], threshold: t } = await chrome.storage.local.get(["allowlist", "threshold"]);
    allowlist = al;
    threshold = t || CLBHeuristics.BLOCK_THRESHOLD;
  }

  function isAllowed() {
    return allowlist.includes(location.hostname);
  }

  function handleElement(el) {
    if (seen.has(el)) return;
    seen.add(el);
    if (!el.getBoundingClientRect) return;
    if (isAllowed()) return;

    const { score, reasons } = CLBHeuristics.scoreElement(el);

    if (score >= threshold) {
      el.style.setProperty("display", "none", "important");
      logBlock({
        type: "dark_pattern",
        score,
        reasons,
        selector: el.tagName + (el.className ? "." + String(el.className).split(" ").join(".") : ""),
        url: location.hostname,
        time: Date.now()
      });
    }
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
  });
})();