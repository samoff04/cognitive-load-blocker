const CLBHeuristics = (() => {
  const URGENCY_REGEX = /\b(only \d+ left|\d+ people (are )?(viewing|watching|bought)|hurry|ends in|offer expires|last chance)\b/i;
  const BAIT_TEXT_REGEX = /\b(subscribe now|don't miss out|before it'?s too late|limited time|act now)\b/i;
  const COUNTDOWN_REGEX = /\b\d{1,2}:\d{2}:\d{2}\b/;
  const COUNTDOWN_CONTEXT_REGEX = /(hour|min|sec|expires|ends|left)/i;
  const CONSENT_REGEX = /\b(cookies?|consent|gdpr)\b/i;
  const MAX_TEXT_LENGTH = 400;
  const MAX_CONSENT_LENGTH = 800;

  function getText(el) {
    return (el.innerText || el.textContent || "").trim();
  }

  function isFloating(style) {
    return style.position === "fixed" || style.position === "sticky" || style.position === "absolute";
  }

  function isFixedOverlay(el, style) {
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

  function hasUrgencyText(text) {
    return URGENCY_REGEX.test(text) || BAIT_TEXT_REGEX.test(text);
  }

  function isCountdownTimer(text) {
    return COUNTDOWN_REGEX.test(text) && COUNTDOWN_CONTEXT_REGEX.test(text);
  }

  function isAutoplayWithSound(el) {
    if (el.tagName !== "VIDEO") return false;
    return el.autoplay === true && el.muted === false;
  }

  function scoreElement(el) {
    let score = 0;
    const reasons = [];

    if (el.tagName === "BODY" || el.tagName === "HTML") return { score, reasons };

    const style = getComputedStyle(el);
    const text = getText(el);
    const shortText = text.length > 0 && text.length <= MAX_TEXT_LENGTH;
    const floating = isFloating(style);

    if (floating && text.length <= MAX_CONSENT_LENGTH && CONSENT_REGEX.test(text)) {
      return { score: 0, reasons: ["Cookie/consent banner (exempt)"] };
    }

    if (isFixedOverlay(el, style)) { score += 3; reasons.push("Fixed full-screen overlay"); }
    if (floating && hasHiddenOrTinyCloseButton(el)) { score += 3; reasons.push("Close button hidden or too small to tap"); }
    if (shortText && hasUrgencyText(text)) { score += 2; reasons.push("Manufactured urgency language"); }
    if (shortText && isCountdownTimer(text)) { score += 2; reasons.push("Countdown timer pattern"); }
    if (isAutoplayWithSound(el)) { score += 4; reasons.push("Autoplay video with sound"); }

    return { score, reasons };
  }

  const BLOCK_THRESHOLD = 4;

  return { scoreElement, BLOCK_THRESHOLD };
})();

if (typeof module !== "undefined") {
  module.exports = CLBHeuristics;
}