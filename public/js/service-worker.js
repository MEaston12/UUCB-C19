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