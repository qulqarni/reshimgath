import { db, storage, isFirebaseConfigured } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Collection Constants
const PROFILES_COLLECTION = 'profiles';
const HOME_CONTENT_COLLECTION = 'site_content';
const STORIES_COLLECTION = 'success_stories';
const INQUIRIES_COLLECTION = 'inquiries';
const CHATS_COLLECTION = 'chats';
const INTERESTS_COLLECTION = 'interests';
const PROFILE_VIEWS_COLLECTION = 'profile_views';
const NOTIFICATIONS_COLLECTION = 'notifications';

// -------------------------------------------------------------
// FIRESTORE PROFILES API
// -------------------------------------------------------------

/**
 * Fetch all matrimonial profiles from Firestore
 */
export const fetchProfilesFromFirestore = async () => {
  if (!isFirebaseConfigured) {
    console.info('Firebase not configured. Operating in fallback mock mode.');
    return null;
  }
  try {
    const querySnapshot = await getDocs(collection(db, PROFILES_COLLECTION));
    const profilesList = [];
    querySnapshot.forEach((docSnap) => {
      profilesList.push({ id: docSnap.id, ...docSnap.data() });
    });
    return profilesList;
  } catch (error) {
    console.error('Error fetching profiles from Firestore:', error);
    return null;
  }
};

/**
 * Save or update a member profile in Firestore
 */
export const saveProfileToFirestore = async (profileId, profileData) => {
  if (!isFirebaseConfigured) return true;
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, profileId);
    await setDoc(profileRef, {
      ...profileData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving profile to Firestore:', error);
    return false;
  }
};

/**
 * Delete a profile from Firestore
 */
export const deleteProfileFromFirestore = async (profileId) => {
  if (!isFirebaseConfigured) return true;
  try {
    await deleteDoc(doc(db, PROFILES_COLLECTION, profileId));
    return true;
  } catch (error) {
    console.error('Error deleting profile from Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIREBASE STORAGE: BIODATA PDF MANAGEMENT
// -------------------------------------------------------------

/**
 * Upload a Member Biodata PDF file to Firebase Storage
 * Store location: biodatas/{userId}/{fileName}
 * @param {File} file - PDF file object
 * @param {string} userId - Member user ID
 * @returns {Promise<string|null>} - Public Download URL of the uploaded PDF
 */
export const uploadBiodataPdfToFirebase = async (file, userId = 'guest') => {
  if (!isFirebaseConfigured) {
    console.info('Firebase Storage keys missing. Simulating PDF upload URL.');
    // Simulated fallback download URL for instant testing
    return URL.createObjectURL(file);
  }

  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `biodatas/${userId}/${fileName}`);
    
    // Upload file bytes to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: 'application/pdf'
    });

    // Get public downloadable URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading PDF to Firebase Storage:', error);
    throw error;
  }
};

/**
 * Delete a Biodata PDF from Firebase Storage
 */
export const deleteBiodataPdfFromFirebase = async (pdfUrl) => {
  if (!isFirebaseConfigured || !pdfUrl.includes('firebasestorage')) return true;
  try {
    const storageRef = ref(storage, pdfUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting PDF from Firebase Storage:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE HOMEPAGE CONTENT & SUCCESS STORIES
// -------------------------------------------------------------

/**
 * Fetch Homepage Content from Firestore
 */
export const fetchHomeContentFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const docSnap = await getDoc(doc(db, HOME_CONTENT_COLLECTION, 'homepage'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching homepage content from Firestore:', error);
    return null;
  }
};

/**
 * Save Homepage Content to Firestore
 */
export const saveHomeContentToFirestore = async (contentData) => {
  if (!isFirebaseConfigured) return true;
  try {
    await setDoc(doc(db, HOME_CONTENT_COLLECTION, 'homepage'), {
      ...contentData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving homepage content to Firestore:', error);
    return false;
  }
};

/**
 * Fetch Success Stories from Firestore
 */
export const fetchSuccessStoriesFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const querySnapshot = await getDocs(collection(db, STORIES_COLLECTION));
    const storiesList = [];
    querySnapshot.forEach((docSnap) => {
      storiesList.push({ id: docSnap.id, ...docSnap.data() });
    });
    return storiesList.length > 0 ? storiesList : null;
  } catch (error) {
    console.error('Error fetching success stories from Firestore:', error);
    return null;
  }
};

/**
 * Save or update a Success Story in Firestore
 */
export const saveSuccessStoryToFirestore = async (storyData) => {
  if (!isFirebaseConfigured || !storyData) return true;
  try {
    const docId = String(storyData.id || Date.now());
    await setDoc(doc(db, STORIES_COLLECTION, docId), {
      ...storyData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving success story to Firestore:', error);
    return null;
  }
};

/**
 * Delete a Success Story from Firestore
 */
export const deleteSuccessStoryFromFirestore = async (storyId) => {
  if (!isFirebaseConfigured) return true;
  try {
    await deleteDoc(doc(db, STORIES_COLLECTION, String(storyId)));
    return true;
  } catch (error) {
    console.error('Error deleting success story from Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE CHATS & MESSAGES API
// -------------------------------------------------------------

/**
 * Fetch all conversation chats from Firestore
 */
export const fetchChatsFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const querySnapshot = await getDocs(collection(db, CHATS_COLLECTION));
    const chatsMap = {};
    querySnapshot.forEach((docSnap) => {
      chatsMap[docSnap.id] = docSnap.data().messages || [];
    });
    return chatsMap;
  } catch (error) {
    console.error('Error fetching chats from Firestore:', error);
    return null;
  }
};

/**
 * Save or update a conversation thread in Firestore
 * @param {string} convoKey - e.g. "demo_f2_demo_m1"
 * @param {Array} messages - Array of message objects
 */
export const saveChatToFirestore = async (convoKey, messages) => {
  if (!isFirebaseConfigured || !convoKey) return true;
  try {
    const chatRef = doc(db, CHATS_COLLECTION, convoKey);
    const participants = convoKey.split('_');
    await setDoc(
      chatRef,
      {
        convoKey,
        participants,
        messages,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving chat to Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE INTERESTS API
// -------------------------------------------------------------

/**
 * Fetch global interests from Firestore
 */
export const fetchInterestsFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const docSnap = await getDoc(doc(db, INTERESTS_COLLECTION, 'global'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching interests from Firestore:', error);
    return null;
  }
};

/**
 * Save global interests to Firestore
 */
export const saveInterestsToFirestore = async (interestsData) => {
  if (!isFirebaseConfigured) return true;
  try {
    await setDoc(
      doc(db, INTERESTS_COLLECTION, 'global'),
      {
        ...interestsData,
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving interests to Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE PROFILE VIEWS & NOTIFICATIONS API
// -------------------------------------------------------------

/**
 * Save a profile view record to Firestore
 */
export const saveProfileViewToFirestore = async (viewEntry) => {
  if (!isFirebaseConfigured || !viewEntry) return true;
  try {
    const docId = `${viewEntry.visitorId}_${viewEntry.targetId}`;
    await setDoc(doc(db, PROFILE_VIEWS_COLLECTION, docId), {
      ...viewEntry,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving profile view to Firestore:', error);
    return false;
  }
};

/**
 * Save a notification record to Firestore
 */
export const saveNotificationToFirestore = async (notificationData) => {
  if (!isFirebaseConfigured || !notificationData) return true;
  try {
    const docId = String(notificationData.id || Date.now());
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, docId), {
      ...notificationData,
      createdAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving notification to Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// REAL-TIME FIRESTORE ONSNAPSHOT LISTENERS
// -------------------------------------------------------------

export const subscribeToProfilesFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(collection(db, PROFILES_COLLECTION), (snapshot) => {
      const profilesList = [];
      snapshot.forEach((docSnap) => {
        profilesList.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(profilesList);
    });
  } catch (error) {
    console.error('Error subscribing to profiles in Firestore:', error);
    return () => {};
  }
};

export const subscribeToChatsFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(collection(db, CHATS_COLLECTION), (snapshot) => {
      const chatsMap = {};
      snapshot.forEach((docSnap) => {
        chatsMap[docSnap.id] = docSnap.data().messages || [];
      });
      callback(chatsMap);
    });
  } catch (error) {
    console.error('Error subscribing to chats in Firestore:', error);
    return () => {};
  }
};

export const subscribeToInterestsFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(doc(db, INTERESTS_COLLECTION, 'global'), (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    });
  } catch (error) {
    console.error('Error subscribing to interests in Firestore:', error);
    return () => {};
  }
};

export const subscribeToProfileViewsFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(collection(db, PROFILE_VIEWS_COLLECTION), (snapshot) => {
      const viewsList = [];
      snapshot.forEach((docSnap) => {
        viewsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(viewsList);
    });
  } catch (error) {
    console.error('Error subscribing to profile views in Firestore:', error);
    return () => {};
  }
};

export const subscribeToNotificationsFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(collection(db, NOTIFICATIONS_COLLECTION), (snapshot) => {
      const notificationsList = [];
      snapshot.forEach((docSnap) => {
        notificationsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      notificationsList.sort((a, b) => (b.id || 0) - (a.id || 0));
      callback(notificationsList);
    });
  } catch (error) {
    console.error('Error subscribing to notifications in Firestore:', error);
    return () => {};
  }
};
