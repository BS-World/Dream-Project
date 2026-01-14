const CACHE_NAME = "alfido-tech-v1";
const OFFLINE_URL = "/offline.html";

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/img/logo.webp",
  "/img/favicon/favicon-32x32.webp",
  "/img/favicon/android-icon-192x192.webp",
  OFFLINE_URL
];

/* ================= INSTALL ================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", event => {
  const req = event.request;

  /* ❌ Ignore non-GET requests */
  if (req.method !== "GET") return;

  /* ❌ Ignore chrome / browser extension requests */
  if (
    req.url.startsWith("chrome-extension://") ||
    req.url.startsWith("moz-extension://") ||
    req.url.startsWith("edge-extension://")
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then(response => {
        /* ❌ Do not cache opaque or invalid responses */
        if (!response || response.status !== 200 || response.type === "opaque") {
          return response;
        }

        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, clone);
        });

        return response;
      })
      .catch(() => {
        return caches.match(req).then(res => res || caches.match(OFFLINE_URL));
      })
  );
});
/* ================= SYNC ================= */