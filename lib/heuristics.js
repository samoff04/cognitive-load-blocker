const CLBHeuristics = (() => {
  const URGENCY_REGEX = /\b(only \d+ left|\d+ people (are )?(viewing|watching|bought)|hurry|ends in|offer expires|last chance|\d{1,2}:\d{2}:\d{2})\b/i;
  const BAIT_TEXT_REGEX = /\b(subscribe now|don't miss out|before it'?s too late|limited time|act now)\b/i;

  function isFixedOverlay(el) {
    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const coversSignificantArea = (rect.width * rect.height) > (window.innerWidth * window.innerHeight * 0.25);
    return (style.position === "fixed" || style.position === "sticky")
      && parseInt(style.zIndex || "0", 10) > 999
      && coversSignificantArea;
  }

  function hasHiddenOrTinyCloseButton(el) {
    const closeCandidates = el.querySelectorAll('[class*="close" i], [aria-label*="close" i], button');
    for (const btn of closeCandidates) {
      const rect = btn.getBoundingClientRect();
      const style = getComputedStyle(btn);
      const tiny = rect.width < 12 && rect.height < 12;
      const invisible = style.opacity === "0" || style.visibility === "hidden";
      if (tiny || invisible) return true;
    }
    return false;
  }

  function hasUrgencyText(el) {
    const text = el.innerText || "";
    return URGENCY_REGEX.test(text) || BAIT_TEXT_REGEX.test(text);
  }

  function isAutoplayWithSound(el) {
    if (el.tagName !== "VIDEO") return false;
    return el.autoplay === true && el.muted === false;
  }

  function isCountdownTimer(el) {
    const text = el.innerText || "";
    return /\b\d{1,2}:\d{2}:\d{2}\b/.test(text) && /(hour|min|sec|expires|ends)/i.test(text);
  }

  function scoreElement(el) {
    let score = 0;
    const reasons = [];

    if (isFixedOverlay(el)) { score += 3; reasons.push("Fixed full-screen overlay"); }
    if (hasHiddenOrTinyCloseButton(el)) { score += 3; reasons.push("Close button hidden or too small to tap"); }
    if (hasUrgencyText(el)) { score += 2; reasons.push("Manufactured urgency language"); }
    if (isCountdownTimer(el)) { score += 2; reasons.push("Countdown timer pattern"); }
    if (isAutoplayWithSound(el)) { score += 4; reasons.push("Autoplay video with sound"); }

    return { score, reasons };
  }

  const BLOCK_THRESHOLD = 4;

  return { scoreElement, BLOCK_THRESHOLD };
})();