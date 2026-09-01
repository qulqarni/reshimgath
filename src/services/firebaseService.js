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
  orderBy 
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
 * Save a Success Story to Firestore
 */
export const saveSuccessStoryToFirestore = async (storyData) => {
  if (!isFirebaseConfigured) return true;
  try {
    const docRef = await addDoc(collection(db, STORIES_COLLECTION), {
      ...storyData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
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
