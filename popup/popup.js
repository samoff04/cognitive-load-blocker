(async function () {
  const today = new Date().toISOString().slice(0, 10);
  const { stats = {} } = await chrome.storage.local.get("stats");
  const todayStats = stats[today] || { dark_pattern: 0, network: 0 };

  document.getElementById("todayStats").innerHTML = `
    <div>Network blocks: <b>${todayStats.network}</b></div>
    <div>Dark patterns blocked: <b>${todayStats.dark_pattern}</b></div>
  `;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const hostname = tab?.url ? new URL(tab.url).hostname : null;
  const toggleBtn = document.getElementById("toggleSite");

  async function refreshToggle() {
    const { allowlist = [] } = await chrome.storage.local.get("allowlist");
    if (hostname && allowlist.includes(hostname)) {
      toggleBtn.textContent = `Enable on ${hostname}`;
    } else {
      toggleBtn.textContent = hostname ? `Disable on ${hostname}` : "Disable on this site";
    }
  }

  toggleBtn.addEventListener("click", async () => {
    if (!hostname) return;
    const { allowlist = [] } = await chrome.storage.local.get("allowlist");
    const updated = allowlist.includes(hostname)
      ? allowlist.filter((h) => h !== hostname)
      : [...allowlist, hostname];
    await chrome.storage.local.set({ allowlist: updated });
    refreshToggle();
  });

  refreshToggle();

  document.getElementById("openDashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard/dashboard.html") });
  });

  document.getElementById("openOptions").addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
})();