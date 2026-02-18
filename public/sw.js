self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open("selfcare-v1").then((cache) => cache.addAll(["/", "/index.html"]))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

// برای آینده: Push واقعی
self.addEventListener("push", (event) => {
  const data = event.data
    ? event.data.json()
    : { title: "یادآوری", body: "مراقبت امروز رو فراموش نکن." };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    })
  );
});