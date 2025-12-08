const STATIC_CACHE = "alfido-static-v1";
const HTML_CACHE = "alfido-html-v1";

// files you want offline by default
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/blog.html",
  "/service.html",
  "/registration.html",
  "/offer.html",
  "/submission.html",
  "/certificate.html",
  "/internProfile.html",
  "/task.html",
  "/profile.html",
  "/editor.html",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/Logo 2.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== STATIC_CACHE && key !== HTML_CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

function isHtmlRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.headers.get("accept") || "").includes("text/html")
  );
}

self.addEventListener("fetch", event => {
  const req = event.request;

  // 1) HTML → Network-first (SEO + latest content)
  if (isHtmlRequest(req)) {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          const clone = networkRes.clone();
          caches.open(HTML_CACHE).then(cache => cache.put(req, clone));
          return networkRes;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match("/")))
    );
    return;
  }

  // 2) Static assets → Cache-first (fast UI)
  if (req.url.match(/\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2)(\?|$)/i)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(networkRes => {
          const clone = networkRes.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(req, clone));
          return networkRes;
        });
      })
    );
    return;
  }

  // 3) Baaki sab normal network
  event.respondWith(fetch(req));
});
