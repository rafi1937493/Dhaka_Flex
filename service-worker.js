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
