// একটি ভার্সন নম্বর দিন, পরে আপডেট করতে কাজে লাগবে
const CACHE_NAME = 'bpsc-exam-prep-v1';

// যে ফাইলগুলো অফলাইনে দেখানোর জন্য ক্যাশ (সংরক্ষণ) করতে চান
const urlsToCache = [
  '/',
  '/index.html',
  // আপনার HTML কোড থেকে ব্যবহৃত সব CSS এবং JS ফাইলের লিঙ্ক এখানে যুক্ত করুন
  'https://fonts.googleapis.com/css?family=Noto+Sans+Bengali:wght@400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  // আপনার আইকনগুলো
  '/images/icons/icon-192x192.png',
  '/images/icons/icon-512x512.png'
];

// ১. সার্ভিস ওয়ার্কার ইন্সটল করার সময়
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ২. নেটওয়ার্ক থেকে কোনো কিছু Fetch করার সময়
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
      }
    )
  );
});

// ৩. পুরনো ক্যাশ ডিলিট করার জন্য
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
