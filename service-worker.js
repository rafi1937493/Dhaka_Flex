async function getJson(url, serviceName) {
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("TMDb did not accept your API key. Check it in the extension settings.");
    }

    throw new Error(`${serviceName} returned an error (${response.status}).`);
  }

  return response.json();
}

function normalizeTitle(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const dhakaFlixMovieRoots = [
  { label: "English Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/English%20Movies/" },
  { label: "English Movies 1080p", url: "http://172.16.50.14/DHAKA-FLIX-14/English%20Movies%20%281080p%29/" },
  { label: "Hindi Movies", url: "http://172.16.50.14/DHAKA-FLIX-14/Hindi%20Movies/" },
  { label: "South Indian Movies", url: "http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/South%20Movies/" },
  { label: "South Movies Hindi Dubbed", url: "http://172.16.50.14/DHAKA-FLIX-14/SOUTH%20INDIAN%20MOVIES/Hindi%20Dubbed/" },
  { label: "Kolkata Bangla Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/Kolkata%20Bangla%20Movies/" },
  { label: "Animation Movies", url: "http://172.16.50.14/DHAKA-FLIX-14/Animation%20Movies/" },
  { label: "Animation Movies 1080p", url: "http://172.16.50.14/DHAKA-FLIX-14/Animation%20Movies%20%281080p%29/" },
  { label: "Foreign Language Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/Foreign%20Language%20Movies/" },
  { label: "IMDb Top 250", url: "http://172.16.50.14/DHAKA-FLIX-14/IMDb%20Top-250%20Movies/" },
  { label: "3D Movies", url: "http://172.16.50.7/DHAKA-FLIX-7/3D%20Movies/" }
];
const dhakaListingCache = new Map();
const dhakaListingCacheTtl = 3 * 60 * 1000;
const dhakaAllowedHosts = new Set([
  "172.16.50.7", "172.16.50.8", "172.16.50.10", "172.16.50.12", "172.16.50.14"
]);
const dhakaVideoFile = /\.(?:mkv|mp4|avi|mov|wmv|m4v|webm)(?:[?#].*)?$/i;

function decodeListingText(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
}

async function readDhakaListing(url) {
  const parsedUrl = new URL(url);
  if (parsedUrl.protocol !== "http:" || (parsedUrl.port && parsedUrl.port !== "80") || !dhakaAllowedHosts.has(parsedUrl.hostname)) return [];

  const cached = dhakaListingCache.get(parsedUrl.href);
  if (cached && Date.now() - cached.savedAt < dhakaListingCacheTtl) return cached.links;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(parsedUrl.href, { signal: controller.signal, credentials: "omit" });
    if (!response.ok) return [];
    const html = await response.text();
    const links = [];
    const anchorPattern = /<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
    for (const match of html.matchAll(anchorPattern)) {
      const href = match[2].replace(/&amp;/gi, "&").trim();
      if (!href || href.startsWith("#") || /^(?:javascript:|mailto:)/i.test(href)) continue;
      const target = new URL(href, parsedUrl);
      if (!dhakaAllowedHosts.has(target.hostname) || target.protocol !== "http:" || (target.port && target.port !== "80")) continue;
      let pathName = target.pathname.split("/").filter(Boolean).at(-1) || "";
      try { pathName = decodeURIComponent(pathName); } catch { /* Keep the encoded path segment. */ }
      const name = decodeListingText(match[3]) || pathName;
      links.push({ name, url: target.href, isFolder: target.pathname.endsWith("/") });
    }
    dhakaListingCache.set(parsedUrl.href, { links, savedAt: Date.now() });
    return links;
  } catch {
    return [];
  } finally {
    clearTimeout(timeoutId);
  }
}

function folderContainsYear(name, year) {
  const years = [...String(name).matchAll(/(?:19|20)\d{2}/g)].map(match => Number(match[0]));
  if (years.includes(year)) return true;
  if (years.length === 1 && /\b(?:before|earlier)\b/i.test(name) && year <= years[0]) return true;
  return years.length >= 2 && year >= Math.min(...years) && year <= Math.max(...years);
}

function matchesMovieFolder(name, title, year) {
  const titleKey = normalizeTitle(title);
  if (!titleKey || !folderContainsYear(name, year)) return false;
  const nameWithoutYear = String(name).replace(new RegExp(String(year), "g"), " ");
  const nameKey = normalizeTitle(nameWithoutYear);
  if (nameKey === titleKey) return true;
  if (nameKey.startsWith(titleKey)) {
    const suffix = nameKey.slice(titleKey.length);
    if (/^(?:480p|576p|720p|1080p|2160p|4k|uhd|bluray|brrip|bdrip|webrip|webdl|hdtv|x26[45]|h26[45]|ddp?|aac|proper|repack|extended|unrated|directorscut|dualaudio|multiaudio|remastered|hdr|10bit)/.test(suffix)) return true;
  }
  const escapedTitle = String(title).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escapedTitle}(?:\\b|[\\s._-])`, "i").test(nameWithoutYear.trim());
}

async function mapWithLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

async function findDhakaFlixMovieFiles(title, yearValue) {
  const titleText = String(title || "").trim();
  const year = Number(yearValue);
  if (!titleText || !Number.isInteger(year) || year < 1900 || year > 2100) {
    throw new Error("I need the movie title and release year to search DhakaFlix.");
  }

  const rootResults = await mapWithLimit(dhakaFlixMovieRoots, 4, async root => {
    const folders = await readDhakaListing(root.url);
    const yearFolders = folders.filter(item => item.isFolder && folderContainsYear(item.name, year));
    return { root, yearFolders };
  });
  const yearBranches = rootResults.flatMap(item =>
    item.yearFolders.map(folder => ({ root: item.root, folder }))
  );

  const matchingFolders = [];
  await mapWithLimit(yearBranches, 4, async branch => {
    const entries = await readDhakaListing(branch.folder.url);
    for (const entry of entries) {
      if (entry.isFolder && matchesMovieFolder(entry.name, titleText, year)) {
        matchingFolders.push({ root: branch.root, folder: entry });
      } else if (!entry.isFolder && dhakaVideoFile.test(entry.url) && matchesMovieFolder(entry.name, titleText, year)) {
        matchingFolders.push({ root: branch.root, file: entry });
      }
    }
  });

  const foundFiles = [];
  await mapWithLimit(matchingFolders, 4, async match => {
    const files = match.file ? [match.file] : await readDhakaListing(match.folder.url);
    for (const file of files) {
      if (!file.isFolder && dhakaVideoFile.test(file.url)) {
        foundFiles.push({ name: file.name, url: file.url, collection: match.root.label });
      }
    }
  });

  const unique = new Map();
  for (const file of foundFiles) unique.set(file.url, file);
  return [...unique.values()].slice(0, 20);
}

async function findTrailer(query, mediaType = "movie") {
  const { tmdbApiKey } = await chrome.storage.local.get("tmdbApiKey");

  if (!tmdbApiKey) {
    throw new Error("Add your TMDb API Key in the extension settings first.");
  }

  const title = String(query || "").trim();
  if (!title) {
    throw new Error("The title is missing.");
  }

  const isTv = mediaType === "tv";

  const yearMatch = title.match(/\b(?:19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : "";
  const searchTitle = title.replace(/\b(?:19|20)\d{2}\b/, "").trim();

  const searchUrl = new URL(`https://api.themoviedb.org/3/search/${isTv ? "tv" : "movie"}`);
  searchUrl.searchParams.set("api_key", tmdbApiKey);
  searchUrl.searchParams.set("query", searchTitle || title);
  searchUrl.searchParams.set("language", "en-US");

  if (year) {
    searchUrl.searchParams.set(isTv ? "first_air_date_year" : "year", year);
  }

  const searchData = await getJson(searchUrl, `TMDb ${isTv ? "TV" : "movie"} search`);
  const searchResults = searchData.results || [];

  if (!searchResults.length) {
    throw new Error(`TMDb could not find “${title}”.`);
  }

  const candidates = year
    ? searchResults.filter(item =>
        (isTv ? (item.first_air_date || "") : (item.release_date || "")).startsWith(year)
      )
    : searchResults;

  const pool = candidates.length ? candidates : searchResults;
  const wantedTitle = normalizeTitle(searchTitle || title);

  const movie =
    pool.find(item =>
      normalizeTitle(isTv ? item.name : item.title) === wantedTitle ||
      normalizeTitle(isTv ? item.original_name : item.original_title) === wantedTitle
    ) || pool[0];

  const videosUrl = new URL(
    `https://api.themoviedb.org/3/${isTv ? "tv" : "movie"}/${movie.id}/videos`
  );
  videosUrl.searchParams.set("api_key", tmdbApiKey);
  videosUrl.searchParams.set("language", "en-US");

  const videosData = await getJson(videosUrl, "TMDb trailer lookup");
  const youtubeVideos = (videosData.results || []).filter(video =>
    video.site === "YouTube" && video.key
  );

  const trailers = youtubeVideos.filter(video =>
    /trailer/i.test(video.type || "")
  );
  const teasers = youtubeVideos.filter(video =>
    /teaser/i.test(video.type || "")
  );

  const choices = trailers.length ? trailers : teasers;

  if (!choices.length) {
    throw new Error(`TMDb has no YouTube trailer listed for “${title}”.`);
  }

  choices.sort((a, b) => {
    const officialDifference =
      Number(Boolean(b.official)) - Number(Boolean(a.official));
    if (officialDifference) return officialDifference;

    const englishDifference =
      Number((b.iso_639_1 || "") === "en") -
      Number((a.iso_639_1 || "") === "en");
    if (englishDifference) return englishDifference;

    return (b.size || 0) - (a.size || 0);
  });

  const videoKey = encodeURIComponent(choices[0].key);

  return `https://www.youtube.com/watch?v=${videoKey}&autoplay=1&mute=1`;
}

async function findPoster(query, mediaType = "movie") {
  const { tmdbApiKey } = await chrome.storage.local.get("tmdbApiKey");
  if (!tmdbApiKey) throw new Error("TMDb API key is not set.");

  const title = String(query || "").trim();
  if (!title) throw new Error("The title is missing.");

  const isTv = mediaType === "tv";
  const yearMatch = title.match(/\b(?:19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : "";
  const searchTitle = title.replace(/\b(?:19|20)\d{2}\b/, "").trim();
  const searchUrl = new URL(`https://api.themoviedb.org/3/search/${isTv ? "tv" : "movie"}`);
  searchUrl.searchParams.set("api_key", tmdbApiKey);
  searchUrl.searchParams.set("query", searchTitle || title);
  searchUrl.searchParams.set("language", "en-US");
  if (year) searchUrl.searchParams.set(isTv ? "first_air_date_year" : "year", year);

  const searchData = await getJson(searchUrl, `TMDb ${isTv ? "TV" : "movie"} poster search`);
  const results = searchData.results || [];
  if (!results.length) throw new Error(`TMDb could not find “${title}”.`);

  const candidates = year
    ? results.filter(item =>
        (isTv ? (item.first_air_date || "") : (item.release_date || "")).startsWith(year)
      )
    : results;
  const pool = candidates.length ? candidates : results;
  const wantedTitle = normalizeTitle(searchTitle || title);
  const match = pool.find(item =>
    normalizeTitle(isTv ? item.name : item.title) === wantedTitle ||
    normalizeTitle(isTv ? item.original_name : item.original_title) === wantedTitle
  ) || pool[0];

  if (!match.poster_path) {
    const withPoster = pool.find(item => item.poster_path);
    if (!withPoster) throw new Error(`TMDb has no poster for “${title}”.`);
    return `https://image.tmdb.org/t/p/w500${withPoster.poster_path}`;
  }

  return `https://image.tmdb.org/t/p/w500${match.poster_path}`;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "FIND_DHAKAFLIX_MOVIE") {
    findDhakaFlixMovieFiles(message.title, message.year)
      .then(files => sendResponse({ ok: true, files }))
      .catch(error => sendResponse({ ok: false, error: error.message || "DhakaFlix search failed." }));
    return true;
  }
  if (message?.type === "OPEN_IN_VLC") {
    chrome.runtime.sendNativeMessage(
      "com.dhakaflix.vlc",
      { url: message.url },
      response => {
        const error = chrome.runtime.lastError;
        if (error) sendResponse({ ok: false, error: error.message });
        else sendResponse(response || { ok: false, error: "VLC helper returned no response." });
      }
    );
    return true;
  }
  if (message?.type === "GET_POSTER") {
    findPoster(message.query, message.mediaType)
      .then(url => sendResponse({ ok: true, url }))
      .catch(error => sendResponse({ ok: false, error: error.message || "No poster found." }));
    return true;
  }
  if (message?.type !== "GET_TRAILER") return;

  findTrailer(message.query, message.mediaType)
    .then(url => sendResponse({ ok: true, url }))
    .catch(error => {
      sendResponse({
        ok: false,
        error: error.message || "Could not find a trailer."
      });
    });

  return true;
});
