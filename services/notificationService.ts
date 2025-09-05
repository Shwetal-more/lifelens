// A simple service to handle browser notifications.

/**
 * Requests permission from the user to send notifications.
 * @returns {Promise<PermissionState>} The user's decision ('granted', 'denied', 'default').
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support desktop notification");
    return 'denied';
  }
  return await Notification.requestPermission();
};

/**
 * Sends a push notification if permission has been granted.
 * @param {string} title The title of the notification.
 * @param {string} body The body text of the notification.
 */
export const sendNotification = (title: string, body: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: '/vite.svg', // Optional: Add an icon
      badge: '/vite.svg', // Optional: for mobile
    });
  } else {
    console.log("Notification permission not granted.");
  }
};

/**
 * Checks the current notification permission status.
 * @returns {NotificationPermission} The current permission status.
 */
export const getNotificationPermission = (): NotificationPermission => {
    if (!('Notification' in window)) {
        return 'denied';
    }
    return Notification.permission;
}
