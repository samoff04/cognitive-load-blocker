const slider = document.getElementById("threshold");
const valueLabel = document.getElementById("thresholdValue");
const previewBox = document.getElementById("preview");
const listEl = document.getElementById("allowlistItems");
const statusEl = document.getElementById("status");

async function load() {
  const { threshold = 4, allowlist = [], previewMode = false } =
    await chrome.storage.local.get(["threshold", "allowlist", "previewMode"]);
  slider.value = threshold;
  valueLabel.textContent = threshold;
  previewBox.checked = previewMode;

  listEl.innerHTML = "";
  allowlist.forEach((site) => {
    const li = document.createElement("li");
    li.textContent = site + " ";
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "remove";
    removeBtn.addEventListener("click", async () => {
      const updated = allowlist.filter((s) => s !== site);
      await chrome.storage.local.set({ allowlist: updated });
      load();
    });
    li.appendChild(removeBtn);
    listEl.appendChild(li);
  });
}

slider.addEventListener("input", () => {
  valueLabel.textContent = slider.value;
});

document.getElementById("save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    threshold: parseInt(slider.value, 10),
    previewMode: previewBox.checked
  });
  statusEl.textContent = "Saved.";
  setTimeout(() => (statusEl.textContent = ""), 1500);
});

load();