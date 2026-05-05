// এই সার্ভিস ওয়ার্কারের একমাত্র কাজ হলো পুরনো অ্যাপকে নিষ্ক্রিয় করা।

// ধাপ ১: ইনস্টল হওয়ার সাথে সাথে পুরনো সার্ভিস ওয়ার্কারকে প্রতিস্থাপন করার জন্য প্রস্তুত হওয়া।
self.addEventListener('install', event => {
  self.skipWaiting();
});

// ধাপ ২: অ্যাক্টিভেট হওয়ার সাথে সাথে মূল কাজটি করা।
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      // পুরনো অ্যাপের সমস্ত ক্যাশ (Cache) খুঁজে বের করে ডিলিট করা।
      const keys = await caches.keys();
      await Promise.all(keys.map(key => {
        console.log('Deleting old cache:', key);
        return caches.delete(key);
      }));

      // নিজেকে (এই সার্ভিস ওয়ার্কারকে) আনরেজিস্টার করে দেওয়া, যাতে এর কাজ শেষ হয়ে যায়।
      await self.registration.unregister();
      console.log('Kill switch executed. Service worker unregistered.');
      
      // অ্যাপের সকল খোলা উইন্ডোকে রিফ্রেশ করার নির্দেশ দেওয়া।
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach(client => {
        if (client.url && 'navigate' in client) {
            client.navigate(client.url);
        }
      });
    })()
  );
});
