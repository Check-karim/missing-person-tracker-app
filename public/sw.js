// Service Worker for PWA functionality
const CACHE_NAME = 'missing-person-tracker-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/missing-persons',
  '/report',
  '/my-reports'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('Cache failed:', err))
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch new
        return response || fetch(event.request);
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/');
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for location updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-location') {
    event.waitUntil(syncLocation());
  }
});

async function syncLocation() {
  try {
    // Get pending location updates from IndexedDB
    const db = await openDB();
    const pendingLocations = await getPendingLocations(db);
    
    for (const location of pendingLocations) {
      await fetch('/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${location.token}`
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        })
      });
    }
    
    await clearPendingLocations(db);
  } catch (error) {
    console.error('Location sync failed:', error);
  }
}

// IndexedDB helpers
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('LocationTracker', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingLocations')) {
        db.createObjectStore('pendingLocations', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

function getPendingLocations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingLocations'], 'readonly');
    const store = transaction.objectStore('pendingLocations');
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function clearPendingLocations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingLocations'], 'readwrite');
    const store = transaction.objectStore('pendingLocations');
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
