// Toy Haven service worker: caches files so the site can work offline (PWA)
const CACHE_NAME = "toy-haven-v2";

const FILES_TO_CACHE = [
    "./index.html",
    "./products.html",
    "./cart.html",
    "./checkout.html",
    "./wishlist.html",
    "./support.html",
    "./style.css",
    "./app.js",
    "./data/products.js",
    "./manifest.webmanifest",
    "./icon-192.png",
    "./icon-512.png",
    "./IMAGES/Logo.jpeg",
    "./IMAGES/favicon.png",
    "./IMAGES/toy-teddy.png",
    "./assets/toy-teddy.svg",
    "./assets/toy-astronaut.svg",
    "./assets/toy-rocket.svg",
    "./assets/toy-dino.svg",
    "./assets/toy-board.svg",
    "./assets/toy-spacegame.svg",
    "./assets/toy-car.svg",
    "./assets/toy-firetruck.svg",
    "./assets/toy-princess.svg",
    "./assets/toy-pixel.svg",
    "./assets/toy-jungle.svg",
    "./assets/toy-bus.svg"
];

// Install: save the files (one missing file will not stop the others)
self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache =>
            Promise.all(FILES_TO_CACHE.map(file => cache.add(file).catch(() => {})))
        )
    );
});

// Activate: delete old caches
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

// Fetch: try the internet first, use the saved copy when offline
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
