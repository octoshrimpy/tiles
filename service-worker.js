/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @format
 */

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict'

var precacheConfig = [
  ['4x4/game.css', '331666382beeabb8eb3228d024279b08'],
  ['4x4/game.css.map', 'c1e3b7cc8b321dab7da49a86f4ffdb86'],
  ['4x4/game.scss', '3b0ed8e824177787626294aec540b5b3'],
  ['4x4/index.html', 'a208539c88ae7ab226fd68d4ed51ec6a'],
  ['4x4/logic.js', '1bfc5630cc08718b0d7ca3ba23f16129'],
  ['README.md', 'fb3858c04c41ba1ef4bba8e74245969a'],
  ['classic/game.css', '87bb568d4aa5043ad4472cf7d2b4a267'],
  ['classic/game.css.map', 'fce1b0f7fdd12a2e652faaa438181cc3'],
  ['classic/game.scss', '1a3e078d3228654e4580f75225184bdd'],
  ['classic/index.html', 'e703e5e13c1ad926ea1911aff0d7140d'],
  ['classic/logic.js', '1bfc5630cc08718b0d7ca3ba23f16129'],
  ['icon.png', '8d9ff41ab30d832643d033e1850ece59'],
  ['index.html', 'd126808e6e7b0cb26ef9d4a8870c6228'],
  ['manifest.json', '8f639af9748585fe2d06afed7df096b0'],
  ['root.css', 'c1dfdc9c94f5e785195a0962db5fc430'],
  ['root.css.map', 'd68dff5d54a35c0769fafcdbc79eec5b'],
  ['root.js', 'f18465fb60d0534b6d5c97f3b452986b'],
  ['root.scss', 'e5b7acb662dc0f8d58b40333e72c4253'],
  ['styles/_breakpoints.scss', '8467328f54dcb4c378fd83bacc8c52fb'],
  ['styles/_lib.scss', 'f11d4faf54242972f374e0432fd2639c'],
  ['sw.js', '1e72e5798c14723d7c0f5e940a3d3f1e']
]
var cacheName = 'sw-precache-v3-sw-precache-' + (self.registration ? self.registration.scope : '')

var ignoreUrlParametersMatching = [/^utm_/]

var addDirectoryIndex = function (originalUrl, index) {
  var url = new URL(originalUrl)
  if (url.pathname.slice(-1) === '/') {
    url.pathname += index
  }
  return url.toString()
}

var cleanResponse = function (originalResponse) {
  // If this is not a redirected response, then we don't have to do anything.
  if (!originalResponse.redirected) {
    return Promise.resolve(originalResponse)
  }

  // Firefox 50 and below doesn't support the Response.body stream, so we may
  // need to read the entire body to memory as a Blob.
  var bodyPromise = 'body' in originalResponse ? Promise.resolve(originalResponse.body) : originalResponse.blob()

  return bodyPromise.then(function (body) {
    // new Response() is happy when passed either a stream or a Blob.
    return new Response(body, {
      headers: originalResponse.headers,
      status: originalResponse.status,
      statusText: originalResponse.statusText
    })
  })
}

var createCacheKey = function (originalUrl, paramName, paramValue, dontCacheBustUrlsMatching) {
  // Create a new URL object to avoid modifying originalUrl.
  var url = new URL(originalUrl)

  // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
  // then add in the extra cache-busting URL parameter.
  if (!dontCacheBustUrlsMatching || !url.pathname.match(dontCacheBustUrlsMatching)) {
    url.search += (url.search ? '&' : '') + encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue)
  }

  return url.toString()
}

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
  // If the whitelist is empty, then consider all URLs to be whitelisted.
  if (whitelist.length === 0) {
    return true
  }

  // Otherwise compare each path regex to the path of the URL passed in.
  var path = new URL(absoluteUrlString).pathname
  return whitelist.some(function (whitelistedPathRegex) {
    return path.match(whitelistedPathRegex)
  })
}

var stripIgnoredUrlParameters = function (originalUrl, ignoreUrlParametersMatching) {
  var url = new URL(originalUrl)
  // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
  url.hash = ''

  url.search = url.search
    .slice(1) // Exclude initial '?'
    .split('&') // Split into an array of 'key=value' strings
    .map(function (kv) {
      return kv.split('=') // Split each 'key=value' string into a [key, value] array
    })
    .filter(function (kv) {
      return ignoreUrlParametersMatching.every(function (ignoredRegex) {
        return !ignoredRegex.test(kv[0]) // Return true iff the key doesn't match any of the regexes.
      })
    })
    .map(function (kv) {
      return kv.join('=') // Join each [key, value] array into a 'key=value' string
    })
    .join('&') // Join the array of 'key=value' strings into a string with '&' in between each

  return url.toString()
}

var hashParamName = '_sw-precache'
var urlsToCacheKeys = new Map(
  precacheConfig.map(function (item) {
    var relativeUrl = item[0]
    var hash = item[1]
    var absoluteUrl = new URL(relativeUrl, self.location)
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false)
    return [absoluteUrl.toString(), cacheKey]
  })
)

function setOfCachedUrls(cache) {
  return cache
    .keys()
    .then(function (requests) {
      return requests.map(function (request) {
        return request.url
      })
    })
    .then(function (urls) {
      return new Set(urls)
    })
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches
      .open(cacheName)
      .then(function (cache) {
        return setOfCachedUrls(cache).then(function (cachedUrls) {
          return Promise.all(
            Array.from(urlsToCacheKeys.values()).map(function (cacheKey) {
              // If we don't have a key matching url in the cache already, add it.
              if (!cachedUrls.has(cacheKey)) {
                var request = new Request(cacheKey, { credentials: 'same-origin' })
                return fetch(request).then(function (response) {
                  // Bail out of installation unless we get back a 200 OK for
                  // every request.
                  if (!response.ok) {
                    throw new Error('Request for ' + cacheKey + ' returned a ' + 'response with status ' + response.status)
                  }

                  return cleanResponse(response).then(function (responseToCache) {
                    return cache.put(cacheKey, responseToCache)
                  })
                })
              }
            })
          )
        })
      })
      .then(function () {
        // Force the SW to transition from installing -> active state
        return self.skipWaiting()
      })
  )
})

self.addEventListener('activate', function (event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values())

  event.waitUntil(
    caches
      .open(cacheName)
      .then(function (cache) {
        return cache.keys().then(function (existingRequests) {
          return Promise.all(
            existingRequests.map(function (existingRequest) {
              if (!setOfExpectedUrls.has(existingRequest.url)) {
                return cache.delete(existingRequest)
              }
            })
          )
        })
      })
      .then(function () {
        return self.clients.claim()
      })
  )
})

self.addEventListener('fetch', function (event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching)
    shouldRespond = urlsToCacheKeys.has(url)

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html'
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex)
      shouldRespond = urlsToCacheKeys.has(url)
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = ''
    if (!shouldRespond && navigateFallback && event.request.mode === 'navigate' && isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString()
      shouldRespond = urlsToCacheKeys.has(url)
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches
          .open(cacheName)
          .then(function (cache) {
            return cache.match(urlsToCacheKeys.get(url)).then(function (response) {
              if (response) {
                return response
              }
              throw Error('The cached response that was expected is missing.')
            })
          })
          .catch(function (e) {
            // Fall back to just fetch()ing the request if some unexpected error
            // prevented the cached response from being valid.
            console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e)
            return fetch(event.request)
          })
      )
    }
  }
})
