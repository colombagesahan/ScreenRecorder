// coi-serviceworker.js
// Enables crossOriginIsolated on static hosts by injecting COOP/COEP headers.
// Put this file next to index.html and deploy to GitHub Pages.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function addCOIHeaders(response) {
  // For opaque responses (type "opaque"), we can't read/modify headers.
  // Those would be blocked by COEP anyway unless properly CORS-enabled.
  if (!response || response.type === "opaque") return response;

  const newHeaders = new Headers(response.headers);
  newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
  newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");

  // Not strictly required, but helps some resources.
  // newHeaders.set("Cross-Origin-Resource-Policy", "cross-origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  event.respondWith((async () => {
    try {
      const res = await fetch(req);
      return addCOIHeaders(res);
    } catch (e) {
      return new Response("Network error in service worker", { status: 502 });
    }
  })());
});
