(async function () {
  const { stats = {} } = await chrome.storage.local.get("stats");
  const days = Object.keys(stats).sort().slice(-7);

  const chartEl = document.getElementById("chart");
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

  const logBody = document.getElementById("log");
  const allLogs = days.flatMap(d => stats[d].log || []).sort((a, b) => b.time - a.time).slice(0, 50);

  allLogs.forEach((entry) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${new Date(entry.time).toLocaleTimeString()}</td>
      <td>${entry.type}</td>
      <td>${entry.url}</td>
      <td>${(entry.reasons || []).join(", ")}</td>
    `;
    logBody.appendChild(tr);
  });
})();