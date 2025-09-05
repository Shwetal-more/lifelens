// src/services/notificationService.ts

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

/**
 * Requests permission from the user to send browser notifications.
 * @returns {Promise<NotificationPermission>} The user's decision ('granted', 'denied', 'default').
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notifications");
    return 'denied';
  }
  return await Notification.requestPermission();
};

/**
 * Sends a browser notification if permission has been granted.
 * @param {string} title The title of the notification.
 * @param {string} body The body text of the notification.
 */
export const sendBrowserNotification = (title: string, body: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/vite.svg', // Optional: add your logo
      badge: '/vite.svg', // Optional: for mobile devices
    });
  } else {
    console.log("Notification permission not granted.");
  }
};

/**
 * Checks the current browser notification permission status.
 * @returns {NotificationPermission} The current permission status.
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Sends an SMS notification via backend (Twilio integration).
 * @param {string} to The recipient's phone number in E.164 format (e.g., +1234567890).
 * @param {string} message The SMS body text.
 */
export async function sendSmsNotification(to: string, message: string) {
  if (!to) throw new Error('No phone number supplied');
  const res = await fetch(`${BACKEND}/api/send-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, body: message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to send SMS');
  }
  return res.json();
}
