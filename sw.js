var staicCacheName = 'breathe-static-v1';

self.addEventListener('install', function(event) {

  event.waitUntil(
    caches.open(staicCacheName).then(function(cache) {
      return cache.addAll([
        '/',
        '/resources/css/fonts.css',
        '/resources/css/styles.css',
        '/resources/images/Breathe Logo With Text.png',
        '/resources/images/input-close.svg',
        '/resources/js/app.js',
        '/resources/js/utils.js',
        'https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.0/css/bulma.min.css',
        'https://unpkg.com/axios/dist/axios.min.js',
        'https://cdn.rawgit.com/bjornharrtell/jsts/gh-pages/1.0.2/jsts.min.js',
        'http://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLDz8Z1xlFQ.woff2',
        'http://fonts.gstatic.com/s/poppins/v5/pxiEyp8kv8JHgFVrJJfecg.woff2',
        'http://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2',
        'http://fonts.gstatic.com/s/materialicons/v36/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
      ])
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('breathe-static') && cacheName !== staicCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(function(response) {
      if (response) return response;

      return fetch(event.request);
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});