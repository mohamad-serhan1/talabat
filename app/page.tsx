'use client'

import { useState, useEffect } from 'react'
import { subscribeUser, unsubscribeUser, sendNotification } from './actions'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    console.log('Checking browser support...')
    console.log('navigator.serviceWorker:', 'serviceWorker' in navigator)
    console.log('window.PushManager:', 'PushManager' in window)

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      console.log('✅ Push is supported')
      setIsSupported(true)
      registerServiceWorker()
    } else {
      console.error('❌ Push notifications are not supported in this browser.')
    }
  }, [])

  async function registerServiceWorker() {
    try {
      console.log('Registering service worker...')
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      console.log('✅ Service worker registered:', registration)

      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        console.log('User already subscribed:', sub)
      } else {
        console.log('User is not subscribed yet.')
      }
      setSubscription(sub)
    } catch (error) {
      console.error('❌ Error registering service worker:', error)
    }
  }

  async function subscribeToPush() {
    try {
      console.log('Subscribing user to push notifications...')
      const registration = await navigator.serviceWorker.ready

      const applicationServerKey = urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      )
      console.log('Using VAPID public key:', process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      })

      console.log('✅ User subscribed:', sub)
      setSubscription(sub)

      const serializedSub = JSON.parse(JSON.stringify(sub))
      console.log('Serialized subscription:', serializedSub)

      const response = await subscribeUser(serializedSub)
      console.log('📡 Sent subscription to server:', response)
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error)
    }
  }

  async function unsubscribeFromPush() {
    try {
      if (subscription) {
        console.log('Unsubscribing from push...')
        await subscription.unsubscribe()
        setSubscription(null)
        const response = await unsubscribeUser()
        console.log('📡 Sent unsubscribe request to server:', response)
      } else {
        console.warn('⚠️ No subscription found to unsubscribe.')
      }
    } catch (error) {
      console.error('❌ Error unsubscribing:', error)
    }
  }

  async function sendTestNotification() {
    if (!subscription) {
      console.warn('⚠️ Cannot send notification, no subscription')
      return
    }
    try {
      console.log('Sending test notification with message:', message)
      const response = await sendNotification(message)
      console.log('📬 Notification response:', response)
      setMessage('')
    } catch (error) {
      console.error('❌ Error sending notification:', error)
    }
  }

  if (!isSupported) {
    return <p>❌ Push notifications are not supported in this browser.</p>
  }

  return (
    <div>
      <h3>🔔 Push Notifications</h3>
      {subscription ? (
        <>
          <p>✅ You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          <p>❌ You are not subscribed to push notifications.</p>
          <button onClick={() => {
            subscribeToPush()
            console.log('🔘 Subscribe button clicked')
          }}>
            Subscribe
          </button>
        </>
      )}
    </div>
  )
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent
    console.log('User agent:', userAgent)

    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
    const standalone = window.matchMedia('(display-mode: standalone)').matches

    console.log('iOS:', iOS)
    console.log('Is PWA installed (standalone):', standalone)

    setIsIOS(iOS)
    setIsStandalone(standalone)
  }, [])

  if (isStandalone) return null

  return (
    <div>
      <h3>📱 Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon"> ⎋ </span>
          and then "Add to Home Screen"
          <span role="img" aria-label="plus icon"> ➕ </span>.
        </p>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <div>
      <PushNotificationManager />
      <InstallPrompt />
    </div>
  )
}
