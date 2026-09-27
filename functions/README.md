# Sambodhi Sarang Marriage Bureau - Backend FCM Push Notification Cloud Functions

This repository contains the Firebase Cloud Functions backend for **Sambodhi Sarang Marriage Bureau** (`sambodhi-sarang`), engineered to deliver automatic real-time **Firebase Cloud Messaging (FCM) Push Notifications** to mobile app and web users.

---

## 🎯 Key Design Features

1. **Zero Frontend Modifications Required**:
   - Integrates directly with existing production Firestore collections (`notifications`, `profiles`, `users`, `chats`, `interests`).
   - Works immediately with the live website (`sambodhisarang.com`) without requiring any new `dist` build or code changes on the deployed frontend.

2. **Resilient Token Resolution (`getTokensForUser`)**:
   - Automatically searches both `profiles` and `users` collections.
   - Matches target user IDs across:
     - Document ID (`profiles/{targetUserId}`, `users/{targetUserId}`)
     - Field `id` (`p_1001`, `1001`, `u_123`)
     - Field `regId` / `registrationId` (`SS-1001`, `1001`)
     - Field `email`
   - Extracts FCM tokens across all common token field names:
     - `fcmToken` (string)
     - `fcmTokens` (array of strings)
     - `pushToken` / `pushTokens`
     - `deviceToken` / `deviceTokens`
     - `fcm_token` / `fcm_tokens`
     - `tokens`

3. **Automatic Token Cleanup**:
   - Invalid or expired FCM tokens (`messaging/invalid-registration-token`, `messaging/registration-token-not-registered`) are automatically removed from Firestore to prevent unnecessary notification retries.

---

## ⚡ Cloud Functions Overview

### 1. `onNotificationCreated` (Firestore `onCreate` on `notifications/{notificationId}`)
- **Trigger**: Fired automatically whenever any notification document is saved to `notifications` collection by the website or admin panel.
- **Events Covered**:
  - Express Interest (`type: 'interest'`)
  - Accept Interest (`type: 'accepted'`)
  - Profile Views (`type: 'view'`)
  - Direct Messages (`type: 'message'`)
  - Admin Announcements (`type: 'admin'`)
- **FCM Payload**:
  - `title`: `notificationData.title`
  - `body`: `notificationData.text`
  - `data`: Includes `notificationId`, `type`, `targetUserId`, `senderId`, `click_action: "FLUTTER_NOTIFICATION_CLICK"`
  - High priority Android channel & iOS APNs sound configuration.

### 2. `onChatUpdated` (Firestore `onWrite` on `chats/{chatId}`)
- **Trigger**: Fired when a new message is appended to a thread in `chats`.
- **Payload**: Sends push notification to the recipient with sender name and message content.

### 3. `sendDirectPushNotification` (Callable HTTPS Function)
- **Usage**: Allows Admin Dashboard or backend triggers to send direct, targeted FCM push notifications to any `targetUserId`.

### 4. `testFcmNotification` (HTTPS Endpoint)
- **Usage**: HTTP GET/POST endpoint to test token resolution for a specific user ID.
- **Example**:
  ```bash
  curl "https://us-central1-sambodhi-sarang.cloudfunctions.net/testFcmNotification?userId=p_1001"
  ```

---

## 🚀 Deployment Instructions

### Prerequisites
1. Ensure Firebase CLI is installed:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in to Firebase CLI:
   ```bash
   firebase login
   ```

### Step 1: Install Dependencies
Navigate to the `functions` directory and install dependencies:
```bash
npm --prefix functions install
```

### Step 2: Deploy Cloud Functions
Deploy functions to the `sambodhi-sarang` project:
```bash
firebase deploy --only functions
```

---

## 📊 Data Schema Reference

### `notifications` Collection Document:
```json
{
  "id": 1727400000000,
  "type": "interest",
  "targetUserId": "p_1002",
  "senderId": "p_1001",
  "senderName": "Ananya Joshi",
  "senderAvatar": "https://firebasestorage.googleapis.com/...",
  "title": "New Interest Received! ❤️",
  "text": "Ananya Joshi expressed interest in your profile.",
  "time": "Just now",
  "unread": true,
  "createdAt": "2026-09-27T13:43:00.000Z"
}
```

### `profiles` / `users` Collection Token Registration:
Save the device FCM token on the user profile document in Firestore:
```json
{
  "id": "p_1002",
  "name": "Pooja Kulkarni",
  "fcmToken": "fcm_device_registration_token_string..."
}
```
Or for multi-device support:
```json
{
  "id": "p_1002",
  "fcmTokens": [
    "token_device_1...",
    "token_device_2..."
  ]
}
```
