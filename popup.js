const keyInput = document.getElementById("api-key");
const status = document.getElementById("status");

chrome.storage.local.get("tmdbApiKey", result => {
  if (result.tmdbApiKey) {
    keyInput.value = result.tmdbApiKey;
    status.textContent = "A key is saved on this PC. You can replace it if needed.";
  }
});

document.getElementById("key-form").addEventListener("submit", event => {
  event.preventDefault();
  const apiKey = keyInput.value.trim();
  if (!apiKey) {
    status.textContent = "Paste the API Key (v3 auth) first.";
    return;
  }
  chrome.storage.local.set({ tmdbApiKey: apiKey }, () => {
    status.textContent = "Saved in this Chrome profile. Open DhakaFlix and search.";
  });
});

document.getElementById("open-site").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://172.16.50.7/" });
});
