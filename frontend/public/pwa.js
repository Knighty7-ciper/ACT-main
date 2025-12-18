// PWA Registration Script for ACT Platform
// Handles service worker registration, updates, and notifications

class PWAManager {
  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
    this.registration = null
    this.updateAvailable = false
    this.pushSubscription = null
  }

  // Initialize PWA functionality
  async init() {
    if (!this.isSupported) {
      console.log('PWA not supported in this browser')
      return
    }

    try {
      // Register service worker
      await this.registerServiceWorker()
      
      // Handle service worker updates
      this.handleServiceWorkerUpdates()
      
      // Request notification permission
      await this.requestNotificationPermission()
      
      // Setup periodic checks for updates
      this.setupUpdateChecks()
      
      console.log('PWA initialized successfully')
    } catch (error) {
      console.error('PWA initialization failed:', error)
    }
  }

  // Register service worker
  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      console.log('Service Worker registered:', this.registration)

      // Handle service worker installation
      this.registration.addEventListener('install', (event) => {
        console.log('Service Worker installing...')
      })

      this.registration.addEventListener('activate', (event) => {
        console.log('Service Worker activated')
        // Clean up old caches
        event.waitUntil(this.cleanupOldCaches())
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data)
      })

      // Check for updates when page loads
      this.checkForUpdates()

    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  // Handle service worker updates
  handleServiceWorkerUpdates() {
    if (!this.registration) return

    // Check for updates every 5 minutes
    setInterval(() => {
      this.checkForUpdates()
    }, 5 * 60 * 1000)

    // Listen for update found events
    this.registration.addEventListener('updatefound', () => {
      const newWorker = this.registration.installing
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this.updateAvailable = true
            this.showUpdateAvailable()
          }
        })
      }
    })
  }

  // Check for service worker updates
  async checkForUpdates() {
    if (!this.registration) return

    try {
      await this.registration.update()
      console.log('Service Worker update check completed')
    } catch (error) {
      console.error('Service Worker update check failed:', error)
    }
  }

  // Show update available notification
  showUpdateAvailable() {
    // Create update notification
    const updateBanner = document.createElement('div')
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        padding: 12px 16px;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 18px;">🔄</span>
          <span style="font-weight: 500;">New version available!</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button onclick="this.updateApp()" style="
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Update</button>
          <button onclick="this.dismissUpdate()" style="
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          ">Later</button>
        </div>
      </div>
    `

    // Add methods to the banner element
    updateBanner.updateApp = () => {
      this.updateApp()
      document.body.removeChild(updateBanner)
    }

    updateBanner.dismissUpdate = () => {
      document.body.removeChild(updateBanner)
    }

    document.body.appendChild(updateBanner)

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
      if (document.body.contains(updateBanner)) {
        document.body.removeChild(updateBanner)
      }
    }, 30000)
  }

  // Update the app
  async updateApp() {
    if (!this.registration || !this.registration.waiting) return

    // Tell the waiting service worker to take control immediately
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Reload the page
    window.location.reload()
  }

  // Request notification permission
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('Notifications not supported')
      return
    }

    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission()
        console.log('Notification permission:', permission)
        
        if (permission === 'granted') {
          await this.subscribeToPush()
        }
      } catch (error) {
        console.error('Notification permission request failed:', error)
      }
    } else if (Notification.permission === 'granted') {
      await this.subscribeToPush()
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!this.registration) return

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'BEl62iUYgUivxIkv69yViEuiBIa40HI80NQDbdCCJRyqRzVt2nLxAMJwyK8k8W0A2iVYdzOzCWhIM_8mQ5HwLr4dM'
        )
      })

      this.pushSubscription = subscription
      console.log('Push subscription created:', subscription)

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription)

    } catch (error) {
      console.error('Push subscription failed:', error)
    }
  }

  // Send subscription to server
  async sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userType: 'admin' // or 'user' based on current user
        }),
        credentials: 'include'
      })
      console.log('Push subscription sent to server')
    } catch (error) {
      console.error('Failed to send subscription to server:', error)
    }
  }

  // Setup periodic update checks
  setupUpdateChecks() {
    // Check for updates when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates()
      }
    })

    // Check for updates when app comes back online
    window.addEventListener('online', () => {
      this.checkForUpdates()
    })
  }

  // Handle messages from service worker
  handleServiceWorkerMessage(data) {
    console.log('Message from Service Worker:', data)

    if (data.type === 'OFFLINE_STATUS') {
      this.updateOfflineStatus(data.isOffline)
    }

    if (data.type === 'BACKGROUND_SYNC') {
      console.log('Background sync event:', data.event)
    }
  }

  // Update offline status indicator
  updateOfflineStatus(isOffline) {
    const offlineIndicator = document.getElementById('offline-indicator')
    if (offlineIndicator) {
      offlineIndicator.style.display = isOffline ? 'block' : 'none'
    }

    // Dispatch custom event for React components
    window.dispatchEvent(new CustomEvent('offline-status-change', {
      detail: { isOffline }
    }))
  }

  // Clean up old caches
  async cleanupOldCaches() {
    const cacheNames = await caches.keys()
    const validCacheNames = ['act-platform-v1.0.0', 'act-offline-v1.0.0', 'act-admin-v1.0.0']

    const deletePromises = cacheNames
      .filter(cacheName => !validCacheNames.includes(cacheName))
      .map(cacheName => caches.delete(cacheName))

    await Promise.all(deletePromises)
    console.log('Old caches cleaned up')
  }

  // Check if app is running in PWA mode
  isPWAMode() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://')
  }

  // Get PWA install prompt
  getInstallPrompt() {
    return window.deferredPrompt
  }

  // Show install prompt
  async showInstallPrompt() {
    const deferredPrompt = this.getInstallPrompt()
    if (!deferredPrompt) return

    try {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      
      if (result.outcome === 'accepted') {
        console.log('PWA installation accepted')
      } else {
        console.log('PWA installation dismissed')
      }

      window.deferredPrompt = null
    } catch (error) {
      console.error('PWA install prompt failed:', error)
    }
  }

  // Get app update status
  getUpdateStatus() {
    return {
      updateAvailable: this.updateAvailable,
      isPWAMode: this.isPWAMode(),
      hasPushSubscription: !!this.pushSubscription,
      serviceWorkerActive: !!navigator.serviceWorker.controller
    }
  }
}

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Global PWA manager instance
const pwaManager = new PWAManager()

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      pwaManager.init()
    })
  } else {
    pwaManager.init()
  }

  // Make PWA manager globally available
  window.pwaManager = pwaManager
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PWAManager, pwaManager }
}