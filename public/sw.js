const CACHE = "ft-v1";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["/"])));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) =>
        Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.pathname.startsWith("/api/") || url.hostname !== location.hostname) {
    e.respondWith(
      fetch(e.request).catch(
        () =>
          new Response('{"error":"offline"}', {
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok) {
          const c = r.clone();
          caches.open(CACHE).then((ca) => ca.put(e.request, c));
        }
        return r;
      })
      .catch(() => caches.match(e.request)),
  );
});
