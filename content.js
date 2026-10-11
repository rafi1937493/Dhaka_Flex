(() => {
  if (window.__dhakaFlixPosterAndTrailerLoaded) return;
  window.__dhakaFlixPosterAndTrailerLoaded = true;

  const imageFile = /\.(?:jpe?g|png|webp|gif)(?:[?#].*)?$/i;
  const movieFile = /\.(?:mkv|mp4|avi|mov|wmv|m4v|webm)(?:[?#].*)?$/i;

  const style = document.createElement("style");
  style.textContent = `
    /* Cinematic poster wall using h5ai's real item markup. */
    #view.view-icons {
      box-sizing: border-box !important;
      width: auto !important;
      margin: 16px !important;
      padding: 16px !important;
      min-height: calc(100vh - 150px) !important;
      border: 1px solid rgba(255,255,255,.08) !important;
      border-radius: 22px !important;
      background: radial-gradient(ellipse at 80% 0%, rgba(255,91,74,.17), transparent 42%), linear-gradient(145deg,#10131b,#171b25 65%,#11141c) !important;
      box-shadow: 0 18px 48px rgba(16,19,27,.18) !important;
    }

    #view.view-icons #items {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(150px, 178px)) !important;
      gap: 14px !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      list-style: none !important;
      justify-content: start !important;
    }

    #view.view-icons #items.clearfix::before,
    #view.view-icons #items.clearfix::after {
      display: none !important;
      content: none !important;
    }

    #view.view-icons #items > .header {
      display: none !important;
    }

    #view.view-icons #items > .item {
      position: relative !important;
      display: flex !important;
      flex-direction: column !important;
      float: none !important;
      box-sizing: border-box !important;
      width: auto !important;
      min-width: 0 !important;
      min-height: 0 !important;
      height: auto !important;
      align-self: start !important;
      margin: 0 !important;
      padding: 0 0 12px !important;
      overflow: hidden !important;
      border: 1px solid rgba(255,255,255,.11) !important;
      border-radius: 16px !important;
      background: linear-gradient(165deg,#242a36,#1b202a 72%) !important;
      color: #f5f6fa !important;
      box-shadow: 0 2px 8px rgba(0,0,0,.14) !important;
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease !important;
    }

    #view.view-icons #items > .item.dhakaflix-poster-used,
    #fallback tr.dhakaflix-poster-used {
      display: none !important;
    }

    #view.view-icons #items > .item.dhakaflix-has-poster .icon.landscape {
      background: #11151d !important;
    }

    #view.view-icons #items > .item.dhakaflix-has-poster .icon.landscape img {
      filter: saturate(1.06) contrast(1.03) !important;
      object-fit: cover !important;
    }

    .dhakaflix-poster-loading {
      opacity: 0 !important;
      transition: opacity .32s ease !important;
    }

    .dhakaflix-poster-loaded {
      opacity: 1 !important;
      transition: opacity .32s ease !important;
    }

    #view.view-icons #items > .item.dhakaflix-folder-poster-pending .icon.landscape::after,
    #fallback tr.dhakaflix-folder-poster-pending td.fb-i::after {
      position: absolute !important;
      inset: 0 !important;
      z-index: 1 !important;
      content: "" !important;
      pointer-events: none !important;
      background: linear-gradient(145deg, rgba(255,255,255,.12), rgba(255,255,255,.015) 48%, rgba(255,255,255,.075)) !important;
      opacity: .32 !important;
      animation: dhakaflix-poster-breathe 1.5s ease-in-out infinite alternate !important;
    }

    @keyframes dhakaflix-poster-breathe {
      from { opacity: .25; }
      to { opacity: .82; }
    }

    @media (prefers-reduced-motion: reduce) {
      .dhakaflix-poster-loading,
      .dhakaflix-poster-loaded,
      #view.view-icons #items > .item.dhakaflix-folder-poster-pending .icon.landscape::after,
      #fallback tr.dhakaflix-folder-poster-pending td.fb-i::after {
        animation: none !important;
        transition: none !important;
      }
    }

    #view.view-icons #items > .item .icon.landscape.dhakaflix-art-host {
      position: relative !important;
    }

    #view.view-icons #items > .item .dhakaflix-folder-icon-hidden {
      display: none !important;
    }

    #view.view-icons #items > .item .dhakaflix-poster-collage {
      position: absolute !important;
      inset: 0 !important;
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      grid-template-rows: repeat(2, minmax(0, 1fr)) !important;
      gap: 2px !important;
      overflow: hidden !important;
      background: #10131a !important;
    }

    #view.view-icons #items > .item .dhakaflix-poster-collage img {
      display: block !important;
      width: 100% !important;
      height: 100% !important;
      max-width: none !important;
      max-height: none !important;
      object-fit: cover !important;
    }

    #view.view-icons #items > .item .dhakaflix-missing-art,
    #fallback .dhakaflix-missing-art {
      position: absolute !important;
      inset: 0 !important;
      z-index: 2 !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-end !important;
      box-sizing: border-box !important;
      padding: 16px !important;
      overflow: hidden !important;
      color: #fff !important;
      text-align: left !important;
      background: radial-gradient(ellipse at 75% 20%, rgba(255,112,84,.35), transparent 45%), linear-gradient(150deg,#30394a,#151a24 70%) !important;
    }

    .dhakaflix-missing-art::before {
      position: absolute !important;
      top: -34px !important;
      right: -18px !important;
      content: attr(data-initial) !important;
      color: rgba(255,255,255,.075) !important;
      font: 900 180px/.9 Arial,sans-serif !important;
      pointer-events: none !important;
    }

    .dhakaflix-missing-art .dhakaflix-art-kicker {
      z-index: 1 !important;
      margin-bottom: 9px !important;
      color: #ffad93 !important;
      font: 700 10px/1 Arial,sans-serif !important;
      letter-spacing: .16em !important;
    }

    .dhakaflix-missing-art strong {
      z-index: 1 !important;
      display: -webkit-box !important;
      overflow: hidden !important;
      color: #fff !important;
      font: 700 18px/1.15 Arial,sans-serif !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: 4 !important;
    }

    .dhakaflix-missing-art small {
      z-index: 1 !important;
      margin-top: 7px !important;
      color: rgba(255,255,255,.62) !important;
      font: 600 12px/1.2 Arial,sans-serif !important;
    }

    #view.view-icons #items > .item.dhakaflix-poster-count-1 .dhakaflix-poster-collage {
      display: block !important;
    }

    #view.view-icons #items > .item.dhakaflix-poster-count-2 .dhakaflix-poster-collage {
      grid-template-rows: 1fr !important;
    }

    #view.view-icons #items > .item.dhakaflix-poster-count-3 .dhakaflix-poster-collage img:last-child {
      grid-column: 1 / -1 !important;
    }

    #view.view-icons #items > .item:hover {
      z-index: 2 !important;
      transform: translateY(-5px) !important;
      border-color: rgba(255,103,82,.72) !important;
      box-shadow: 0 18px 34px rgba(0,0,0,.34), 0 0 22px rgba(255,91,74,.12) !important;
    }

    #view.view-icons #items > .item > a {
      display: flex !important;
      flex: 0 0 auto !important;
      flex-direction: column !important;
      align-items: stretch !important;
      min-width: 0 !important;
      color: #f5f6fa !important;
      white-space: normal !important;
    }

    #view.view-icons #items > .item .icon.square {
      display: none !important;
    }

    #view.view-icons #items > .item .icon.landscape {
      position: relative !important;
      display: flex !important;
      flex: 0 0 228px !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      width: 100% !important;
      height: 228px !important;
      margin: 0 !important;
      overflow: hidden !important;
      background: radial-gradient(ellipse at 50% 35%,#343d4e,#181c25 72%) !important;
    }

    #view.view-icons #items > .item .icon.landscape img {
      position: static !important;
      top: auto !important;
      transform: none !important;
      width: 100% !important;
      height: 100% !important;
      max-width: 100% !important;
      max-height: 100% !important;
      object-fit: cover !important;
    }

    #view.view-icons #items > .item .label {
      display: block !important;
      flex: 0 0 auto !important;
      box-sizing: border-box !important;
      width: 100% !important;
      max-height: none !important;
      margin: 0 !important;
      padding: 10px 10px 4px !important;
      overflow: visible !important;
      color: #f5f6fa !important;
      font: 600 13px/1.35 Arial, sans-serif !important;
      text-align: left !important;
      text-overflow: clip !important;
      white-space: normal !important;
      overflow-wrap: anywhere !important;
      -webkit-box-orient: vertical !important;
      -webkit-line-clamp: unset !important;
    }

    #view.view-icons #items > .item .date,
    #view.view-icons #items > .item .size {
      display: none !important;
    }

    #view.view-icons #items > .item.dhakaflix-poster-file .icon.landscape img.dhakaflix-poster-thumb {
      width: 100% !important;
      height: 100% !important;
      object-fit: contain !important;
    }

    #view.view-icons #items > .item .dhakaflix-vlc-button {
      display: block !important;
      flex: 0 0 auto !important;
      align-self: stretch !important;
      margin: 8px 12px 0 !important;
      text-align: center !important;
    }

    #view.view-icons #items > .item .dhakaflix-trailer-button {
      display: block !important;
      flex: 0 0 auto !important;
      align-self: stretch !important;
      margin: 8px 12px 0 !important;
    }

    .dhakaflix-vlc-button,
    .dhakaflix-trailer-button {
      display: inline-block !important;
      padding: 7px 10px !important;
      border: 0 !important;
      border-radius: 7px !important;
      color: white !important;
      font: 600 12px Arial, sans-serif !important;
      line-height: 1.35 !important;
      white-space: nowrap !important;
      cursor: pointer !important;
      vertical-align: middle !important;
      transition: filter .15s ease, transform .15s ease !important;
    }

    .dhakaflix-vlc-button {
      background: linear-gradient(135deg,#14775e,#199579) !important;
    }

    .dhakaflix-trailer-button {
      background: linear-gradient(135deg,#ff624f,#f04461) !important;
    }

    .dhakaflix-vlc-button:hover,
    .dhakaflix-trailer-button:hover {
      filter: brightness(1.12) !important;
      transform: translateY(-1px) !important;
    }

    .dhakaflix-vlc-button:disabled {
      opacity: .72 !important;
      cursor: wait !important;
    }

    #fallback table {
      display: block !important;
      width: 100% !important;
    }

    #fallback table tbody {
      display: grid !important;
      grid-template-columns: repeat(auto-fill, minmax(150px, 178px)) !important;
      gap: 14px !important;
      padding: 18px !important;
    }

    #fallback tr {
      display: flex !important;
      flex-direction: column !important;
      box-sizing: border-box !important;
      min-height: 0 !important;
      padding: 0 0 10px !important;
      border: 1px solid rgba(255,255,255,.11) !important;
      border-radius: 16px !important;
      background: linear-gradient(165deg,#242a36,#1b202a 72%) !important;
      color: #f5f6fa !important;
    }

    #fallback tr:first-child,
    #fallback td.fb-d,
    #fallback td.fb-s {
      display: none !important;
    }

    #fallback td.fb-i {
      position: relative !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 228px !important;
      padding: 0 !important;
    }

    #fallback td.fb-i img {
      max-width: 100% !important;
      max-height: 228px !important;
      object-fit: cover !important;
    }

    #fallback td.fb-i img.dhakaflix-poster-thumb {
      width: 100% !important;
      height: 228px !important;
      max-height: 228px !important;
      object-fit: cover !important;
    }

    #fallback td.fb-n {
      display: block !important;
      width: 100% !important;
      padding-top: 10px !important;
      color: #f5f6fa !important;
      padding: 0 10px 0 !important;
      text-align: left !important;
      overflow-wrap: anywhere !important;
    }

    @media (max-width: 760px) {
      #view.view-icons { margin: 8px !important; padding: 12px !important; }
      #view.view-icons #items { grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)) !important; gap: 10px !important; }
      #view.view-icons #items > .item .icon.landscape { flex-basis: 218px !important; height: 218px !important; }
    }
  `;
  document.head.appendChild(style);

  function getFileName(link) {
    const href = link.getAttribute("href") || "";
    const lastPart = href.split("/").pop() || "";

    try {
      return decodeURIComponent(lastPart);
    } catch {
      return lastPart;
    }
  }

  function getMovieTitle(link) {
    const fileName = getFileName(link)
      .replace(/\.(?:mkv|mp4|avi|mov|wmv|m4v|webm)$/i, "")
      .replace(/\[[^\]]*\]/g, " ")
      .trim();

    // Use the last year in the filename as the release year.
    // Everything after it is usually video/audio/subtitle information.
    const years = [...fileName.matchAll(/\b(?:19|20)\d{2}\b/g)];

    if (years.length > 0) {
      const yearMatch = years[years.length - 1];
      const title = fileName
        .slice(0, yearMatch.index)
        .replace(/[._()[\]-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      return `${title} ${yearMatch[0]}`.trim();
    }

    // If no year is present, remove common release tags.
    return fileName
      .replace(
        /\b(?:480p|720p|1080p|2160p|4k|10bit|8bit|bluray|blu-ray|brrip|bdrip|webrip|web-dl|webdl|hdtv|dvdrip|x264|x265|h264|h265|hevc|yify|amzn|nf|aac|dts|msubs|tigole|galaxyrg)\b.*$/i,
        ""
      )
      .replace(/[._()[\]-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function setPosterImage(image, imageUrl) {
    const targetUrl = new URL(imageUrl, document.baseURI).href;
    image.decoding = "async";
    image.loading = "lazy";
    if (image.src === targetUrl) {
      if (image.complete) {
        image.classList.remove("dhakaflix-poster-loading");
        image.classList.add("dhakaflix-poster-loaded");
        return Promise.resolve();
      }
      return new Promise(resolve => {
        image.addEventListener("load", resolve, { once: true });
        image.addEventListener("error", resolve, { once: true });
      });
    }

    const originalSrc = image.dataset.dhakaflixOriginalSrc || image.getAttribute("src") || "";
    image.dataset.dhakaflixOriginalSrc = originalSrc;
    image.classList.remove("dhakaflix-poster-loaded");
    image.classList.add("dhakaflix-poster-loading");

    return new Promise(resolve => {
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        image.classList.remove("dhakaflix-poster-loading");
        image.classList.add("dhakaflix-poster-loaded");
        resolve();
      };
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", () => {
        if (originalSrc && image.src !== originalSrc) image.src = originalSrc;
        else if (!originalSrc) image.remove();
        finish();
      }, { once: true });
      image.src = targetUrl;
      if (image.complete && image.naturalWidth > 0) requestAnimationFrame(finish);
    });
  }

  function showPosterOnImageRow(row, imageUrl, imageName) {
    row.classList.add("dhakaflix-poster-file");

    const icons = row.querySelectorAll(
      ".icon img, .fb-i img, td:first-child img"
    );

    for (const icon of icons) {
      setPosterImage(icon, imageUrl);
      icon.alt = imageName;
      icon.title = imageName;
      icon.classList.add("dhakaflix-poster-thumb", "thumb");
    }
  }

  function normalizePosterName(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/\b(?:19|20)\d{2}\b/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function applyPosterToMovieRow(movieRow, poster) {
    const imageElements = movieRow.querySelectorAll(
      ".icon.landscape img, .icon img, .fb-i img, td:first-child img"
    );
    for (const image of imageElements) {
      setPosterImage(image, poster.url);
      image.alt = poster.name;
      image.title = poster.name;
      image.classList.add("dhakaflix-poster-thumb", "thumb");
    }
    movieRow.classList.add("dhakaflix-has-poster");
    poster.row?.classList.add("dhakaflix-poster-used");
  }

  function queueMoviePosterFallback(movie) {
    const { row, link } = movie;
    if (row.classList.contains("dhakaflix-poster-lookup-observed") ||
        row.classList.contains("dhakaflix-has-poster") ||
        location.hostname === "172.16.50.8") return;
    const fileName = getFileName(link);
    if (/\bS\d{1,2}\s*E\d{1,2}\b|\bSeason\s*\d+\b/i.test(fileName)) return;
    const query = getMovieTitle(link);
    if (!/\b(?:19|20)\d{2}\b/.test(query)) return;
    row.classList.add("dhakaflix-poster-lookup-observed");
    moviePosterLookupObserver.observe(row);
  }

  function applyMoviePosters(rows, findLink) {
    const movies = [];
    const posters = [];

    for (const row of rows) {
      const link = findLink(row);
      if (!link) continue;
      const href = link.getAttribute("href") || "";
      if (movieFile.test(href)) movies.push({ row, link });
      else if (imageFile.test(href)) {
        posters.push({
          row,
          name: getFileName(link),
          url: new URL(href, location.href).href
        });
      }
    }

    if (!movies.length) return;
    const used = new Set();
    const movieKeys = movies.map(movie => normalizePosterName(getMovieTitle(movie.link)));

    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      if (movie.row.classList.contains("dhakaflix-has-poster")) continue;
      const movieKey = movieKeys[i];
      let poster = posters.find(candidate => {
        if (used.has(candidate)) return false;
        const posterKey = normalizePosterName(candidate.name);
        return posterKey.length >= 5 && movieKey.length >= 5 &&
          (posterKey === movieKey || posterKey.includes(movieKey) || movieKey.includes(posterKey));
      });

      // Many folders have one movie and a generically named image such as a_AL_.jpg.
      if (!poster && movies.length === 1) {
        const available = posters.filter(candidate => !used.has(candidate));
        if (available.length === 1) poster = available[0];
        else if (available.length > 1) {
          poster = available.find(candidate => {
            const image = candidate.row.querySelector(".icon img, .fb-i img, td:first-child img");
            return image?.naturalWidth > 0 && image?.naturalHeight > 0 &&
              image.naturalWidth / image.naturalHeight < 0.82;
          }) || available[0];
        }
      }

      // Reuse one poster for multiple encodes of the same movie.
      if (!poster && posters.length === 1 && movies.every(keyed =>
        normalizePosterName(getMovieTitle(keyed.link)) === movieKey
      )) poster = posters[0];

      if (poster) {
        applyPosterToMovieRow(movie.row, poster);
        used.add(poster);
      } else queueMoviePosterFallback(movie);
    }
  }

  // Movie folders contain their poster one level below the current listing.
  // Read each folder's h5ai HTML and use its first suitable image as the card art.
  const folderPosterCache = new Map();
  const savedPosterCache = new Map();
  const posterCacheStorageKey = "dhakaflixPosterCacheV1";
  const posterCacheTtl = 30 * 24 * 60 * 60 * 1000;
  const maxSavedPosterEntries = 400;
  let posterCacheSaveTimer = 0;
  const posterCacheReady = new Promise(resolve => {
    try {
      chrome.storage.local.get(posterCacheStorageKey, result => {
        if (chrome.runtime.lastError) return resolve();
        const stored = result?.[posterCacheStorageKey] || {};
        const now = Date.now();
        for (const [url, entry] of Object.entries(stored)) {
          if (entry?.savedAt && now - entry.savedAt < posterCacheTtl && Array.isArray(entry.posters)) {
            savedPosterCache.set(url, entry);
          }
        }
        resolve();
      });
    } catch {
      resolve();
    }
  });

  function schedulePosterCacheSave() {
    window.clearTimeout(posterCacheSaveTimer);
    posterCacheSaveTimer = window.setTimeout(() => {
      const serialized = Object.fromEntries(savedPosterCache);
      try {
        chrome.storage.local.set({ [posterCacheStorageKey]: serialized });
      } catch {
        // The in-memory cache still serves the current page if storage is unavailable.
      }
    }, 350);
  }

  function rememberFolderPosters(folderUrl, posters) {
    if (!posters?.length) return;
    savedPosterCache.delete(folderUrl);
    savedPosterCache.set(folderUrl, { posters, savedAt: Date.now() });
    while (savedPosterCache.size > maxSavedPosterEntries) {
      savedPosterCache.delete(savedPosterCache.keys().next().value);
    }
    schedulePosterCacheSave();
  }

  const onlinePosterLookups = new Map();
  function findOnlinePoster(search) {
    if (!search?.query) return Promise.resolve("");
    const cacheKey = `tmdb-poster:${search.mediaType}:${normalizePosterName(search.query)}`;
    if (onlinePosterLookups.has(cacheKey)) return onlinePosterLookups.get(cacheKey);

    const lookup = posterCacheReady.then(() => {
      const cached = savedPosterCache.get(cacheKey);
      if (cached && Date.now() - cached.savedAt < posterCacheTtl) return cached.posters[0] || "";

      return new Promise(resolve => {
        try {
          chrome.runtime.sendMessage(
            { type: "GET_POSTER", query: search.query, mediaType: search.mediaType },
            response => {
              const url = !chrome.runtime.lastError && response?.ok ? response.url : "";
              if (url) rememberFolderPosters(cacheKey, [url]);
              resolve(url);
            }
          );
        } catch {
          resolve("");
        }
      });
    });
    onlinePosterLookups.set(cacheKey, lookup);
    return lookup;
  }

  const moviePosterLookupObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const row = entry.target;
      moviePosterLookupObserver.unobserve(row);
      const link = row.querySelector("a[href]");
      if (!link) continue;
      row.classList.add("dhakaflix-folder-poster-pending");
      const title = getMovieTitle(link);
      findOnlinePoster({ query: title, mediaType: "movie" }).then(url => {
        if (!row.isConnected) return;
        if (url) applyPosterToMovieRow(row, { url, name: title });
        else showMissingPosterPlaceholder(row, link, title);
      }).finally(() => row.classList.remove("dhakaflix-folder-poster-pending"));
    }
  }, { rootMargin: "64px 0px" });

  const folderPosterQueue = [];
  let activeFolderPosterFetches = 0;
  // Keep artwork lookups deliberately gentle; these are older file-server
  // directory pages and many year cards can be visible at once.
  const maxFolderPosterFetches = 2;
  const folderPosterObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const row = entry.target;
      folderPosterObserver.unobserve(row);
      row.classList.add("dhakaflix-folder-poster-pending");
      const link = row.querySelector("a[href], td.fb-n a[href]");
      if (!link) continue;
      const folderUrl = new URL(link.getAttribute("href"), location.href).href;
      const posterSearch = getFolderPosterSearch(row, link);
      fetchFolderPosters(folderUrl, posterSearch).then(posterUrls => {
        if (!row.isConnected) return;
        if (!posterUrls?.length) {
          row.classList.add("dhakaflix-poster-unavailable");
          showMissingPosterPlaceholder(row, link);
          row.classList.remove("dhakaflix-folder-poster-pending");
          return;
        }
        const imageLoads = [];
        const landscape = row.querySelector(".icon.landscape");
        if (landscape) {
          landscape.classList.add("dhakaflix-art-host");
          landscape.querySelectorAll(":scope > img").forEach(image =>
            image.classList.add("dhakaflix-folder-icon-hidden")
          );
          landscape.querySelector(".dhakaflix-poster-collage")?.remove();
          const collage = document.createElement("span");
          collage.className = "dhakaflix-poster-collage";
          for (const posterUrl of posterUrls.slice(0, 4)) {
            const image = document.createElement("img");
            imageLoads.push(setPosterImage(image, posterUrl));
            image.alt = getFileName(link);
            image.loading = "lazy";
            collage.appendChild(image);
          }
          landscape.appendChild(collage);
          row.classList.add(`dhakaflix-poster-count-${Math.min(posterUrls.length, 4)}`);
        } else {
          const images = row.querySelectorAll(".fb-i img, td:first-child img");
          for (const image of images) {
            imageLoads.push(setPosterImage(image, posterUrls[0]));
            image.alt = getFileName(link);
            image.classList.add("dhakaflix-poster-thumb", "thumb");
          }
        }
        row.classList.add("dhakaflix-has-poster", "dhakaflix-folder-card");
        Promise.all(imageLoads).finally(() => row.classList.remove("dhakaflix-folder-poster-pending"));
      }).catch(() => row.classList.remove("dhakaflix-folder-poster-pending"));
    }
  }, { rootMargin: "64px 0px" });

  async function readFolderListing(folderUrl) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 7000);
    try {
      const response = await fetch(folderUrl, {
        credentials: "same-origin",
        signal: controller.signal
      });
      if (!response.ok) return null;
      const html = await response.text();
      return new DOMParser().parseFromString(html, "text/html");
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  function directPosterUrls(listing, folderUrl) {
    if (!listing) return [];
    const links = [...listing.querySelectorAll("#fallback a[href], #items a[href]")];
    const images = links.filter(link => imageFile.test(link.getAttribute("href") || ""));
    images.sort((a, b) => {
      const rank = link => /poster|cover|folder|a_al/i.test(getFileName(link)) ? 0 :
        /sample|screen.?shot|backdrop/i.test(getFileName(link)) ? 2 : 1;
      return rank(a) - rank(b);
    });
    return images.length ? [new URL(images[0].getAttribute("href"), folderUrl).href] : [];
  }

  async function discoverFolderPosters(folderUrl) {
    const listing = await readFolderListing(folderUrl);
    if (!listing) return [];

    // A movie folder has its actual poster right beside the video file.
    const directPosters = directPosterUrls(listing, folderUrl);
    if (directPosters.length) return directPosters;

    // A year/collection folder has movie folders; use one poster from each
    // of the first four movie folders to make a representative collage.
    const childFolders = [...new Set([...listing.querySelectorAll("#fallback a[href], #items a[href]")]
      .filter(link => {
        const href = link.getAttribute("href") || "";
        return href.endsWith("/") && !/(?:^|\/)\.\.?\/$/.test(href);
      })
      .map(link => new URL(link.getAttribute("href"), folderUrl).href))]
      .slice(0, 2);
    const posters = await Promise.all(childFolders.map(async childUrl => {
      const childListing = await readFolderListing(childUrl);
      return directPosterUrls(childListing, childUrl)[0] || null;
    }));
    return posters.filter(Boolean);
  }

  function fetchFolderPosters(folderUrl, posterSearch = null) {
    if (folderPosterCache.has(folderUrl)) return folderPosterCache.get(folderUrl);

    const result = new Promise(resolve => {
      folderPosterQueue.push(async () => {
        try {
          await posterCacheReady;
          const saved = savedPosterCache.get(folderUrl);
          if (saved && Date.now() - saved.savedAt < posterCacheTtl) {
            savedPosterCache.delete(folderUrl);
            savedPosterCache.set(folderUrl, saved);
            resolve(saved.posters);
            return;
          }
          let posters = await discoverFolderPosters(folderUrl);
          if (!posters.length && posterSearch) {
            const onlinePoster = await findOnlinePoster(posterSearch);
            if (onlinePoster) posters = [onlinePoster];
          }
          rememberFolderPosters(folderUrl, posters);
          resolve(posters);
        } catch {
          resolve([]);
        }
      });
      runFolderPosterQueue();
    });
    folderPosterCache.set(folderUrl, result);
    return result;
  }

  function runFolderPosterQueue() {
    while (activeFolderPosterFetches < maxFolderPosterFetches && folderPosterQueue.length) {
      const task = folderPosterQueue.shift();
      activeFolderPosterFetches++;
      Promise.resolve(task()).finally(() => {
        activeFolderPosterFetches--;
        runFolderPosterQueue();
      });
    }
  }

  function applyFolderPosters(rows, findLink) {
    for (const row of rows) {
      const link = findLink(row);
      if (!link || row.classList.contains("dhakaflix-folder-poster-observed") || row.classList.contains("dhakaflix-has-poster")) continue;
      const href = link.getAttribute("href") || "";
      if (!href.endsWith("/") || /(?:^|\/)\.\.?\/$/.test(href)) continue;
      row.classList.add("dhakaflix-folder-poster-observed");
      folderPosterObserver.observe(row);
    }
  }
  function showMessageInTab(tab, message) {
    try {
      tab.document.title = "Trailer";
      tab.document.body.textContent = message;
      tab.document.body.style.cssText =
        "font:16px Arial,sans-serif;padding:32px;background:#111;color:#fff";
    } catch {
      // The tab might have been closed while the trailer was loading.
    }
  }

  function openTrailer(movieLink, mediaType = "movie", overrideTitle = "") {
    const title = overrideTitle || getMovieTitle(movieLink);
    if (!title) return;

    // Open the tab immediately from the button click so Chrome permits it.
    const playerTab = window.open("about:blank", "_blank");

    if (!playerTab) {
      alert("Chrome blocked the new tab. Allow pop-ups for DhakaFlix, then try again.");
      return;
    }

    showMessageInTab(playerTab, `Finding the trailer for ${title}…`);

    chrome.runtime.sendMessage(
      { type: "GET_TRAILER", query: title, mediaType },
      response => {
        if (chrome.runtime.lastError) {
          showMessageInTab(
            playerTab,
            "The extension could not look up the trailer. Reload it and try again."
          );
          return;
        }

        if (!response?.ok || !response.url) {
          showMessageInTab(
            playerTab,
            response?.error || "No trailer was found for this movie."
          );
          return;
        }

        try {
          playerTab.location.href = response.url;
        } catch {
          // Nothing to do if the tab was closed before navigation.
        }
      }
    );
  }

  function addVlcButton(row, movieLink, fallbackNameCell = null) {
    if (row.querySelector(".dhakaflix-vlc-button")) return;

    const label = row.querySelector(".label") || fallbackNameCell;
    if (!label) return;

    const movieUrl = new URL(movieLink.getAttribute("href"), location.href).href;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "dhakaflix-vlc-button";
    button.textContent = "▶ Open in VLC";
    button.title = "Stream this movie in VLC";

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      button.disabled = true;
      button.textContent = "Opening VLC…";
      chrome.runtime.sendMessage(
        { type: "OPEN_IN_VLC", url: movieUrl },
        response => {
          const failure = chrome.runtime.lastError?.message ||
            (!response?.ok ? response?.error : "");
          if (failure) {
            button.disabled = false;
            button.textContent = "▶ Open in VLC";
            alert("Could not open VLC: " + failure);
            return;
          }
          button.textContent = "Sent to VLC";
          window.setTimeout(() => {
            button.disabled = false;
            button.textContent = "▶ Open in VLC";
          }, 2500);
        }
      );
    });
    movieLink.insertAdjacentElement("afterend", button);
  }
  function addTrailerButton(row, movieLink, fallbackNameCell = null, mediaType = "movie", overrideTitle = "") {
    if (row.querySelector(".dhakaflix-trailer-button")) return;

    const label = row.querySelector(".label") || fallbackNameCell;
    if (!label) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "dhakaflix-trailer-button";
    button.textContent = "▶ Watch trailer";

    button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      openTrailer(movieLink, mediaType, overrideTitle);
    });

    // Keep the button outside the clamped movie-title text. Long release names
    // otherwise push it beyond the three visible title lines.
    if (row.matches("#items > .item")) row.appendChild(button);
    else label.appendChild(button);
  }

  function getTvSeriesTitle(label) {
    const text = String(label || "").replace(/\s+/g, " ").trim();
    const match = text.match(/^(.*?)\s*\((?:TV\s+)?(?:Mini\s+)?Series\s+(\d{4})/i);
    if (!match || !match[1].trim()) return "";
    return `${match[1].trim()} ${match[2]}`;
  }

  function getFolderPosterSearch(row, link) {
    const label = row.querySelector(".label")?.textContent || link.textContent || "";
    const tvTitle = getTvSeriesTitle(label);
    if (tvTitle) return { query: tvTitle, mediaType: "tv" };

    // Avoid treating game libraries as movie collections.
    if (location.hostname === "172.16.50.8") return null;
    const text = String(label).replace(/\s+/g, " ").trim();
    const match = text.match(/^(.*?)\s*[([]?((?:19|20)\d{2})[)\]]?(?:\s|$|[._-])/);
    const title = (match?.[1] || "").replace(/[._()[\]-]+/g, " ").replace(/\s+/g, " ").trim();
    if (!title || !match?.[2]) return null;
    return { query: `${title} ${match[2]}`, mediaType: "movie" };
  }

  function showMissingPosterPlaceholder(row, link, preferredTitle = "") {
    if (row.querySelector(".dhakaflix-missing-art")) return;
    const label = preferredTitle || row.querySelector(".label")?.textContent || link.textContent || "Movie";
    const year = label.match(/\b(?:19|20)\d{2}\b/)?.[0] || "Dhaka_Flex";
    const title = preferredTitle
      ? preferredTitle.replace(/\b(?:19|20)\d{2}\b/, "").trim()
      : getTvSeriesTitle(label)?.replace(/\s+(?:19|20)\d{2}$/, "") ||
      label.replace(/\s*\((?:(?:TV\s+)?(?:Mini\s+)?Series\s+)?(?:19|20)\d{2}[^)]*\)/i, "")
        .replace(/\b(?:480p|720p|1080p|2160p|4k|dual audio|multi audio)\b.*$/i, "")
        .trim() || "Movie";
    const placeholder = document.createElement("div");
    placeholder.className = "dhakaflix-missing-art";
    placeholder.dataset.initial = title.charAt(0).toUpperCase();
    const kicker = document.createElement("span");
    kicker.className = "dhakaflix-art-kicker";
    kicker.textContent = "DHAKA_FLEX • ARTWORK";
    const titleNode = document.createElement("strong");
    titleNode.textContent = title;
    const yearNode = document.createElement("small");
    yearNode.textContent = year;
    placeholder.append(kicker, titleNode, yearNode);

    const landscape = row.querySelector(".icon.landscape");
    if (landscape) {
      landscape.classList.add("dhakaflix-art-host");
      landscape.querySelectorAll(":scope > img").forEach(image =>
        image.classList.add("dhakaflix-folder-icon-hidden")
      );
      landscape.appendChild(placeholder);
    } else {
      const iconCell = row.querySelector("td.fb-i");
      if (iconCell) iconCell.replaceChildren(placeholder);
    }
    row.classList.add("dhakaflix-has-poster", "dhakaflix-folder-card", "dhakaflix-poster-placeholder");
  }

  function addTvSeriesTrailer(row, link, fallbackNameCell = null) {
    const href = link.getAttribute("href") || "";
    if (!href.endsWith("/") || /(?:^|\/)\.\.?\/$/.test(href)) return;
    const label = row.querySelector(".label") || fallbackNameCell;
    const title = getTvSeriesTitle(label?.textContent);
    if (title) addTrailerButton(row, link, fallbackNameCell, "tv", title);
  }

  function applyPosterGridView() {
    const view = document.querySelector("#view");
    if (!view) return;

    view.classList.remove("view-details", "view-grid");
    for (const name of [...view.classList]) {
      if (/^view-size-\d+$/.test(name) && name !== "view-size-150") view.classList.remove(name);
    }
    if (!view.classList.contains("view-icons")) view.classList.add("view-icons");
    if (!view.classList.contains("view-size-150")) view.classList.add("view-size-150");
  }

  function updateListing() {
    applyPosterGridView();
    // Replace image-file icons with the actual image.
    document.querySelectorAll("#items .item").forEach(row => {
      const link = row.querySelector("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      if (!imageFile.test(href)) return;

      const imageUrl = new URL(href, location.href).href;
      const imageName = getFileName(link) || "Movie poster";

      showPosterOnImageRow(row, imageUrl, imageName);
    });

    // Add VLC and trailer buttons beside movie filenames.
    document.querySelectorAll("#items .item").forEach(row => {
      const link = row.querySelector("a[href]");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      addTvSeriesTrailer(row, link);
      if (!movieFile.test(href)) return;

      addVlcButton(row, link);
      addTrailerButton(row, link);
    });

    // Basic HTML listing fallback.
    document.querySelectorAll("#fallback tr").forEach(row => {
      const link = row.querySelector("td.fb-n a[href]");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      addTvSeriesTrailer(row, link, row.querySelector("td.fb-n"));

      if (imageFile.test(href)) {
        const imageUrl = new URL(href, location.href).href;
        const imageName = getFileName(link) || "Movie poster";
        showPosterOnImageRow(row, imageUrl, imageName);
      }

      if (movieFile.test(href)) {
        addVlcButton(row, link, row.querySelector("td.fb-n"));
        addTrailerButton(row, link, row.querySelector("td.fb-n"));
      }
    });
    applyMoviePosters(
      [...document.querySelectorAll("#items > .item")],
      row => row.querySelector("a[href]")
    );

    applyMoviePosters(
      [...document.querySelectorAll("#fallback tr")],
      row => row.querySelector("td.fb-n a[href]")
    );

    applyFolderPosters(
      [...document.querySelectorAll("#items > .item")],
      row => row.querySelector("a[href]")
    );
    applyFolderPosters(
      [...document.querySelectorAll("#fallback tr")],
      row => row.querySelector("td.fb-n a[href]")
    );
  }

  updateListing();

  let listingUpdateScheduled = false;
  function scheduleListingUpdate() {
    if (listingUpdateScheduled) return;
    listingUpdateScheduled = true;
    window.setTimeout(() => {
      listingUpdateScheduled = false;
      updateListing();
    }, 120);
  }

  const observer = new MutationObserver(scheduleListingUpdate);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();












