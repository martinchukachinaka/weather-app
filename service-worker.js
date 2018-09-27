// const SW_CACHE_NAME = 'weatherapp-sw-resources-v2';
const SW_CACHE_NAME = 'weatherapp-sw-resources-v1';
const SW_APP_CACHE = 'weatherapp-app-data-v1';
const URLS_TO_CACHE = [
  '/styles/ud811.css',
  '/node_modules/idb/lib/idb.js',
  '/scripts/store.js'
];
const weatherAPIUrlBase = 'https://publicdata-weather.firebaseio.com/';

console.log('will start off things here...');

self.addEventListener('install', function (event) {
  console.log('V1 installing...');
  event.waitUntil(
    caches.open(SW_CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keyList => {
    console.log('current key list: ', keyList);
    return Promise.all(
      keyList.map(key => {
        if (SW_CACHE_NAME.indexOf(key) === -1) {
          console.log('deleting cache: ', key);
          return caches.delete(key);
        }
      })
    );
  }));
});

self.addEventListener('fetch', event => {
  // console.log('fetching...', event.request.url);

  if (event.request.url.startsWith(weatherAPIUrlBase)) {
    // FIXME: WHY DO I HAVE TO CLONE?
    const requestClone = event.request.clone();
    event.respondWith(fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(SW_APP_CACHE).then(cache => cache.put(requestClone, responseClone)).catch(error => console.error('error: ', error))
        return response;
      }
    }).catch(error => console.log('reque error: ', error)))
  } else {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          // console.log('request found cache. yipee!');
          return response;
        }
        const requestClone = event.request.clone();
        return fetch(requestClone).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches
            .open(SW_CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache));
          return response;
        });
      })
    );
  }
});
