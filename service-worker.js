// Service Worker for BPSC Exam Prep - Cache Buster Version
// এই ভার্সন নম্বরটি প্রতিবার কোড আপডেট করার পর পরিবর্তন করুন
const CACHE_VERSION = 'v1.5'; // مثال: v1.1, v1.2, v2.0
const CACHE_NAME = `bpsc-cache-${CACHE_VERSION}`;

// অ্যাপের জন্য প্রয়োজনীয় ফাইল
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // আপনি যদি CSS বা অন্য কোনো ফাইল ব্যবহার করেন, সেগুলোও এখানে যোগ করতে পারেন
  // '/style.css',
  // '/app.js' 
];

// ১. ইনস্টল ইভেন্ট: নতুন ভার্সনের ক্যাশ তৈরি করা
self.addEventListener('install', event => {
  console.log(`[Service Worker] Installing version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // নতুন সার্ভিস ওয়ার্কার ইনস্টল হওয়ার সাথে সাথে এটিকে সক্রিয় করতে বাধ্য করা
        return self.skipWaiting();
      })
  );
});

// ২. অ্যাক্টিভেট ইভেন্ট: পুরানো ভার্সনের ক্যাশ মুছে ফেলা
self.addEventListener('activate', event => {
  console.log(`[Service Worker] Activating version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // সক্রিয় হওয়ার পর সমস্ত ক্লায়েন্টদের নিয়ন্ত্রণ নিতে বাধ্য করা
        return self.clients.claim();
    })
  );
});

// ৩. ফেচ ইভেন্ট: নেটওয়ার্ক আগে, ক্যাশ পরে (Network First Strategy)
self.addEventListener('fetch', event => {
  event.respondWith(
    // প্রথমে নেটওয়ার্ক থেকে আনার চেষ্টা করা হবে
    fetch(event.request).then(networkResponse => {
      // যদি নেটওয়ার্ক থেকে সফলভাবে আসে
      return caches.open(CACHE_NAME).then(cache => {
        // নতুন ফাইলটি ক্যাশে সেভ করে রাখা হবে ভবিষ্যতের জন্য
        cache.put(event.request, networkResponse.clone());
        // এবং নেটওয়ার্ক থেকে পাওয়া নতুন ফাইলটি দেখানো হবে
        return networkResponse;
      });
    }).catch(() => {
      // যদি নেটওয়ার্ক ফেইল করে (অফলাইন)
      // তখন ক্যাশ থেকে পুরানো ফাইলটি দেখানো হবে
      console.log('[Service Worker] Fetch failed, serving from cache for:', event.request.url);
      return caches.match(event.request);
    })
  );
});
