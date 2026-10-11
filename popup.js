const keyInput = document.getElementById("api-key");
const status = document.getElementById("status");
const hideFolderTree = document.getElementById("hide-folder-tree");
const folderTreePreference = "dhakaflixHideFolderTree";

chrome.storage.local.get(["tmdbApiKey", folderTreePreference], result => {
  if (result.tmdbApiKey) {
    keyInput.value = result.tmdbApiKey;
    status.textContent = "A key is saved on this PC. You can replace it if needed.";
  }
  hideFolderTree.checked = Boolean(result[folderTreePreference]);
});

hideFolderTree.addEventListener("change", () => {
  chrome.storage.local.set({ [folderTreePreference]: hideFolderTree.checked }, () => {
    status.textContent = hideFolderTree.checked
      ? "Folder tree hidden in this Chrome profile."
      : "Folder tree shown in this Chrome profile.";
  });
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
