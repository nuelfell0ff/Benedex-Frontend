const CACHE_NAME = "benedex-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/og-preview.jpg",
  "/logo192.png",
  "/logo512.png"
];

// Install Service Worker and cache core shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Using cache.addAll completely setup
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Worker and clear outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Clearing old PWA cache instance:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor: Handles requests seamlessly without network breaking rejections
self.addEventListener("fetch", (event) => {
  // Only handle local asset requests (skip external API microservice calls)
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Strategy: Network First with Cache Fallback for images/documents to avoid stale states
  if (event.request.mode === "navigate" || event.request.url.includes("og-preview.png")) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            // Save the fresh copy to cache for offline availability
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // If network fails (offline), load instantly from cache structure
          return caches.match(event.request);
        })
    );
  } else {
    // Strategy: Cache First, falling back to Network for stable structural assets (icons, fonts)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).catch((err) => {
          console.error("Network fetch failed for asset link path:", event.request.url, err);
          // Return a fallback or pass gracefully without breaking runtime flow
        });
      })
    );
  }
});

// ==========================================
// BENEDEX WEB PUSH NOTIFICATION SYSTEM
// ==========================================

// Listen for push events sent from your Node backend
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const payload = event.data.json();

    const options = {
      body: payload.body || "New update waiting in your portal.",
      icon: payload.icon || "/logo192.png", 
      image: payload.image || null,         // Displays your Cloudinary Admin Upload banner!
      badge: "/logo192.png",                
      data: {
        url: payload.data?.url || "/student/dashboard" 
      }
    };

    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  } catch (err) {
    console.error("Error parsing push notification layout:", err);
  }
});

// Handle clicking on the notification banner
self.addEventListener("notificationclick", (event) => {
  event.notification.close(); 
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a tab is already open, focus it and redirect
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus().then(() => client.navigate(targetUrl));
        }
      }
      // Otherwise, open a fresh window tab
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});