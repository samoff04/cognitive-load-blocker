(async function () {
  const today = new Date().toISOString().slice(0, 10);
  const { stats = {} } = await chrome.storage.local.get("stats");
  const todayStats = stats[today] || { dark_pattern: 0, network: 0 };

  document.getElementById("todayStats").innerHTML = `
    <div>Network blocks: <b>${todayStats.network}</b></div>
    <div>Dark patterns blocked: <b>${todayStats.dark_pattern}</b></div>
  `;

  document.getElementById("openDashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/dashboard.html") });
  });
})();