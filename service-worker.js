const CACHE_NAME = 'bpsc-exam-prep-v4'; // ভার্সন নম্বর v3 করে দিন

const urlsToCache = [
  '.',
  'index.html',
  'images/icons/icon-192x192.png',
  'images/icons/icon-512x512.png'
];

// বাকি কোড অপরিবর্তিত থাকবে...
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// নেটওয়ার্ক থেকে কিছু Fetch করার সময়
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // যদি ক্যাশে ফাইলটি পাওয়া যায়, তাহলে সেটাই দেখাও
        if (response) {
          return response;
        }
        // না পাওয়া গেলে, ইন্টারনেট থেকে নিয়ে আসো
        return fetch(event.request);
      })
  );
});

// পুরনো ক্যাশ ডিলিট করার জন্য
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
