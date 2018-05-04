// Use LocalForage to store, get data and use it when offline
importScripts('https://cdnjs.cloudflare.com/ajax/libs/localforage/1.7.1/localforage.min.js');

var staicCacheName = 'breathe-static-v2';

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
        'https://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLDz8Z1xlFQ.woff2',
        'https://fonts.gstatic.com/s/poppins/v5/pxiEyp8kv8JHgFVrJJfecg.woff2',
        'https://fonts.gstatic.com/s/poppins/v5/pxiByp8kv8JHgFVrLGT9Z1xlFQ.woff2',
        'https://fonts.gstatic.com/s/materialicons/v36/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2'
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
    .catch(function(err) {
      /**
       * If fetch() wasn't successful, then we check if the API data is stored locally,
       * and send it back if found.
       */
      if (event.request.url.startsWith('https://api.waqi.info/feed/geo')) {
        var url = new URL(event.request.url);
        var key = url.searchParams.get('key');
        
        return localforage.getItem(key)
        .then(function(data) {
          // Make the request if data is not stored
          if (!data) return fetch(event.request);

          // Return the stored response
          return new Response(JSON.stringify(data.apiData));
        })
        .catch(function(err) {
          console.log(err);
        });
      }
      /**
       * If request to Google Maps has failed, then send a message to main app
       * to setup an offline experience for the user
       */
      else if (event.request.url.startsWith('https://maps.googleapis.com/maps/api')) {
        if (!event.clientId) return;

        clients.get(event.clientId)
        .then(function(client) {
          client.postMessage({
            message: 'mapsoffline'
          });
        })
        .catch(function(err) {
          console.log(err);
        });
      }

      /**
       * If request is made to get IP data, then send a message to main app to
       * use the locally stored IP data for offline use
       */
      else if (event.request.url.startsWith('https://geoip.nekudo.com/api/')) {
        if (!event.clientId) return;

        clients.get(event.clientId)
        .then(function(client) {
          client.postMessage({
            message: 'ipoffline'
          });
        })
        .catch(function(err) {
          console.log(err);
        });
      }
    })
  );
});

self.addEventListener('message', function(event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
