(function () {
  const seen = new WeakSet();

  function handleElement(el) {
    if (seen.has(el)) return;
    seen.add(el);
    if (!el.getBoundingClientRect) return;

    const { score, reasons } = CLBHeuristics.scoreElement(el);

    if (score >= CLBHeuristics.BLOCK_THRESHOLD) {
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

  document.addEventListener("DOMContentLoaded", () => {
    scanTree(document.body);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();