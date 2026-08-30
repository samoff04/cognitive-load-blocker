chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "LOG_BLOCK") {
    addStat(msg.entry, sender.tab?.id);
  }
});

async function addStat(entry, tabId) {
  const today = new Date().toISOString().slice(0, 10);
  const { stats = {} } = await chrome.storage.local.get("stats");

  stats[today] = stats[today] || { dark_pattern: 0, network: 0, log: [] };
  stats[today][entry.type] = (stats[today][entry.type] || 0) + 1;
  stats[today].log.push(entry);
  if (stats[today].log.length > 200) stats[today].log.shift();

  await chrome.storage.local.set({ stats });
  updateBadge(stats[today].dark_pattern + stats[today].network);
}

function updateBadge(count) {
  chrome.action.setBadgeText({ text: count > 0 ? String(count) : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#e11d48" });
}

if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    addStat({
      type: "network",
      reasons: [`Blocked by rule #${info.rule.ruleId}`],
      selector: info.request.url,
      url: new URL(info.request.url).hostname,
      time: Date.now()
    });
  });
}