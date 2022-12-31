/*
注意sw.js的作用域，只能從其自身所在位置開始，因此讀不到它所有父節點的路徑，所以通常我們會把它放在根目錄
**/

const staticCacheName = 'site-static-v2'
const dynamicCacheName = 'site-dynamic-v1'
const assets = [
  '/tiles/',
  '/tiles/index.html',
  '/tiles/root.js',
  '/tiles/root.css',

  '/tiles/classic/',
  '/tiles/classic/index.html',
  '/tiles/classic/logic.js',
  '/tiles/classic/game.css',
  
  '/tiles/3x4/',
  '/tiles/3x4/index.html',
  '/tiles/3x4/logic.js',
  '/tiles/3x4/game.css',
]

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > size) {
        cache.delete(keys[0]).then(limitCacheSize(name, size))
      }
    })
  })
}

// install event
self.addEventListener('install', evt => {
  //console.log('service worker installed')
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets')
      cache.addAll(assets)
    })
  )
})

// activate event
self.addEventListener('activate', evt => {
  //console.log('service worker activated')
  evt.waitUntil(
    caches.keys().then(keys => {
      //console.log(keys)
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      )
    })
  )
})

// fetch event
self.addEventListener('fetch', evt => {
  //console.log('fetch event', evt)
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request).then(fetchRes => {
        return caches.open(dynamicCacheName).then(cache => {
          cache.put(evt.request.url, fetchRes.clone())
          // check cached items size
          limitCacheSize(dynamicCacheName, 15)
          return fetchRes
        })
      })
    }).catch(() => {
      if (evt.request.url.indexOf('.html') > -1) {
        return "page missing"
      }
    })
  )
})