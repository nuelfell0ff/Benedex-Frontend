import axios from "axios"; // Replace with your custom API instance if you have one

// Helper function to format the VAPID key correctly for Chrome
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const initPushNotifications = async (userToken) => {
  try {
    // 1. Verify browser capability
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.warn("Push notifications are not supported in this browser.");
      return;
    }

    // 2. Register or locate your sw.js file sitting in your public folder
    const registration = await navigator.serviceWorker.register("/sw.js");
    console.log("Service Worker registered successfully:", registration.scope);

    // 3. Set up authorization headers for your backend
    const config = {
      headers: { Authorization: `Bearer ${userToken}` }
    };

    // 4. Fetch the Public VAPID Key from your backend
    const res = await axios.get("https://benedex-backend.onrender.com/api/notifications/vapid-key", config);
    const publicKey = res.data.publicKey;

    if (!publicKey) return;

    // 5. Ask the user for permission ("Allow Notifications")
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("User blocked notification permissions.");
      return;
    }

    // 6. Subscribe the device to Chrome's push mesh network
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    });

    // 7. Send the device endpoint token to MongoDB
    await axios.post("https://benedex-backend.onrender.com/api/notifications/subscribe", subscription, config);
    console.log("Device synchronized with push notifications endpoint!");

  } catch (error) {
    console.error("Failed to initialize push subscription handshake:", error);
  }
};