let queue = Promise.resolve();

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LOG_BLOCK") enqueue(msg.entry);
});

function enqueue(entry) {
  queue = queue.then(() => addStat(entry)).catch(() => {});
}

async function addStat(entry) {
  const today = new Date().toISOString().slice(0, 10);
  const { stats = {} } = await chrome.storage.local.get("stats");

  stats[today] = stats[today] || { dark_pattern: 0, network: 0, log: [] };
  stats[today][entry.type] = (stats[today][entry.type] || 0) + 1;
  stats[today].log.push(entry);
  if (stats[today].log.length > 200) stats[today].log.shift();

  const days = Object.keys(stats).sort();
  while (days.length > 30) {
    delete stats[days.shift()];
  }

  await chrome.storage.local.set({ stats });
  updateBadge(stats[today]);
}

function updateBadge(day) {
  const total = day.dark_pattern + day.network;
  const color = day.network >= day.dark_pattern ? "#e11d48" : "#f97316";
  chrome.action.setBadgeText({ text: total > 0 ? String(total) : "" });
  chrome.action.setBadgeBackgroundColor({ color });
}

async function syncAllowlistRules(allowlist) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((rule) => rule.id);
  const addRules = allowlist.filter(Boolean).map((host, i) => ({
    id: i + 1,
    priority: 100,
    action: { type: "allowAllRequests" },
    condition: { requestDomains: [host], resourceTypes: ["main_frame", "sub_frame"] }
  }));
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules });
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.allowlist) {
    syncAllowlistRules(changes.allowlist.newValue || []);
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const { allowlist = [] } = await chrome.storage.local.get("allowlist");
  syncAllowlistRules(allowlist);
});

if (chrome.declarativeNetRequest.onRuleMatchedDebug) {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    enqueue({
      type: "network",
      reasons: [`Blocked by rule #${info.rule.ruleId}`],
      selector: info.request.url,
      url: new URL(info.request.url).hostname,
      time: Date.now()
    });
  });
}