async function render() {
  const { stats = {} } = await chrome.storage.local.get("stats");
  const allDays = Object.keys(stats).sort();
  const days = allDays.slice(-7);

  const chartEl = document.getElementById("chart");
  const logBody = document.getElementById("log");
  const emptyEl = document.getElementById("empty");
  const totalEl = document.getElementById("total");
  chartEl.innerHTML = "";
  logBody.innerHTML = "";

  const lifetime = allDays.reduce(
    (sum, d) => sum + (stats[d].network || 0) + (stats[d].dark_pattern || 0),
    0
  );
  totalEl.textContent = `Total blocked (last 30 days): ${lifetime}`;

  if (days.length === 0) {
    emptyEl.textContent = "No blocks recorded yet. Browse a few sites and check back.";
    return;
  }
  emptyEl.textContent = "";

  const maxVal = Math.max(1, ...days.map(d => (stats[d].network || 0) + (stats[d].dark_pattern || 0)));

  days.forEach((day) => {
    const total = (stats[day].network || 0) + (stats[day].dark_pattern || 0);
    const widthPct = (total / maxVal) * 100;
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML = `
      <div class="bar-label">${day}</div>
      <div class="bar" style="width:${widthPct}%"></div>
      <div>${total}</div>
    `;
    chartEl.appendChild(row);
  });

  const allLogs = days.flatMap(d => stats[d].log || []).sort((a, b) => b.time - a.time).slice(0, 50);

  allLogs.forEach((entry) => {
    const tr = document.createElement("tr");
    const cells = [
      new Date(entry.time).toLocaleTimeString(),
      entry.type,
      entry.url,
      (entry.reasons || []).join(", ")
    ];
    cells.forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });
    logBody.appendChild(tr);
  });
}

document.getElementById("clearStats").addEventListener("click", async () => {
  if (!confirm("Delete all block history? This can't be undone.")) return;
  await chrome.storage.local.remove("stats");
  chrome.action.setBadgeText({ text: "" });
  render();
});

render();