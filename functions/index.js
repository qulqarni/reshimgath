const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Helper: Retrieve all valid FCM tokens for a given target user or profile ID.
 * Searches both 'profiles' and 'users' collections across various matching strategies
 * (doc ID, id, regId, registrationId, email).
 *
 * Supported token field names on Firestore docs:
 * - fcmToken (string)
 * - fcmTokens (array of strings)
 * - pushToken (string or array)
 * - deviceToken (string or array)
 * - fcm_token (string)
 * - tokens (array of strings)
 *
 * @param {string|number} targetUserId
 * @returns {Promise<{ tokens: string[], docRefs: admin.firestore.DocumentReference[] }>}
 */
async function getTokensForUser(targetUserId) {
  if (!targetUserId) return { tokens: [], docRefs: [] };

  const idStr = String(targetUserId).trim();
  const idStrLower = idStr.toLowerCase();
  const tokensSet = new Set();
  const docRefsMap = new Map();

  /**
   * Extract token fields from a Firestore Document Snapshot
   */
  function extractTokens(docSnap) {
    if (!docSnap || !docSnap.exists) return;
    const data = docSnap.data() || {};
    docRefsMap.set(docSnap.ref.path, docSnap.ref);

    // 1. Single string token fields
    const singleFields = ['fcmToken', 'pushToken', 'deviceToken', 'fcm_token', 'notificationToken'];
    singleFields.forEach((field) => {
      if (data[field] && typeof data[field] === 'string' && data[field].trim()) {
        tokensSet.add(data[field].trim());
      }
    });

    // 2. Array token fields
    const arrayFields = ['fcmTokens', 'pushTokens', 'deviceTokens', 'tokens', 'fcm_tokens'];
    arrayFields.forEach((field) => {
      if (Array.isArray(data[field])) {
        data[field].forEach((tok) => {
          if (tok && typeof tok === 'string' && tok.trim()) {
            tokensSet.add(tok.trim());
          }
        });
      }
    });
  }

  try {
    // Strategy A: Query 'fcm_tokens' collection by userId (Android app device tokens)
    const fcmTokensQueries = [
      db.collection('fcm_tokens').where('userId', '==', targetUserId)
    ];
    if (idStr && idStr !== targetUserId) {
      fcmTokensQueries.push(db.collection('fcm_tokens').where('userId', '==', idStr));
    }

    const fcmSnapshots = await Promise.all(fcmTokensQueries.map(q => q.get().catch(() => null)));
    fcmSnapshots.forEach(snap => {
      if (snap && !snap.empty) {
        snap.forEach(docSnap => {
          const data = docSnap.data() || {};
          docRefsMap.set(docSnap.ref.path, docSnap.ref);
          if (data.token && typeof data.token === 'string' && data.token.trim()) {
            tokensSet.add(data.token.trim());
          }
        });
      }
    });

    // Strategy B: Direct Document Lookup by ID in 'profiles' and 'users'
    const profileDirectDoc = await db.collection('profiles').doc(idStr).get();
    if (profileDirectDoc.exists) extractTokens(profileDirectDoc);

    const userDirectDoc = await db.collection('users').doc(idStr).get();
    if (userDirectDoc.exists) extractTokens(userDirectDoc);

    // Strategy C: Query 'profiles' collection by matching fields
    const profileQueries = [
      db.collection('profiles').where('id', '==', idStr),
      db.collection('profiles').where('id', '==', isNaN(Number(idStr)) ? idStr : Number(idStr)),
      db.collection('profiles').where('regId', '==', idStr),
      db.collection('profiles').where('registrationId', '==', idStr),
      db.collection('profiles').where('registrationId', '==', isNaN(Number(idStr)) ? idStr : Number(idStr)),
      db.collection('profiles').where('email', '==', idStrLower)
    ];

    const profileSnapshots = await Promise.all(profileQueries.map(q => q.get().catch(() => null)));
    profileSnapshots.forEach(snap => {
      if (snap && !snap.empty) {
        snap.forEach(docSnap => extractTokens(docSnap));
      }
    });

    // Strategy D: Query 'users' collection by matching fields
    const userQueries = [
      db.collection('users').where('id', '==', idStr),
      db.collection('users').where('id', '==', isNaN(Number(idStr)) ? idStr : Number(idStr)),
      db.collection('users').where('email', '==', idStrLower)
    ];

    const userSnapshots = await Promise.all(userQueries.map(q => q.get().catch(() => null)));
    userSnapshots.forEach(snap => {
      if (snap && !snap.empty) {
        snap.forEach(docSnap => extractTokens(docSnap));
      }
    });

  } catch (error) {
    functions.logger.error('Error fetching FCM tokens for user:', targetUserId, error);
  }

  return {
    tokens: Array.from(tokensSet),
    docRefs: Array.from(docRefsMap.values())
  };
}

/**
 * Helper: Clean up invalid or unregistered FCM tokens from Firestore documents
 */
async function removeInvalidTokens(docRefs, invalidTokens) {
  if (!docRefs || docRefs.length === 0 || !invalidTokens || invalidTokens.length === 0) return;

  const invalidSet = new Set(invalidTokens);

  for (const docRef of docRefs) {
    try {
      const docSnap = await docRef.get();
      if (!docSnap.exists) continue;

      const data = docSnap.data();
      const updates = {};

      if (data.fcmToken && invalidSet.has(data.fcmToken)) {
        updates.fcmToken = admin.firestore.FieldValue.delete();
      }

      if (Array.isArray(data.fcmTokens)) {
        const cleaned = data.fcmTokens.filter(t => !invalidSet.has(t));
        if (cleaned.length !== data.fcmTokens.length) {
          updates.fcmTokens = cleaned;
        }
      }

      if (Object.keys(updates).length > 0) {
        await docRef.update(updates);
        functions.logger.info(`Cleaned invalid FCM tokens from document: ${docRef.path}`);
      }
    } catch (err) {
      functions.logger.error(`Error cleaning invalid tokens for ${docRef.path}:`, err);
    }
  }
}

/**
 * ---------------------------------------------------------------------------------
 * TRIGGER 1: Automatic FCM Push Notification when a document is created in
 * 'notifications/{notificationId}' collection.
 *
 * This covers all notification creation from the website & admin panel:
 * - Express interest ('interest')
 * - Accept interest ('accepted')
 * - Profile visit ('view')
 * - Direct message ('message')
 * - Admin announcements ('admin')
 * ---------------------------------------------------------------------------------
 */
exports.onNotificationCreated = functions.firestore
  .document('notifications/{notificationId}')
  .onCreate(async (snapshot, context) => {
    const notificationData = snapshot.data();
    const notificationId = context.params.notificationId;

    if (!notificationData) {
      functions.logger.warn('Empty notification snapshot received:', notificationId);
      return null;
    }

    const targetUserId = notificationData.targetUserId || notificationData.receiverId || notificationData.profileId;
    if (!targetUserId) {
      functions.logger.warn('Notification missing targetUserId:', notificationId, notificationData);
      return null;
    }

    // Retrieve FCM tokens for the recipient
    const { tokens, docRefs } = await getTokensForUser(targetUserId);

    if (tokens.length === 0) {
      functions.logger.info(`No FCM tokens found for targetUserId: ${targetUserId} (notificationId: ${notificationId})`);
      return null;
    }

    const title = notificationData.type === 'message'
      ? 'New Message'
      : (notificationData.title || 'Sambodhi Sarang Notification');

    const body = notificationData.type === 'message'
      ? 'You have received a new message.'
      : (notificationData.text || notificationData.message || notificationData.body || 'You have a new update on Sambodhi Sarang.');

    const type = notificationData.type || 'general';
    const senderName = notificationData.senderName || '';
    const senderId = notificationData.senderId || notificationData.visitorId || notificationData.profileId || '';
    const senderAvatar = notificationData.senderAvatar || notificationData.senderPhoto || '';

    // Determine deep link navigation target based on notification type and sender
    let targetRoute = '/';
    let targetScreen = 'home';
    const targetProfileId = senderId || '';

    if (type === 'view') {
      // Profile Visited -> open the candidate's profile directly
      targetRoute = senderId ? `/profile/${senderId}` : '/notifications';
      targetScreen = 'profile';
    } else if (type === 'interest') {
      // New Interest -> open the candidate's profile directly (view photos, biodata & accept/decline)
      targetRoute = senderId ? `/profile/${senderId}` : '/interests';
      targetScreen = 'profile';
    } else if (type === 'accepted') {
      // Interest Accepted -> open the candidate's profile or interests
      targetRoute = senderId ? `/profile/${senderId}` : '/interests';
      targetScreen = senderId ? 'profile' : 'interests';
    } else if (type === 'message') {
      // New Message -> open messages
      targetRoute = '/messages';
      targetScreen = 'messages';
    } else {
      targetRoute = '/notifications';
      targetScreen = 'notifications';
    }

    const fullUrl = `https://sambodhisarang.com${targetRoute}`;

    // Construct FCM Multicast Message Payload
    const payload = {
      tokens: tokens,
      notification: {
        title: title,
        body: body,
        ...(senderAvatar && notificationData.type !== 'message' ? { imageUrl: senderAvatar } : {})
      },
      data: {
        notificationId: String(notificationId),
        type: String(type),
        targetUserId: String(targetUserId),
        senderId: String(senderId),
        senderName: String(senderName),
        profileId: String(targetProfileId),
        targetProfileId: String(targetProfileId),
        route: String(targetRoute),
        path: String(targetRoute),
        screen: String(targetScreen),
        targetScreen: String(targetScreen),
        url: String(fullUrl),
        link: String(fullUrl),
        timestamp: String(Date.now())
      },
      webpush: {
        fcmOptions: {
          link: fullUrl
        }
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
          priority: 'max',
          visibility: 'public'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            contentAvailable: true
          }
        }
      }
    };

    try {
      functions.logger.info(`Sending FCM push notification to targetUserId: ${targetUserId} (${tokens.length} token[s])`);
      const response = await messaging.sendEachForMulticast(payload);

      functions.logger.info(`FCM Multicast result - Success: ${response.successCount}, Failure: ${response.failureCount}`);

      // Handle token cleanup if any invalid tokens failed
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const errCode = resp.error.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(tokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await removeInvalidTokens(docRefs, invalidTokens);
        }
      }

      return { success: true, sentCount: response.successCount };
    } catch (error) {
      functions.logger.error('Error sending FCM push notification:', error);
      return null;
    }
  });

/**
 * ---------------------------------------------------------------------------------
 * TRIGGER 2: Automatic FCM Push Notification when a new message is added to a thread
 * in 'chats/{chatId}' collection.
 * Privacy-safe: Exposes NO private message text in the push notification body.
 * ---------------------------------------------------------------------------------
 */
exports.onChatUpdated = functions.firestore
  .document('chats/{chatId}')
  .onWrite(async (change, context) => {
    const chatId = context.params.chatId;
    if (!change.after.exists) return null;

    const afterData = change.after.data();
    const beforeData = change.before.exists ? change.before.data() : {};

    const newMessages = afterData.messages || [];
    const oldMessages = beforeData.messages || [];

    // If no new messages were added
    if (newMessages.length <= oldMessages.length) return null;

    // Get the latest message
    const latestMsg = newMessages[newMessages.length - 1];
    if (!latestMsg || !latestMsg.senderId) return null;

    // Calculate recipient ID from chatId (which is structured as user1_user2)
    const chatParticipants = chatId.split('_');
    const senderId = String(latestMsg.senderId).toLowerCase();
    const recipientId = chatParticipants.find(id => String(id).toLowerCase() !== senderId);

    if (!recipientId) return null;

    // Fetch sender profile details for data payload routing
    let senderName = '';
    try {
      const senderDoc = await db.collection('profiles').doc(latestMsg.senderId).get();
      if (senderDoc.exists && senderDoc.data().name) {
        senderName = senderDoc.data().name;
      }
    } catch (e) {}

    const { tokens, docRefs } = await getTokensForUser(recipientId);
    if (tokens.length === 0) return null;

    const chatUrl = 'https://sambodhisarang.com/messages';

    // Privacy-Safe FCM Payload (Generic Title & Body)
    const payload = {
      tokens: tokens,
      notification: {
        title: 'New Message',
        body: 'You have received a new message.'
      },
      data: {
        chatId: String(chatId),
        type: 'message',
        senderId: String(latestMsg.senderId),
        senderName: String(senderName),
        targetUserId: String(recipientId),
        route: '/messages',
        path: '/messages',
        screen: 'messages',
        targetScreen: 'messages',
        url: chatUrl,
        link: chatUrl,
        timestamp: String(Date.now())
      },
      webpush: {
        fcmOptions: {
          link: chatUrl
        }
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        },
        fcmOptions: {
          link: chatUrl
        }
      }
    };

    try {
      const response = await messaging.sendEachForMulticast(payload);
      functions.logger.info(`Chat FCM push sent to recipient ${recipientId} - Success: ${response.successCount}`);
      
      if (response.failureCount > 0) {
        const invalidTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const code = resp.error.code;
            if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
        if (invalidTokens.length > 0) await removeInvalidTokens(docRefs, invalidTokens);
      }
    } catch (err) {
      functions.logger.error(`Error sending Chat FCM push to ${recipientId}:`, err);
    }

    return null;
  });

/**
 * ---------------------------------------------------------------------------------
 * CALLABLE FUNCTION: sendDirectPushNotification
 * Allows admin dashboard or backend triggers to send direct FCM push notifications.
 * ---------------------------------------------------------------------------------
 */
exports.sendDirectPushNotification = functions.https.onCall(async (data, context) => {
  const { targetUserId, title, body, customData } = data || {};

  if (!targetUserId || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required parameters: targetUserId, title, body.'
    );
  }

  const { tokens, docRefs } = await getTokensForUser(targetUserId);
  if (tokens.length === 0) {
    return { success: false, message: `No registered FCM tokens found for user ${targetUserId}` };
  }

  const payload = {
    tokens: tokens,
    notification: { title, body },
    data: Object.assign({}, customData || {}, {
      targetUserId: String(targetUserId)
    }),
    android: {
      priority: 'high',
      notification: { sound: 'default', channelId: 'high_importance_channel' }
    },
    apns: {
      payload: { aps: { sound: 'default', badge: 1 } }
    }
  };

  try {
    const response = await messaging.sendEachForMulticast(payload);
    if (response.failureCount > 0) {
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error) {
          const code = resp.error.code;
          if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
            invalidTokens.push(tokens[idx]);
          }
        }
      });
      if (invalidTokens.length > 0) await removeInvalidTokens(docRefs, invalidTokens);
    }
    return { success: true, sentCount: response.successCount };
  } catch (err) {
    functions.logger.error('Error in sendDirectPushNotification:', err);
    throw new functions.https.HttpsError('internal', err.message || 'Failed to send FCM push notification.');
  }
});

/**
 * ---------------------------------------------------------------------------------
 * HTTP ENDPOINT: testFcmNotification
 * Allows testing token lookup and push delivery via HTTP GET/POST request.
 * Example: https://<region>-<project>.cloudfunctions.net/testFcmNotification?userId=p_1001
 * ---------------------------------------------------------------------------------
 */
exports.testFcmNotification = functions.https.onRequest(async (req, res) => {
  const userId = req.query.userId || req.body?.userId;
  if (!userId) {
    res.status(400).json({ error: 'Please provide ?userId=XYZ query param.' });
    return;
  }

  const { tokens } = await getTokensForUser(userId);
  res.status(200).json({
    targetUserId: userId,
    tokensFound: tokens.length,
    tokens: tokens,
    status: tokens.length > 0 ? 'FCM tokens located ready for push.' : 'No FCM tokens found in profiles/users.'
  });
});
