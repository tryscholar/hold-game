const CACHE = 'hold-v5';
const ASSETS = ['./manifest.json'];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Network-first for the game HTML — always fetch fresh on load
    if (e.request.url.includes('hold.html') || e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }
    // Cache-first for everything else (icons, manifest)
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});
