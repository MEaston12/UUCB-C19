const APP_PREFIX = 'Transaction-Tracker-';
const VERSION = '0.0.0.0.0.0.1.A';
const CACHE_NAME = APP_PREFIX + VERSION;

const toCache = [];

self.addEventListener('install', e => {
    const preCache = async () => {
        const cache = await caches.open(CACHE_NAME);
        return cache.addAll(toCache);
    }
    e.waitUntil(preCache());
});

self.addEventListener('activate', e => {
    const activate = async () => {
        const keyList = await caches.keys();
        return Promise.all(
            keyList.filter(key => key.startsWith(APP_PREFIX) && key != CACHE_NAME)
                .map(key => caches.delete(key))
        );
    }
    e.waitUntil(activate());
});

self.addEventListener('fetch', e => {
    console.log('got fetch:', e.request.url);
    e.respondWith(caches.match(e.request).then(request => request || fetch(e.request)));
});