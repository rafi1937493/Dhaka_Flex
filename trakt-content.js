(() => {
  if (window.__dhakaFlexTraktLoaded) return;
  window.__dhakaFlexTraktLoaded = true;

  const moviePathPattern = /\/movies\/([^/?#]+)/i;
  const yearPattern = /\b((?:19|20)\d{2})\b/;
  const videoButtonText = "▶ Open in VLC";

  function movieInfoFromUrl(url) {
    const match = String(url || "").match(moviePathPattern);
    if (!match) return { title: "", year: 0 };
    let slug = match[1];
    try { slug = decodeURIComponent(slug); } catch { /* Keep the URL slug if malformed. */ }
    const yearMatch = slug.match(/(?:[-_])((?:19|20)\d{2})$/);
    const year = Number(yearMatch?.[1] || 0);
    const titleFromSlug = slug.replace(/[-_](?:19|20)\d{2}$/, "").replace(/[-_]+/g, " ").trim();
    return { title: titleFromSlug, year };
  }

  function parseYear(text) {
    const match = String(text || "").match(yearPattern);
    return Number(match?.[1] || 0);
  }

  function cleanTitle(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/\b(?:Watch trailer|Open in VLC|Movie|Film|Poster|Artwork)\b/gi, " ")
      .replace(/^\s*for\s+/i, " ")
      .replace(/^\s*poster\s+for\s+/i, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function readCardInfo(link) {
    const fromUrl = movieInfoFromUrl(link.href);
    const card = findCard(link);
    const imageTitle = link.querySelector("img[alt]")?.alt || card?.querySelector("img[alt]")?.alt || "";
    const label = link.getAttribute("aria-label") || imageTitle || link.innerText || card?.innerText || "";
    const title = cleanTitle(label).replace(yearPattern, " ").replace(/[()[\]]/g, " ").replace(/\s+/g, " ").trim() || fromUrl.title;
    const year = fromUrl.year || parseYear(label) || parseYear(card?.innerText);
    return { title: title || fromUrl.title, year, card };
  }

  function findCard(link) {
    let candidate = null;
    let node = link.parentElement;
    for (let depth = 0; node && depth < 7; depth++, node = node.parentElement) {
      const movieLinks = node.querySelectorAll('a[href*="/movies/"]');
      if (movieLinks.length > 1) break;
      if (node.querySelector("img") && node.getBoundingClientRect().width >= 110) candidate = node;
      if (candidate && node.matches("article, li")) return node;
    }
    return candidate;
  }

  function showTabMessage(tab, text) {
    try {
      tab.document.title = "Dhaka_Flex";
      tab.document.body.textContent = text;
      tab.document.body.style.cssText = "font:16px Arial,sans-serif;padding:28px;background:#11151d;color:#fff";
    } catch { /* The tab may have been closed. */ }
  }

  function openTrailer(title, year, button) {
    const tab = window.open("about:blank", "_blank");
    if (!tab) {
      alert("Chrome blocked the trailer tab. Allow pop-ups for Trakt, then try again.");
      return;
    }
    const query = year ? `${title} ${year}` : title;
    showTabMessage(tab, `Finding the trailer for ${query}…`);
    button.disabled = true;
    chrome.runtime.sendMessage({ type: "GET_TRAILER", query, mediaType: "movie" }, response => {
      button.disabled = false;
      const error = chrome.runtime.lastError?.message;
      if (error || !response?.ok || !response.url) {
        showTabMessage(tab, response?.error || "Could not find a trailer. Check the TMDb key in Dhaka_Flex settings.");
        return;
      }
      try { tab.location.href = response.url; } catch { /* Closed tab. */ }
    });
  }

  function addActions(target, info, isDetail = false) {
    if (!target || !info.title || target.querySelector?.(":scope > .dhaka-flex-trakt-host")) return;
    const host = document.createElement("div");
    host.className = "dhaka-flex-trakt-host";
    host.dataset.movieKey = `${info.title}:${info.year}`;
    if (!isDetail) host.dataset.dhakaFlexMovie = "true";
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        :host { display:block; position:relative; z-index:5; width:min(100%, 190px); margin:8px 0; }
        .actions { display:flex; flex-direction:column; gap:5px; }
        button,select { box-sizing:border-box; width:100%; min-height:30px; border:0; border-radius:7px; padding:6px 8px; color:#fff; font:600 12px/1.25 Arial,sans-serif; }
        button { cursor:pointer; }
        button:disabled { opacity:.72; cursor:wait; }
        .trailer { background:#ef4660; }
        .vlc { background:#138b72; }
        select { background:#242936; border:1px solid #555e6d; }
        .status { color:#f1f2f5; font:11px/1.35 Arial,sans-serif; overflow-wrap:anywhere; }
      </style>
      <div class="actions">
        <button class="trailer" type="button">▶ Watch trailer</button>
        <button class="vlc" type="button">${videoButtonText}</button>
        <select hidden aria-label="Choose a DhakaFlix version"></select>
        <button class="vlc selected" type="button" hidden>▶ Open selected version</button>
        <span class="status" aria-live="polite"></span>
      </div>`;

    const trailerButton = shadow.querySelector(".trailer");
    const vlcButton = shadow.querySelector(".vlc:not(.selected)");
    const select = shadow.querySelector("select");
    const selectedButton = shadow.querySelector(".selected");
    const status = shadow.querySelector(".status");
    trailerButton.addEventListener("click", () => openTrailer(info.title, info.year, trailerButton));

    const launchFile = file => {
      vlcButton.disabled = true;
      selectedButton.disabled = true;
      status.textContent = "Sending to VLC…";
      chrome.runtime.sendMessage({ type: "OPEN_IN_VLC", url: file.url }, response => {
        vlcButton.disabled = false;
        selectedButton.disabled = false;
        const error = chrome.runtime.lastError?.message || (!response?.ok ? response?.error : "");
        status.textContent = error ? `Could not open VLC: ${error}` : "Sent to VLC.";
      });
    };

    let files = [];
    vlcButton.addEventListener("click", () => {
      if (!info.year) {
        status.textContent = "Trakt did not show a release year, so DhakaFlix cannot be searched safely.";
        return;
      }
      if (files.length) {
        if (files.length === 1) launchFile(files[0]);
        else {
          select.hidden = false;
          selectedButton.hidden = false;
          status.textContent = "Choose a version from DhakaFlix.";
        }
        return;
      }
      vlcButton.disabled = true;
      vlcButton.textContent = "Searching DhakaFlix…";
      status.textContent = `Looking for ${info.title} (${info.year}) in your DhakaFlix collection…`;
      chrome.runtime.sendMessage(
        { type: "FIND_DHAKAFLIX_MOVIE", title: info.title, year: info.year },
        response => {
          vlcButton.disabled = false;
          vlcButton.textContent = videoButtonText;
          const error = chrome.runtime.lastError?.message;
          if (error || !response?.ok) {
            status.textContent = response?.error || "Could not reach DhakaFlix. Connect to its network and try again.";
            return;
          }
          files = response.files || [];
          if (!files.length) {
            status.textContent = `No ${info.title} (${info.year}) match found in DhakaFlix.`;
            return;
          }
          if (files.length === 1) {
            status.textContent = `Found in ${files[0].collection}.`;
            launchFile(files[0]);
            return;
          }
          select.replaceChildren(...files.map((file, index) => {
            const option = document.createElement("option");
            option.value = String(index);
            option.textContent = `${file.collection}: ${file.name}`;
            return option;
          }));
          select.hidden = false;
          selectedButton.hidden = false;
          status.textContent = `Found ${files.length} versions. Choose one to open.`;
        }
      );
    });
    selectedButton.addEventListener("click", () => {
      const file = files[Number(select.value)];
      if (file) launchFile(file);
    });

    target.appendChild(host);
  }

  function addDetailActions() {
    const infoFromUrl = movieInfoFromUrl(location.pathname);
    if (!infoFromUrl.year) return;
    const heading = document.querySelector("main h1, h1");
    if (!heading) return;
    const headingText = cleanTitle(heading.textContent);
    const title = headingText || infoFromUrl.title;
    const year = parseYear(heading.parentElement?.innerText) || infoFromUrl.year;
    const existing = heading.parentElement?.querySelector(":scope > .dhaka-flex-trakt-host");
    const movieKey = `${title}:${year}`;
    if (existing?.dataset.movieKey === movieKey) return;
    existing?.remove();
    addActions(heading.parentElement || heading, { title, year }, true);
  }

  function addDiscoveryActions() {
    const links = document.querySelectorAll('a[href*="/movies/"]');
    for (const link of links) {
      const info = readCardInfo(link);
      if (!info.title || !info.year || !info.card) continue;
      const movieKey = `${info.title}:${info.year}:${link.href}`;
      if (link.dataset.dhakaFlexObserved === movieKey) continue;
      const existing = info.card.querySelector(":scope > .dhaka-flex-trakt-host");
      if (existing?.dataset.movieKey === `${info.title}:${info.year}`) {
        link.dataset.dhakaFlexObserved = movieKey;
        continue;
      }
      existing?.remove();
      link.dataset.dhakaFlexObserved = movieKey;
      addActions(info.card, info);
    }
  }

  function update() {
    if (/^\/movies\/[^/]+\/?$/i.test(location.pathname)) addDetailActions();
    else addDiscoveryActions();
  }

  update();
  let updateTimer = 0;
  const observer = new MutationObserver(() => {
    if (updateTimer) return;
    updateTimer = window.setTimeout(() => {
      updateTimer = 0;
      update();
    }, 300);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("popstate", update);
})();
