DHAKA_FLEX — PERSONAL CHROME EXTENSION

What it does
- Adds poster-grid browsing to DhakaFlix pages on 172.16.50.7, 172.16.50.8, 172.16.50.10, 172.16.50.12, and 172.16.50.14.
- Adds trailer and DhakaFlix collection-search buttons to Trakt movie detail and discovery pages on app.trakt.tv.
- Searches TMDb online for movie titles and poster images.
- Searches the DhakaFlix movie folders by title and year when you choose Open in VLC on Trakt.
- Watch trailer looks up movie and TV series trailers.
- Saves your TMDb API Key in this Chrome profile only. Other PCs and users do not get your key.
- Does not download or save poster files.

Install in Chrome (one-time)
1. Keep this extension folder somewhere permanent on your PC. Do not delete or move it after loading it in Chrome.
2. In Chrome, open chrome://extensions
3. Turn on Developer mode (top-right).
4. Click Load unpacked.
5. Select this folder: dhakaflix-movie-finder-extension (the folder containing manifest.json).
6. Pin the extension if you want quick access to its settings.
7. Click the extension icon and paste your TMDb API Key (v3 auth). Click Save key on this PC.
8. Open or refresh a DhakaFlix page, including Games at http://172.16.50.8/, TV at http://172.16.50.12/, or other TV sections hosted at http://172.16.50.10/.

Privacy
- The TMDb API key is kept in Chrome local extension storage on this PC.
- Searches send the movie title to TMDb and to the DhakaFlix h5ai endpoints listed in service-worker.js.
- No password or TMDb account login is requested by this extension.

TMDb attribution
This product uses the TMDb API but is not endorsed or certified by TMDb.
TMDb poster images are displayed from TMDb's image CDN.

VLC one-click streaming
-----------------------
- Windows registered the private dhakaflix-vlc:// link handler for this PC.
- The extension shows an "Open in VLC" button beside movie files in DhakaFlix and can search the DhakaFlix movie folders from Trakt.
- First click: Chrome may ask to open VLC; choose Open VLC.
- The helper only accepts HTTP links from 172.16.50.7, 172.16.50.8, 172.16.50.10, 172.16.50.12, or 172.16.50.14 and passes that link to VLC.
- Movies stream over the network; they are not downloaded by this feature.
- After changing extension files, click Reload on chrome://extensions and refresh the DhakaFlix page.
- On Trakt, reload the extension and refresh app.trakt.tv. Chrome may ask you to allow the extension on Trakt after this update.

