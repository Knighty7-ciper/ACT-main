// Service Worker for ACT Platform PWA
// Version: 1.0.0

const CACHE_NAME = 'act-platform-v1.0.0'
const OFFLINE_CACHE = 'act-offline-v1.0.0'
const ADMIN_CACHE = 'act-admin-v1.0.0'

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/dashboard',
  '/admin/dashboard',
  '/wallet',
  '/transactions',
  '/profile',
  '/settings',
  '/manifest.json',
  '/images/logo192.jpg',
  '/images/logo512.jpg',
  // Add other critical assets here
]

// Admin-specific resources to cache
const ADMIN_RESOURCES = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/transactions',
  '/admin/kyc',
  '/admin/system',
  '/admin/analytics',
  '/admin/audit',
  // Admin-specific assets
]

// API endpoints to cache for offline
const CACHEABLE_APIS = [
  '/api/admin/dashboard-stats',
  '/api/admin/users',
  '/api/admin/transactions',
  '/api/admin/kyc',
  '/api/dashboard/stats',
  '/api/wallet/balance',
  '/api/transactions/history',
  '/api/profile',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static resources')
        return cache.addAll(STATIC_RESOURCES)
      }),
      
      // Cache admin resources
      caches.open(ADMIN_CACHE).then((cache) => {
        console.log('Service Worker: Caching admin resources')
        return cache.addAll(ADMIN_RESOURCES)
      })
    ])
  )
  
  // Force activation of new service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE && cacheName !== ADMIN_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all clients
  self.clients.claim()
})

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Handle admin API calls with network-first strategy
  if (url.pathname.startsWith('/api/admin/')) {
    event.respondWith(handleAdminAPICall(request))
    return
  }
  
  // Handle regular API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPICall(request))
    return
  }
  
  // Handle navigation requests (pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }
  
  // Handle static assets (images, CSS, JS)
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request))
    return
  }
  
  // Default: try cache first, then network
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request)
    })
  )
})

// Handle admin API calls - Network first, fallback to cache
async function handleAdminAPICall(request) {
  try {
    // Try network first for real-time data
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful admin responses
      const cache = await caches.open(ADMIN_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed for admin API, trying cache')
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for admin APIs
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline - Data not available',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle general API calls - Stale while revalidate
async function handleAPICall(request) {
  try {
    const cache = await caches.open(OFFLINE_CACHE)
    const cachedResponse = await cache.match(request)
    
    // Fetch from network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Update cache with fresh data
      cache.put(request, networkResponse.clone())
    }
    
    // Return cached response if available, otherwise network response
    return cachedResponse || networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed for API, trying cache')
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Offline - Data not available',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle navigation requests - Network first, fallback to cache
async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Network failed for navigation, trying cache')
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Serve offline page for admin routes
    if (request.url.includes('/admin/')) {
      const offlinePage = await caches.match('/admin/offline')
      if (offlinePage) {
        return offlinePage
      }
    }
    
    // Serve general offline page
    const generalOfflinePage = await caches.match('/offline')
    if (generalOfflinePage) {
      return generalOfflinePage
    }
    
    // Last resort - basic offline response
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>ACT Platform - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #000; color: #fff; }
            .container { max-width: 400px; margin: 0 auto; }
            .icon { font-size: 4em; margin-bottom: 20px; }
            .title { font-size: 2em; margin-bottom: 20px; }
            .message { font-size: 1.2em; margin-bottom: 20px; color: #ccc; }
            .button { background: #f59e0b; color: #000; padding: 12px 24px; border: none; border-radius: 6px; font-size: 1em; cursor: pointer; }
            .button:hover { background: #d97706; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📱</div>
            <h1 class="title">You're Offline</h1>
            <p class="message">Please check your internet connection and try again.</p>
            <button class="button" onclick="window.location.reload()">Try Again</button>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}

// Handle static assets - Cache first, fallback to network
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Failed to fetch static asset:', request.url)
    throw error
  }
}

// Helper function to check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url)
  return (
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf')
  )
}

// Handle background sync for admin actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync event:', event.tag)
  
  if (event.tag === 'admin-actions') {
    event.waitUntil(syncAdminActions())
  }
  
  if (event.tag === 'user-actions') {
    event.waitUntil(syncUserActions())
  }
})

// Sync admin actions when back online
async function syncAdminActions() {
  try {
    const cache = await caches.open(OFFLINE_CACHE)
    const requests = await cache.keys()
    
    for (const request of requests) {
      if (request.url.includes('/api/admin/') && request.method === 'POST') {
        try {
          await fetch(request)
          console.log('Service Worker: Synced admin action:', request.url)
        } catch (error) {
          console.log('Service Worker: Failed to sync admin action:', request.url)
        }
      }
    }
  } catch (error) {
    console.log('Service Worker: Error during admin sync:', error)
  }
}

// Sync user actions when back online
async function syncUserActions() {
  try {
    const cache = await caches.open(OFFLINE_CACHE)
    const requests = await cache.keys()
    
    for (const request of requests) {
      if ((request.url.includes('/api/wallet/') || request.url.includes('/api/transactions/')) && request.method === 'POST') {
        try {
          await fetch(request)
          console.log('Service Worker: Synced user action:', request.url)
        } catch (error) {
          console.log('Service Worker: Failed to sync user action:', request.url)
        }
      }
    }
  } catch (error) {
    console.log('Service Worker: Error during user sync:', error)
  }
}

// Handle push notifications for admin alerts
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: 'New admin alert received',
    icon: '/images/logo192.jpg',
    badge: '/images/logo192.jpg',
    vibrate: [200, 100, 200],
    data: {
      url: '/admin/dashboard'
    },
    actions: [
      {
        action: 'view',
        title: 'View Dashboard',
        icon: '/images/logo192.jpg'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/logo192.jpg'
      }
    ]
  }
  
  if (event.data) {
    const data = event.data.json()
    options.body = data.message || options.body
    options.data = { ...options.data, ...data }
  }
  
  event.waitUntil(
    self.registration.showNotification('ACT Platform', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/admin/dashboard')
    )
  }
  
  if (event.action === 'dismiss') {
    // Just close the notification (already done above)
    return
  }
  
  // Default action - open dashboard
  if (!event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/admin/dashboard')
    )
  }
})

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CACHE_ADMIN_DATA') {
    cacheAdminData(event.data.url, event.data.data)
  }
})

// Cache admin data for offline access
async function cacheAdminData(url, data) {
  try {
    const cache = await caches.open(ADMIN_CACHE)
    const response = new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    })
    await cache.put(url, response)
    console.log('Service Worker: Cached admin data for offline access:', url)
  } catch (error) {
    console.log('Service Worker: Failed to cache admin data:', error)
  }
}

console.log('Service Worker: Loaded successfully')