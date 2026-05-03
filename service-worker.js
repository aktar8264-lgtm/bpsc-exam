// Service Worker for BPSC Exam Prep - Network First Strategy v2.0
// এই কোড নিশ্চিত করবে যে ব্যবহারকারী সবসময় লেটেস্ট ভার্সন পাবে।

const CACHE_NAME = 'bpsc-dynamic-cache-v1';

// ইনস্টল ইভেন্ট: সার্ভিস ওয়ার্কারকে দ্রুত সক্রিয় করা হয়
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  // নতুন সার্ভিস ওয়ার্কারকে পুরানোটার জন্য অপেক্ষা না করে সরাসরি সক্রিয় হতে বলা হচ্ছে
  event.waitUntil(self.skipWaiting());
});

// অ্যাক্টিভেট ইভেন্ট: পুরানো ক্যাশ পরিষ্কার করা
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // যদি কোনো ক্যাশের নাম বর্তমান ক্যাশের নামের সাথে না মেলে, তবে সেটি মুছে ফেলা হবে
          // এটি নিশ্চিত করে যে শুধুমাত্র একটি ক্যাশ সক্রিয় থাকবে
          if (cacheName !== CACHE_NAME) {
            console.log(`[Service Worker] Deleting old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
        // সক্রিয় হওয়ার পর সমস্ত ক্লায়েন্টদের নিয়ন্ত্রণ নিতে বলা হচ্ছে
        return self.clients.claim();
    })
  );
});

// ফেচ ইভেন্ট: নেটওয়ার্ক আগে, ক্যাশ পরে (Network First, then Cache)
// এটাই সবচেয়ে গুরুত্বপূর্ণ অংশ
self.addEventListener('fetch', event => {
  // শুধুমাত্র GET রিকোয়েস্টগুলো হ্যান্ডেল করা হবে
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    // ১. প্রথমে নেটওয়ার্ক থেকে নতুন ফাইল আনার চেষ্টা করা হবে
    fetch(event.request)
      .then(networkResponse => {
        // ২. যদি নেটওয়ার্ক থেকে ফাইল সফলভাবে আসে
        return caches.open(CACHE_NAME).then(cache => {
          // ৩. নতুন ফাইলটিকে ভবিষ্যতের জন্য ক্যাশে সেভ করে রাখা হবে
          //    যাতে অফলাইনে থাকলে এটি ব্যবহার করা যায়
          cache.put(event.request, networkResponse.clone());
          // ৪. এবং নেটওয়ার্ক থেকে পাওয়া লেটেস্ট ফাইলটি ব্যবহারকারীকে দেখানো হবে
          return networkResponse;
        });
      })
      .catch(() => {
        // ৫. যদি নেটওয়ার্ক থেকে ফাইল আনতে ব্যর্থ হয় (যেমন: ইন্টারনেট নেই)
        console.log('[Service Worker] Network request failed. Serving from cache for:', event.request.url);
        // ৬. তখন ক্যাশ থেকে ফাইলটি খুঁজে বের করে দেখানো হবে
        return caches.match(event.request).then(cachedResponse => {
          // যদি ক্যাশেও ফাইলটি না পাওয়া যায়, তাহলে একটি এরর পেজ দেখানো যেতে পারে (ঐচ্ছিক)
          return cachedResponse || Response.error();
        });
      })
  );
});
