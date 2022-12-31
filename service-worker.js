let cacheName = "zen32";// 👈 any unique name

let filesToCache = [
  "/tiles/", // 👈 your repository name , both slash are important
  "service-worker.js",
  "main.js",
  "install-handler.js",
  "settings.js",
  // "css/main.css",
  "icon.png",
  "manifest.json",
  // add your assets here 
  // ❗️❕donot add config.json here ❗️❕
  'index.html',
  'root.js',
  'root.css',

  'classic/',
  'classic/index.html',
  'classic/logic.js',
  'classic/game.css',
  
  '3x4/',
  '3x4/index.html',
  '3x4/logic.js',
  '3x4/game.css',
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(cacheName).then((cache) => {
    console.log('installed successfully')
    return cache.addAll(filesToCache);
  }));
});

self.addEventListener('fetch', function (event) {

  if (event.request.url.includes('clean-cache')) {
    caches.delete(cacheName);
    console.log('Cache cleared')
  }

  event.respondWith(caches.match(event.request).then(function (response) {
    if (response) {
      console.log('served form cache')
    } else {
      console.log('Not serving from cache ', event.request.url)
    }
    return response || fetch(event.request);
  })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== cacheName) {
          console.log('service worker: Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});