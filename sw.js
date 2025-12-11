// patched sw.js - safe caching, avoids caching unsupported schemes
const STATIC_CACHE = "alfido-static-v2";
const HTML_CACHE = "alfido-html-v2";

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

/**
 * Safe cache.put wrapper:
 * - Skips non-http(s) schemes like chrome-extension:, data:, about:, file:
 * - Skips responses that are not valid (status >= 200 && < 400)
 * - Catches any error and logs a warning (won't break SW)
 */
async function safeCachePut(cache, request, response) {
  try {
    // only cache http(s) requests
    if (!/^https?:\/\//i.test(request.url)) {
      return;
    }
    if (!response) return;
    // allow caching for successful-ish responses
    const status = response.status || 0;
    if (status < 200 || status >= 400) {
      // could still cache opaque if you want, but safer to skip
      return;
    }
    // clone before put
    await cache.put(request, response.clone());
  } catch (err) {
    // do not throw - log and continue
    console.warn("safeCachePut failed for", request && request.url, err && err.message);
  }
}

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS))
      .catch(err => {
        console.warn("SW install: cache.addAll failed", err && err.message);
      })
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
    event.respondWith((async () => {
      try {
        const networkRes = await fetch(req);
        // clone & safe cache
        try {
          const clone = networkRes.clone();
          const cache = await caches.open(HTML_CACHE);
          await safeCachePut(cache, req, clone);
        } catch (e) {
          // ignore cache errors
          console.warn("HTML caching failed", e && e.message);
        }
        return networkRes;
      } catch (err) {
        // network failed — try cache
        try {
          const cached = await caches.match(req);
          if (cached) return cached;
          const fallback = await caches.match("/");
          return fallback;
        } catch (e) {
          return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
        }
      }
    })());
    return;
  }

  // 2) Static assets → Cache-first (fast UI)
  if (req.url.match(/\.(css|js|png|jpg|jpeg|webp|svg|ico|woff2)(\?|$)/i)) {
    event.respondWith((async () => {
      try {
        const cached = await caches.match(req);
        if (cached) return cached;
        const networkRes = await fetch(req);
        try {
          const clone = networkRes.clone();
          const cache = await caches.open(STATIC_CACHE);
          await safeCachePut(cache, req, clone);
        } catch (e) {
          console.warn("Static asset caching failed", e && e.message);
        }
        return networkRes;
      } catch (err) {
        // fetch failed -> try cache
        const fallback = await caches.match(req);
        if (fallback) return fallback;
        return fetch(req).catch(() => new Response(null, { status: 504 }));
      }
    })());
    return;
  }

  // 3) Other requests -> just try network, but fallback to cache if available
  event.respondWith((async () => {
    try {
      return await fetch(req);
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      return new Response(null, { status: 504, statusText: "Gateway Timeout" });
    }
  })());
});
