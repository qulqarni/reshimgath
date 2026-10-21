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
  where,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { compressImageToFile, compressBiodataImageToFile } from '../utils/imageCompressor';
import { doesProfileHavePhone, isSamePhoneNumber } from '../utils/phoneUtils';
import { CURRENT_TERMS_VERSION, hasAcceptedTerms, createTermsAcceptanceRecord } from '../utils/termsEnforcement';
import { 
  validateImageFile, 
  validateBiodataFile, 
  verifyUploadPermission 
} from '../utils/mediaValidator';

// Collection Constants
const PROFILES_COLLECTION = 'profiles';
const HOME_CONTENT_COLLECTION = 'site_content';
const STORIES_COLLECTION = 'success_stories';
const INQUIRIES_COLLECTION = 'inquiries';
const PLANS_COLLECTION = 'subscription_plans';
const CHATS_COLLECTION = 'chats';
const INTERESTS_COLLECTION = 'interests';
const PROFILE_VIEWS_COLLECTION = 'profile_views';
const NOTIFICATIONS_COLLECTION = 'notifications';
const REPORTS_COLLECTION = 'reports';
const TERMS_COLLECTION = 'terms_acceptances';
const DELETION_REQUESTS_COLLECTION = 'deletion_requests';
const DELETION_LOGS_COLLECTION = 'deletion_logs';
const FEEDBACKS_COLLECTION = 'feedbacks';
const EVENTS_COLLECTION = 'events';
const GALLERY_COLLECTION = 'gallery';

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

/**
 * Find a specific member profile in Firestore by email, phone, or registration ID (O(1) indexed query)
 */
export const findProfileInFirestore = async (identifier) => {
  if (!isFirebaseConfigured || !identifier) return null;
  try {
    const rawId = String(identifier).trim();
    const cleanId = rawId.toLowerCase();

    // 1. Direct document key lookup
    const docRef = doc(db, PROFILES_COLLECTION, rawId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    // 2. Query by email
    if (cleanId.includes('@')) {
      const qEmail = query(collection(db, PROFILES_COLLECTION), where('email', '==', rawId), limit(1));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        const d = snapEmail.docs[0];
        return { id: d.id, ...d.data() };
      }
      const qEmailLower = query(collection(db, PROFILES_COLLECTION), where('email', '==', cleanId), limit(1));
      const snapEmailLower = await getDocs(qEmailLower);
      if (!snapEmailLower.empty) {
        const d = snapEmailLower.docs[0];
        return { id: d.id, ...d.data() };
      }
    }

    // 3. Query by phone
    const cleanPhone = rawId.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      const qPhone = query(collection(db, PROFILES_COLLECTION), where('phone', '==', rawId), limit(1));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        const d = snapPhone.docs[0];
        return { id: d.id, ...d.data() };
      }
    }

    // 4. Query by registrationId or regId
    const qRegId = query(collection(db, PROFILES_COLLECTION), where('regId', '==', rawId.toUpperCase()), limit(1));
    const snapRegId = await getDocs(qRegId);
    if (!snapRegId.empty) {
      const d = snapRegId.docs[0];
      return { id: d.id, ...d.data() };
    }

    const regNum = parseInt(rawId.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(regNum) && regNum > 0) {
      const qRegNum = query(collection(db, PROFILES_COLLECTION), where('registrationId', '==', regNum), limit(1));
      const snapRegNum = await getDocs(qRegNum);
      if (!snapRegNum.empty) {
        const d = snapRegNum.docs[0];
        return { id: d.id, ...d.data() };
      }
    }

    // 5. Fallback fast scan
    const all = await fetchProfilesFromFirestore();
    if (all && Array.isArray(all)) {
      return all.find(
        (p) =>
          (p.email && p.email.toLowerCase() === cleanId) ||
          doesProfileHavePhone(p, rawId) ||
          (p.id && String(p.id).toLowerCase() === cleanId) ||
          (p.regId && String(p.regId).toLowerCase() === cleanId) ||
          (p.registrationId && String(p.registrationId) === cleanId) ||
          (p.registrationId && `ss-${p.registrationId}`.toLowerCase() === cleanId)
      ) || null;
    }
    return null;
  } catch (err) {
    console.warn('findProfileInFirestore error:', err);
    return null;
  }
};

/**
 * Submit a public web-based account & data deletion request
 * Used by https://sambodhisarang.com/delete-account
 */
export const submitAccountDeletionRequest = async (requestData) => {
  if (!requestData) return false;
  const requestId = requestData.id || `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    ...requestData,
    id: requestId,
    status: requestData.status || 'pending',
    requestedAt: requestData.requestedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(localStorage.getItem('reshimgath_deletion_requests') || '[]');
    localStorage.setItem('reshimgath_deletion_requests', JSON.stringify([payload, ...existing.filter(r => r.id !== requestId)]));
  } catch (e) {}

  if (!isFirebaseConfigured) return payload;

  try {
    await setDoc(doc(db, DELETION_REQUESTS_COLLECTION, requestId), payload, { merge: true });
    return payload;
  } catch (error) {
    console.error('Error submitting deletion request to Firestore:', error);
    return payload;
  }
};

/**
 * Fetch all account deletion requests from Firestore (Admin review)
 */
export const fetchDeletionRequestsFromFirestore = async () => {
  let localList = [];
  try {
    localList = JSON.parse(localStorage.getItem('reshimgath_deletion_requests') || '[]');
  } catch (e) {}

  if (!isFirebaseConfigured) return localList;

  try {
    const querySnapshot = await getDocs(collection(db, DELETION_REQUESTS_COLLECTION));
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    const map = new Map();
    localList.forEach(r => map.set(r.id, r));
    list.forEach(r => map.set(r.id, r));
    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.requestedAt || 0) - new Date(a.requestedAt || 0));
    return merged;
  } catch (error) {
    console.error('Error fetching deletion requests from Firestore:', error);
    return localList;
  }
};

/**
 * Update the status of an account deletion request
 */
export const updateDeletionRequestStatus = async (requestId, status, notes = '') => {
  if (!requestId) return false;
  try {
    const stored = JSON.parse(localStorage.getItem('reshimgath_deletion_requests') || '[]');
    const updated = stored.map(r => r.id === requestId ? { ...r, status, notes, processedAt: new Date().toISOString() } : r);
    localStorage.setItem('reshimgath_deletion_requests', JSON.stringify(updated));
  } catch (e) {}

  if (!isFirebaseConfigured) return true;

  try {
    await updateDoc(doc(db, DELETION_REQUESTS_COLLECTION, requestId), {
      status,
      notes,
      processedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating deletion request status in Firestore:', error);
    return false;
  }
};

/**
 * Permanently and comprehensively delete a user account and associated personal data
 * Handles:
 * 1. Profile document from Firestore
 * 2. Uploaded media (avatar, gallery photos, biodata PDF) from Firebase Storage
 * 3. User's interest records (sent & received)
 * 4. User's notifications
 * 5. Statutory compliance audit log in deletion_logs (180-day audit retention)
 * 6. Local storage cleanup
 */
export const deleteUserAccount = async (userId, options = {}) => {
  if (!userId) return false;
  const idStr = String(userId);

  try {
    // 1. Fetch profile to discover storage URLs
    let profileData = null;
    if (isFirebaseConfigured) {
      try {
        const snap = await getDoc(doc(db, PROFILES_COLLECTION, idStr));
        if (snap.exists()) {
          profileData = snap.data();
        }
      } catch (e) {
        console.warn('Could not fetch profile before deletion:', e);
      }
    }

    // 2. Delete storage files (avatar, photos, biodataPdf)
    if (profileData && isFirebaseConfigured) {
      const urlsToDelete = [];
      if (profileData.avatar && typeof profileData.avatar === 'string' && profileData.avatar.includes('firebasestorage')) {
        urlsToDelete.push(profileData.avatar);
      }
      if (Array.isArray(profileData.photos)) {
        profileData.photos.forEach(p => {
          const u = typeof p === 'string' ? p : p?.url;
          if (u && u.includes('firebasestorage')) urlsToDelete.push(u);
        });
      }
      if (profileData.biodataPdf) {
        const bUrl = typeof profileData.biodataPdf === 'string' ? profileData.biodataPdf : profileData.biodataPdf.fileUrl;
        if (bUrl && bUrl.includes('firebasestorage')) urlsToDelete.push(bUrl);
      }

      for (const u of urlsToDelete) {
        try {
          await deleteObject(ref(storage, u));
        } catch (storageErr) {
          console.warn('Storage file deletion error during account purge:', storageErr);
        }
      }
    }

    // 3. Delete profile document from Firestore
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, PROFILES_COLLECTION, idStr));
      } catch (err) {
        console.error('Error deleting profile document from Firestore:', err);
      }
    }

    // 4. Record statutory compliance audit log in deletion_logs
    if (isFirebaseConfigured) {
      try {
        const logId = `log_${Date.now()}_${idStr.slice(-6)}`;
        await setDoc(doc(db, DELETION_LOGS_COLLECTION, logId), {
          id: logId,
          deletedUserId: idStr,
          timestamp: new Date().toISOString(),
          requestedBy: options.requestedBy || 'user',
          reason: options.reason || 'user_requested_deletion',
          status: 'completed'
        });
      } catch (logErr) {
        console.warn('Error recording deletion audit log in Firestore:', logErr);
      }
    }

    // 5. Clean up localStorage
    try {
      const deletedSaved = JSON.parse(localStorage.getItem('reshimgath_deleted_profiles') || '[]');
      if (!deletedSaved.includes(idStr)) {
        localStorage.setItem('reshimgath_deleted_profiles', JSON.stringify([...deletedSaved, idStr]));
      }

      const storedProfiles = JSON.parse(localStorage.getItem('reshimgath_profiles') || '[]');
      const filteredProfiles = storedProfiles.filter(p => String(p.id) !== idStr);
      localStorage.setItem('reshimgath_profiles', JSON.stringify(filteredProfiles));

      const storedInterests = JSON.parse(localStorage.getItem('reshimgath_interests') || '{"sent":[],"received":[],"unlockedConnections":[]}');
      storedInterests.sent = (storedInterests.sent || []).filter(item => {
        const sId = typeof item === 'string' ? item : (item.senderId || item.user1);
        const tId = typeof item === 'string' ? item : (item.targetUserId || item.profileId || item.user2);
        return String(sId) !== idStr && String(tId) !== idStr;
      });
      storedInterests.received = (storedInterests.received || []).filter(item => {
        const sId = typeof item === 'string' ? item : (item.senderId || item.user1);
        const tId = typeof item === 'string' ? item : (item.targetUserId || item.profileId || item.user2);
        return String(sId) !== idStr && String(tId) !== idStr;
      });
      localStorage.setItem('reshimgath_interests', JSON.stringify(storedInterests));

      const storedNotifs = JSON.parse(localStorage.getItem('reshimgath_notifications') || '[]');
      const filteredNotifs = storedNotifs.filter(n => String(n.profileId) !== idStr && String(n.userId) !== idStr);
      localStorage.setItem('reshimgath_notifications', JSON.stringify(filteredNotifs));
    } catch (localErr) {
      console.warn('Local storage cleanup warning:', localErr);
    }

    return true;
  } catch (error) {
    console.error('Fatal error during deleteUserAccount:', error);
    return false;
  }
};

/**
 * Check if a phone number or email is already registered in Firestore profiles collection
 */
export const checkExistingUserInFirestore = async (email, phone) => {
  if (!isFirebaseConfigured) return { emailExists: false, phoneExists: false };
  try {
    const profiles = await fetchProfilesFromFirestore();
    if (!profiles || !Array.isArray(profiles)) {
      return { emailExists: false, phoneExists: false };
    }
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    let emailExists = false;
    let phoneExists = false;

    for (const p of profiles) {
      if (cleanEmail && p.email && String(p.email).trim().toLowerCase() === cleanEmail) {
        emailExists = true;
      }
      if (phone && doesProfileHavePhone(p, phone)) {
        phoneExists = true;
      }
      if (emailExists && phoneExists) break;
    }
    return { emailExists, phoneExists };
  } catch (error) {
    console.error('Error checking existing user in Firestore:', error);
    return { emailExists: false, phoneExists: false };
  }
};

/**
 * Check if a mobile number is already registered in Firestore
 */
export const isPhoneNumberRegisteredInFirestore = async (phoneNumber) => {
  if (!isFirebaseConfigured || !phoneNumber) return false;
  try {
    const profiles = await fetchProfilesFromFirestore();
    if (!profiles || !Array.isArray(profiles)) return false;
    return profiles.some((p) => doesProfileHavePhone(p, phoneNumber));
  } catch (error) {
    console.error('Error checking phone registration in Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIREBASE STORAGE: FILES & PHOTOS MANAGEMENT
// -------------------------------------------------------------

/**
 * Core helper function to upload any File to Firebase Storage and return its public download URL
 * @param {File} file - Browser File object
 * @param {string} storagePath - Relative path inside Firebase Storage (e.g. photos/user_123/16000000_pic.jpg)
 * @param {string} customContentType - Optional MIME type override
 * @returns {Promise<string>} Public HTTPS Download URL
 */
export const uploadFileToFirebaseStorage = async (file, storagePath, customContentType = null) => {
  if (!isFirebaseConfigured) {
    console.info('Firebase Storage not configured. Falling back to local Object URL.');
    return URL.createObjectURL(file);
  }

  try {
    const storageRef = ref(storage, storagePath);
    const contentType = customContentType || file.type || 'application/octet-stream';
    
    // Upload raw file bytes to Firebase Storage
    const snapshot = await uploadBytes(storageRef, file, { contentType });

    // Retrieve public HTTPS Download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading file to Firebase Storage (${storagePath}):`, error);
    throw error;
  }
};

/**
 * Upload a Member Biodata PDF or Image file to Firebase Storage
 * Store location: biodatas/{userId}/{timestamp}_{fileName}
 * Requires user to have accepted the current Terms of Use and Community Safety Rules.
 * @param {File} file - PDF or Image file object
 * @param {string} userId - Member user ID
 * @param {object|null} userObj - User profile object for terms validation
 * @returns {Promise<string>} - Public Download URL of the uploaded file
 */
export const uploadBiodataPdfToFirebase = async (file, userId = 'guest', userObj = null) => {
  // Enforce upload permission verification on backend: user can only upload for themselves unless admin
  if (userObj) {
    const perm = verifyUploadPermission(userId, userObj);
    if (!perm.isAuthorized) {
      throw new Error(`UPLOAD_PERMISSION_DENIED: ${perm.reason}`);
    }
  }

  // Enforce Terms of Use and Community Safety Rules acceptance on backend
  if (userObj && !hasAcceptedTerms(userObj)) {
    throw new Error('TERMS_ACCEPTANCE_REQUIRED: You must explicitly accept the Terms of Use and Community Safety Rules before uploading your biodata.');
  }

  // Enforce strict MIME type, extension, and file size validation (< 15MB)
  const validation = validateBiodataFile(file);
  if (!validation.isValid) {
    throw new Error(`INVALID_MEDIA_FILE: ${validation.error}`);
  }

  let fileToUpload = file;
  const isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));

  // If biodata is an image (JPG/PNG/WEBP), compress with high resolution so fine text remains sharp
  if (!isPdf && file && (file.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(file.name || ''))) {
    try {
      fileToUpload = await compressBiodataImageToFile(file);
    } catch (compressErr) {
      console.warn('Biodata image compression fallback:', compressErr);
    }
  }

  const cleanName = fileToUpload.name ? fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'biodata';
  const fileName = `${Date.now()}_${cleanName}`;
  const storagePath = `biodatas/${userId}/${fileName}`;
  const contentType = isPdf ? 'application/pdf' : (fileToUpload.type || 'image/jpeg');

  return await uploadFileToFirebaseStorage(fileToUpload, storagePath, contentType);
};

/**
 * Upload a Member Profile Photo or Gallery Image to Firebase Storage
 * Store location: {folder}/{userId}/{timestamp}_{fileName}
 * Automatically compresses raw photos to lightweight high-fidelity images (~80KB-200KB)
 * Requires user to have accepted the current Terms of Use and Community Safety Rules.
 * @param {File} file - Image file object
 * @param {string} userId - Member user ID
 * @param {string} folder - 'photos' or 'avatars'
 * @param {object|null} userObj - User profile object for terms validation
 * @returns {Promise<string>} - Public Download URL of the uploaded photo
 */
export const uploadPhotoToFirebase = async (file, userId = 'guest', folder = 'photos', userObj = null) => {
  // Enforce upload permission verification on backend: user can only upload for themselves unless admin
  if (userObj) {
    const perm = verifyUploadPermission(userId, userObj);
    if (!perm.isAuthorized) {
      throw new Error(`UPLOAD_PERMISSION_DENIED: ${perm.reason}`);
    }
  }

  // Enforce Terms of Use and Community Safety Rules acceptance on backend
  if (userObj && !hasAcceptedTerms(userObj)) {
    throw new Error('TERMS_ACCEPTANCE_REQUIRED: You must explicitly accept the Terms of Use and Community Safety Rules before uploading photos.');
  }

  // Enforce strict MIME type, extension, and file size validation (< 10MB)
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(`INVALID_MEDIA_FILE: ${validation.error}`);
  }

  let fileToUpload = file;

  // Compress image before uploading - keeps page load fast without compromising visual quality
  if (file && (file.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(file.name || ''))) {
    try {
      const isAvatar = folder === 'avatars';
      fileToUpload = await compressImageToFile(file, {
        maxWidth: isAvatar ? 800 : 1200,
        maxHeight: isAvatar ? 800 : 1200,
        quality: 0.82
      });
    } catch (compressErr) {
      console.warn('Photo compression fallback to original file:', compressErr);
    }
  }

  const cleanName = fileToUpload.name ? fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'photo.jpg';
  const fileName = `${Date.now()}_${cleanName}`;
  const storagePath = `${folder}/${userId}/${fileName}`;
  const contentType = fileToUpload.type || 'image/jpeg';

  return await uploadFileToFirebaseStorage(fileToUpload, storagePath, contentType);
};

/**
 * Securely record user's acceptance of the Terms of Use and Community Safety Rules in Firestore.
 * Updates the user's profile document and creates an immutable audit trail in terms_acceptances collection.
 * @param {string} userId - ID of the member
 * @param {string} version - Terms version accepted (e.g. '2026.1')
 * @returns {Promise<boolean>}
 */
export const recordTermsAcceptanceInFirestore = async (userId, version = CURRENT_TERMS_VERSION) => {
  if (!userId) return false;
  const record = createTermsAcceptanceRecord(userId, version);
  if (!isFirebaseConfigured) return record;

  try {
    const profileRef = doc(db, PROFILES_COLLECTION, String(userId));
    await setDoc(profileRef, {
      termsAcceptedVersion: record.termsAcceptedVersion,
      termsAcceptedAt: record.termsAcceptedAt,
      termsAcceptedServerTimestamp: record.termsAcceptedServerTimestamp,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    const auditRef = doc(db, TERMS_COLLECTION, `${userId}_${version}`);
    await setDoc(auditRef, {
      ...record,
      createdAt: new Date().toISOString()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error('Error recording terms acceptance in Firestore:', error);
    return false;
  }
};

/**
 * Upload a Success Story Photo to Firebase Storage
 * Store location: stories/{timestamp}_{fileName}
 * Automatically compresses story photos to lightweight high-fidelity images (~120KB)
 * @param {File} file - Image file object
 * @returns {Promise<string>} - Public Download URL of the uploaded story photo
 */
export const uploadStoryPhotoToFirebase = async (file) => {
  // Enforce strict MIME type, extension, and file size validation (< 10MB)
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(`INVALID_MEDIA_FILE: ${validation.error}`);
  }

  let fileToUpload = file;

  if (file && (file.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(file.name || ''))) {
    try {
      fileToUpload = await compressImageToFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.82
      });
    } catch (compressErr) {
      console.warn('Story photo compression fallback:', compressErr);
    }
  }

  const cleanName = fileToUpload.name ? fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'story.jpg';
  const fileName = `${Date.now()}_${cleanName}`;
  const storagePath = `stories/${fileName}`;
  const contentType = fileToUpload.type || 'image/jpeg';

  return await uploadFileToFirebaseStorage(fileToUpload, storagePath, contentType);
};

/**
 * Upload a Promotional / Announcement Popup Photo to Firebase Storage
 * Store location: popups/{timestamp}_{fileName}
 * Automatically validates and compresses popup images to lightweight high-fidelity images (~150KB)
 * @param {File} file - Image file object
 * @returns {Promise<string>} - Public Download URL of the uploaded popup photo
 */
export const uploadPopupPhotoToFirebase = async (file) => {
  // Enforce strict MIME type, extension, and file size validation (< 10MB)
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    throw new Error(`INVALID_MEDIA_FILE: ${validation.error}`);
  }

  let fileToUpload = file;

  if (file && (file.type?.startsWith('image/') || /\.(jpe?g|png|webp|bmp)$/i.test(file.name || ''))) {
    try {
      fileToUpload = await compressImageToFile(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85
      });
    } catch (compressErr) {
      console.warn('Popup photo compression fallback:', compressErr);
    }
  }

  const cleanName = fileToUpload.name ? fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'popup.jpg';
  const fileName = `${Date.now()}_${cleanName}`;
  const storagePath = `popups/${fileName}`;
  const contentType = fileToUpload.type || 'image/jpeg';

  return await uploadFileToFirebaseStorage(fileToUpload, storagePath, contentType);
};

/**
 * Delete a Biodata PDF or Photo from Firebase Storage
 */
export const deleteBiodataPdfFromFirebase = async (pdfUrl) => {
  if (!isFirebaseConfigured || !pdfUrl || !pdfUrl.includes('firebasestorage')) return true;
  try {
    const storageRef = ref(storage, pdfUrl);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
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
 * Fetch Subscription Plans from Firestore
 */
export const fetchSubscriptionPlansFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const docSnap = await getDoc(doc(db, PLANS_COLLECTION, 'pricing'));
    if (docSnap.exists() && Array.isArray(docSnap.data().plans)) {
      return docSnap.data().plans;
    }
    return null;
  } catch (error) {
    console.error('Error fetching subscription plans from Firestore:', error);
    return null;
  }
};

/**
 * Save Subscription Plans to Firestore
 */
export const saveSubscriptionPlansToFirestore = async (plansArray) => {
  if (!isFirebaseConfigured) return true;
  try {
    await setDoc(doc(db, PLANS_COLLECTION, 'pricing'), {
      plans: plansArray,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving subscription plans to Firestore:', error);
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

/**
 * Save an unlocked mutual connection record to Firestore
 */
export const saveUnlockedConnectionToFirestore = async (connectionEntry) => {
  if (!isFirebaseConfigured || !connectionEntry) return true;
  try {
    const docRef = doc(db, INTERESTS_COLLECTION, 'global');
    const docSnap = await getDoc(docRef);
    const existing = docSnap.exists() ? (docSnap.data().unlockedConnections || []) : [];
    const exists = existing.some(
      (c) =>
        (String(c.user1).toLowerCase() === String(connectionEntry.user1).toLowerCase() &&
         String(c.user2).toLowerCase() === String(connectionEntry.user2).toLowerCase()) ||
        (String(c.user1).toLowerCase() === String(connectionEntry.user2).toLowerCase() &&
         String(c.user2).toLowerCase() === String(connectionEntry.user1).toLowerCase())
    );
    if (!exists) {
      await setDoc(
        docRef,
        {
          unlockedConnections: [...existing, connectionEntry],
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );
    }
    return true;
  } catch (error) {
    console.error('Error saving unlocked connection to Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE PROFILE VIEWS & NOTIFICATIONS API
// -------------------------------------------------------------

/**
 * Check whether a visitor has already visited a target profile in Firestore
 */
export const isProfileVisitedInFirestore = async (visitorId, targetId) => {
  if (!isFirebaseConfigured || !visitorId || !targetId) return false;
  try {
    const cleanV = String(visitorId).toLowerCase().trim().replace(/^ss-/, '');
    const cleanT = String(targetId).toLowerCase().trim().replace(/^ss-/, '');
    if (!cleanV || !cleanT || cleanV === cleanT) return true;

    const docId = `${cleanV}_${cleanT}`;
    const docRef = doc(db, PROFILE_VIEWS_COLLECTION, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return true;

    const notifDocSnap = await getDoc(doc(db, NOTIFICATIONS_COLLECTION, `view_${cleanV}_${cleanT}`));
    return notifDocSnap.exists();
  } catch (error) {
    console.error('Error checking profile view in Firestore:', error);
    return false;
  }
};

/**
 * Save a unique profile view record (and optional notification) to Firestore.
 * Enforces visitor_user_id + profile_owner_user_id unique constraint.
 */
export const saveProfileViewToFirestore = async (viewEntry, notificationData = null) => {
  if (!isFirebaseConfigured || !viewEntry) return true;
  try {
    const cleanV = String(viewEntry.visitor_user_id || viewEntry.visitorId || '').toLowerCase().trim().replace(/^ss-/, '');
    const cleanT = String(viewEntry.profile_owner_user_id || viewEntry.targetId || viewEntry.targetUserId || '').toLowerCase().trim().replace(/^ss-/, '');

    if (!cleanV || !cleanT || cleanV === cleanT) return false;

    const docId = `${cleanV}_${cleanT}`;
    const viewDocRef = doc(db, PROFILE_VIEWS_COLLECTION, docId);

    // Database-level check before writing
    const existingSnap = await getDoc(viewDocRef);
    if (existingSnap.exists()) {
      return false;
    }

    const payload = {
      id: docId,
      visitor_user_id: viewEntry.visitor_user_id || viewEntry.visitorId,
      visitorId: viewEntry.visitorId || viewEntry.visitor_user_id,
      profile_owner_user_id: viewEntry.profile_owner_user_id || viewEntry.targetId || viewEntry.targetUserId,
      targetUserId: viewEntry.targetId || viewEntry.targetUserId || viewEntry.profile_owner_user_id,
      targetId: viewEntry.targetId || viewEntry.targetUserId || viewEntry.profile_owner_user_id,
      visitorName: viewEntry.visitorName || 'A Member',
      occupation: viewEntry.occupation || 'Professional',
      location: viewEntry.location || 'Maharashtra',
      avatar: viewEntry.avatar || null,
      first_visited_at: viewEntry.first_visited_at || new Date().toISOString(),
      timestamp: viewEntry.timestamp || 'Just now',
      updatedAt: new Date().toISOString()
    };

    await setDoc(viewDocRef, payload, { merge: true });

    if (notificationData) {
      const notifDocId = `view_${cleanV}_${cleanT}`;
      const notifDocRef = doc(db, NOTIFICATIONS_COLLECTION, notifDocId);
      const notifSnap = await getDoc(notifDocRef);
      if (!notifSnap.exists()) {
        await setDoc(notifDocRef, {
          ...notificationData,
          id: notificationData.id || notifDocId,
          docId: notifDocId,
          visitor_user_id: viewEntry.visitor_user_id || viewEntry.visitorId,
          profile_owner_user_id: viewEntry.profile_owner_user_id || viewEntry.targetId || viewEntry.targetUserId,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }
    }

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
    let docId = String(notificationData.docId || notificationData.id || Date.now());

    if (notificationData.type === 'message' && notificationData.messageId) {
      docId = `msg_notif_${notificationData.messageId}`;
      const notifRef = doc(db, NOTIFICATIONS_COLLECTION, docId);
      const notifSnap = await getDoc(notifRef);
      if (notifSnap.exists()) {
        return false;
      }
    }

    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, docId), {
      ...notificationData,
      id: notificationData.id || docId,
      docId: docId,
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

export const subscribeToChatsFromFirestore = (callback, currentUserId = null) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    const cleanUserId = currentUserId ? String(currentUserId).toLowerCase().trim() : null;
    return onSnapshot(collection(db, CHATS_COLLECTION), (snapshot) => {
      const chatsMap = {};
      snapshot.forEach((docSnap) => {
        const docId = docSnap.id;
        if (cleanUserId) {
          const parts = docId.toLowerCase().split('_');
          if (!parts.includes(cleanUserId)) {
            return;
          }
        }
        chatsMap[docId] = docSnap.data().messages || [];
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

// -------------------------------------------------------------
// FIRESTORE INQUIRIES API
// -------------------------------------------------------------

export const fetchInquiriesFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const querySnapshot = await getDocs(collection(db, INQUIRIES_COLLECTION));
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching inquiries from Firestore:', error);
    return null;
  }
};

export const saveInquiryToFirestore = async (inquiryData) => {
  if (!isFirebaseConfigured || !inquiryData || !inquiryData.id) return true;
  try {
    const inquiryRef = doc(db, INQUIRIES_COLLECTION, String(inquiryData.id));
    await setDoc(inquiryRef, inquiryData, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving inquiry to Firestore:', error);
    return false;
  }
};

export const deleteInquiryFromFirestore = async (inquiryId) => {
  if (!isFirebaseConfigured || !inquiryId) return true;
  try {
    const inquiryRef = doc(db, INQUIRIES_COLLECTION, String(inquiryId));
    await deleteDoc(inquiryRef);
    return true;
  } catch (error) {
    console.error('Error deleting inquiry from Firestore:', error);
    return false;
  }
};

export const subscribeToInquiriesFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(collection(db, INQUIRIES_COLLECTION), (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      callback(list);
    });
  } catch (error) {
    console.error('Error subscribing to inquiries in Firestore:', error);
    return () => {};
  }
};

// -------------------------------------------------------------
// FIRESTORE REPORTS & MODERATION API
// -------------------------------------------------------------

export const fetchReportsFromFirestore = async () => {
  if (!isFirebaseConfigured) return null;
  try {
    const querySnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    const list = [];
    querySnapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  } catch (error) {
    console.error('Error fetching reports from Firestore:', error);
    return null;
  }
};

export const saveReportToFirestore = async (reportData) => {
  if (!isFirebaseConfigured || !reportData) return true;
  try {
    const docId = String(reportData.id || `rep_${Date.now()}`);
    const reportRef = doc(db, REPORTS_COLLECTION, docId);
    await setDoc(reportRef, {
      ...reportData,
      id: docId,
      status: reportData.status || 'pending',
      createdAt: reportData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving report to Firestore:', error);
    return false;
  }
};

export const updateReportInFirestore = async (reportId, updateData) => {
  if (!isFirebaseConfigured || !reportId) return true;
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, String(reportId));
    await setDoc(reportRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating report in Firestore:', error);
    return false;
  }
};

export const deleteReportFromFirestore = async (reportId) => {
  if (!isFirebaseConfigured || !reportId) return true;
  try {
    const reportRef = doc(db, REPORTS_COLLECTION, String(reportId));
    await deleteDoc(reportRef);
    return true;
  } catch (error) {
    console.error('Error deleting report from Firestore:', error);
    return false;
  }
};

export const subscribeToReportsFromFirestore = (callback) => {
  if (!isFirebaseConfigured) return () => {};
  try {
    return onSnapshot(collection(db, REPORTS_COLLECTION), (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      callback(list);
    });
  } catch (error) {
    console.error('Error subscribing to reports in Firestore:', error);
    return () => {};
  }
};

export const saveUserBlockedListToFirestore = async (userId, blockedUsers) => {
  if (!isFirebaseConfigured || !userId) return true;
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, String(userId));
    await setDoc(profileRef, {
      blockedUsers: Array.isArray(blockedUsers) ? blockedUsers : [],
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating blockedUsers in Firestore:', error);
    return false;
  }
};

export const removePhotoFromProfileInFirestore = async (profileId, photoUrl) => {
  if (!isFirebaseConfigured || !profileId || !photoUrl) return true;
  try {
    const profileRef = doc(db, PROFILES_COLLECTION, String(profileId));
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return false;
    const data = snap.data();
    const updatedPhotos = (data.photos || []).filter(p => {
      const url = typeof p === 'string' ? p : p?.url;
      return url !== photoUrl;
    });
    const updates = { photos: updatedPhotos, updatedAt: new Date().toISOString() };
    if (data.avatar === photoUrl) {
      updates.avatar = updatedPhotos.length > 0 ? (typeof updatedPhotos[0] === 'string' ? updatedPhotos[0] : updatedPhotos[0]?.url) : null;
    }
    await setDoc(profileRef, updates, { merge: true });
    return true;
  } catch (error) {
    console.error('Error removing photo from profile in Firestore:', error);
    return false;
  }
};

export const deleteChatMessageFromFirestore = async (chatId, messageId) => {
  if (!isFirebaseConfigured || !chatId || !messageId) return true;
  try {
    const chatRef = doc(db, CHATS_COLLECTION, String(chatId));
    const snap = await getDoc(chatRef);
    if (!snap.exists()) return false;
    const messages = snap.data().messages || [];
    const updatedMessages = messages.filter(m => String(m.id) !== String(messageId));
    await setDoc(chatRef, {
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error deleting chat message from Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIREBASE STORAGE MEDIA MIGRATION UTILITY
// -------------------------------------------------------------

/**
 * Convert a Base64 Data URL, relative asset path, or blob URL to a File object
 */
export const urlOrBase64ToFile = async (urlOrStr, defaultFileName = 'file.jpg') => {
  if (!urlOrStr || typeof urlOrStr !== 'string') return null;

  // Case 1: Base64 Data URL
  if (urlOrStr.startsWith('data:')) {
    try {
      const arr = urlOrStr.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], defaultFileName, { type: mime });
    } catch (err) {
      console.error('Error converting base64 to File:', err);
      return null;
    }
  }

  // Case 2: Relative or remote URL (e.g. /profile1.jpg or http...)
  try {
    const res = await fetch(urlOrStr);
    const blob = await res.blob();
    const contentType = blob.type || (defaultFileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    return new File([blob], defaultFileName, { type: contentType });
  } catch (err) {
    console.error(`Failed to fetch asset from URL (${urlOrStr}):`, err);
    return null;
  }
};

/**
 * Scan and migrate all existing profile media (avatars, gallery photos, biodata PDFs) to Firebase Storage
 * @param {Array} profilesList - List of member profiles
 * @param {Function} onProgress - Progress callback function (index, total, currentProfileName)
 * @returns {Promise<{ updatedProfiles: Array, migratedCount: number }>}
 */
export const migrateExistingProfilesToFirebaseStorage = async (profilesList = [], onProgress = null) => {
  if (!isFirebaseConfigured || !Array.isArray(profilesList) || profilesList.length === 0) {
    return { updatedProfiles: profilesList, migratedCount: 0 };
  }

  let totalMigratedFiles = 0;
  const updatedProfiles = [];

  for (let i = 0; i < profilesList.length; i++) {
    const profile = { ...profilesList[i] };
    const pId = profile.id || profile.regId || `profile_${i + 1}`;
    let profileModified = false;

    if (onProgress) {
      onProgress(i + 1, profilesList.length, profile.name || `Profile ${pId}`);
    }

    // 1. Migrate Avatar
    if (profile.avatar && typeof profile.avatar === 'string' && !profile.avatar.includes('firebasestorage.googleapis.com')) {
      try {
        const avatarFile = await urlOrBase64ToFile(profile.avatar, `avatar_${pId}.jpg`);
        if (avatarFile) {
          const storageUrl = await uploadPhotoToFirebase(avatarFile, pId, 'avatars');
          profile.avatar = storageUrl;
          profileModified = true;
          totalMigratedFiles++;
        }
      } catch (err) {
        console.error(`Failed to migrate avatar for profile ${pId}:`, err);
      }
    }

    // 2. Migrate Gallery Photos
    if (Array.isArray(profile.photos) && profile.photos.length > 0) {
      const newPhotos = [];
      for (let j = 0; j < profile.photos.length; j++) {
        const photoUrl = profile.photos[j];
        if (typeof photoUrl === 'string' && photoUrl.trim()) {
          if (!photoUrl.includes('firebasestorage.googleapis.com')) {
            try {
              const photoFile = await urlOrBase64ToFile(photoUrl, `photo_${pId}_${j + 1}.jpg`);
              if (photoFile) {
                const storageUrl = await uploadPhotoToFirebase(photoFile, pId, 'photos');
                newPhotos.push(storageUrl);
                profileModified = true;
                totalMigratedFiles++;
              } else {
                newPhotos.push(photoUrl);
              }
            } catch (err) {
              console.error(`Failed to migrate gallery photo ${j} for profile ${pId}:`, err);
              newPhotos.push(photoUrl);
            }
          } else {
            newPhotos.push(photoUrl);
          }
        }
      }
      profile.photos = newPhotos;
    }

    // 3. Migrate Biodata PDF
    if (profile.biodataPdf && profile.biodataPdf.url && !profile.biodataPdf.url.includes('firebasestorage.googleapis.com')) {
      try {
        const isPdf = profile.biodataPdf.fileType === 'pdf' || profile.biodataPdf.fileName?.toLowerCase().endsWith('.pdf');
        const fileExt = isPdf ? '.pdf' : '.jpg';
        const pdfFile = await urlOrBase64ToFile(profile.biodataPdf.url, profile.biodataPdf.fileName || `biodata_${pId}${fileExt}`);
        if (pdfFile) {
          const storageUrl = await uploadBiodataPdfToFirebase(pdfFile, pId);
          profile.biodataPdf = {
            ...profile.biodataPdf,
            url: storageUrl
          };
          profileModified = true;
          totalMigratedFiles++;
        }
      } catch (err) {
        console.error(`Failed to migrate biodata PDF for profile ${pId}:`, err);
      }
    }

    // If modified, save updated profile to Firestore
    if (profileModified) {
      await saveProfileToFirestore(profile.id || String(pId), profile);
    }

    updatedProfiles.push(profile);
  }

  return { updatedProfiles, migratedCount: totalMigratedFiles };
};

/**
 * Scans all existing profiles in Firestore and compresses existing uncompressed photos
 * Fetches the photo, runs it through compressImageToFile, uploads compressed file, and saves to Firestore.
 * @param {Array} profilesList - List of profiles to check
 * @param {Function} onProgress - Callback (curr, total, name)
 * @returns {Promise<{ updatedCount: number, errorCount: number }>}
 */
export const optimizeAndCompressExistingProfileMedia = async (profilesList = [], onProgress = null) => {
  if (!isFirebaseConfigured || !Array.isArray(profilesList) || profilesList.length === 0) {
    return { updatedCount: 0, errorCount: 0 };
  }

  let updatedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < profilesList.length; i++) {
    const profile = { ...profilesList[i] };
    const pId = profile.id || profile.regId || `profile_${i + 1}`;
    let profileModified = false;

    if (onProgress) {
      onProgress(i + 1, profilesList.length, profile.name || `Profile ${pId}`);
    }

    // 1. Optimize Avatar if present and large
    if (profile.avatar && typeof profile.avatar === 'string' && profile.avatar.startsWith('http') && !profile.avatar.includes('_compressed_')) {
      try {
        const file = await urlOrBase64ToFile(profile.avatar, `avatar_${pId}.jpg`);
        if (file && file.size > 200 * 1024) {
          const compressed = await compressImageToFile(file, { maxWidth: 800, maxHeight: 800, quality: 0.82 });
          const newUrl = await uploadFileToFirebaseStorage(compressed, `avatars/${pId}/${Date.now()}_compressed_avatar.jpg`, 'image/jpeg');
          profile.avatar = newUrl;
          profileModified = true;
          updatedCount++;
        }
      } catch (err) {
        console.warn(`Could not optimize avatar for ${pId}:`, err);
        errorCount++;
      }
    }

    // 2. Optimize Gallery Photos if large
    if (Array.isArray(profile.photos) && profile.photos.length > 0) {
      const newPhotos = [];
      for (let j = 0; j < profile.photos.length; j++) {
        const photoUrl = typeof profile.photos[j] === 'string' ? profile.photos[j] : profile.photos[j]?.url;
        if (photoUrl && typeof photoUrl === 'string' && photoUrl.startsWith('http') && !photoUrl.includes('_compressed_')) {
          try {
            const file = await urlOrBase64ToFile(photoUrl, `photo_${pId}_${j + 1}.jpg`);
            if (file && file.size > 250 * 1024) {
              const compressed = await compressImageToFile(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
              const newUrl = await uploadFileToFirebaseStorage(compressed, `photos/${pId}/${Date.now()}_compressed_photo_${j + 1}.jpg`, 'image/jpeg');
              newPhotos.push(newUrl);
              profileModified = true;
              updatedCount++;
            } else {
              newPhotos.push(photoUrl);
            }
          } catch (err) {
            console.warn(`Could not optimize gallery photo for ${pId}:`, err);
            newPhotos.push(photoUrl);
            errorCount++;
          }
        } else if (photoUrl) {
          newPhotos.push(photoUrl);
        }
      }
      profile.photos = newPhotos;
    }

    if (profileModified) {
      try {
        await saveProfileToFirestore(profile.id || String(pId), profile);
      } catch (saveErr) {
        console.error(`Failed to save updated profile ${pId} to Firestore:`, saveErr);
      }
    }
  }

  return { updatedCount, errorCount };
};

// -------------------------------------------------------------
// FIRESTORE FEEDBACKS API
// -------------------------------------------------------------

export const fetchFeedbacksFromFirestore = async (isAdmin = false) => {
  if (!isFirebaseConfigured) return null;
  try {
    const collRef = collection(db, FEEDBACKS_COLLECTION);
    const q = isAdmin 
      ? query(collRef, orderBy('createdAt', 'desc'))
      : query(collRef, where('status', '==', 'approved'), where('published', '==', true));
    const snapshot = await getDocs(q);
    const list = [];
    snapshot.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...docSnap.data() });
    });
    return list;
  } catch (error) {
    console.error('Error fetching feedbacks from Firestore:', error);
    // Fallback: try simple collection fetch without composite index
    try {
      const snap = await getDocs(collection(db, FEEDBACKS_COLLECTION));
      const list = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
      return isAdmin ? list : list.filter(item => item.status === 'approved' && item.published === true);
    } catch (e) {
      return null;
    }
  }
};

export const saveFeedbackToFirestore = async (feedbackData) => {
  if (!isFirebaseConfigured || !feedbackData) return true;
  try {
    const docId = String(feedbackData.id || `fb_${Date.now()}`);
    await setDoc(doc(db, FEEDBACKS_COLLECTION, docId), {
      ...feedbackData,
      id: docId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving feedback to Firestore:', error);
    return null;
  }
};

export const deleteFeedbackFromFirestore = async (feedbackId) => {
  if (!isFirebaseConfigured || !feedbackId) return true;
  try {
    await deleteDoc(doc(db, FEEDBACKS_COLLECTION, String(feedbackId)));
    return true;
  } catch (error) {
    console.error('Error deleting feedback from Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE UPCOMING EVENTS API
// -------------------------------------------------------------

export const fetchEventsFromFirestore = async (isAdmin = false) => {
  if (!isFirebaseConfigured) return null;
  try {
    const collRef = collection(db, EVENTS_COLLECTION);
    const snap = await getDocs(collRef);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return isAdmin ? list : list.filter(item => item.published !== false);
  } catch (error) {
    console.error('Error fetching events from Firestore:', error);
    return null;
  }
};

export const saveEventToFirestore = async (eventData) => {
  if (!isFirebaseConfigured || !eventData) return true;
  try {
    const docId = String(eventData.id || `ev_${Date.now()}`);
    await setDoc(doc(db, EVENTS_COLLECTION, docId), {
      ...eventData,
      id: docId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving event to Firestore:', error);
    return null;
  }
};

export const deleteEventFromFirestore = async (eventId) => {
  if (!isFirebaseConfigured || !eventId) return true;
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, String(eventId)));
    return true;
  } catch (error) {
    console.error('Error deleting event from Firestore:', error);
    return false;
  }
};

// -------------------------------------------------------------
// FIRESTORE GALLERY API
// -------------------------------------------------------------

export const fetchGalleryFromFirestore = async (isAdmin = false) => {
  if (!isFirebaseConfigured) return null;
  try {
    const collRef = collection(db, GALLERY_COLLECTION);
    const snap = await getDocs(collRef);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order || 0) - (b.order || 0));
    return isAdmin ? list : list.filter(item => item.published !== false);
  } catch (error) {
    console.error('Error fetching gallery from Firestore:', error);
    return null;
  }
};

export const saveGalleryItemToFirestore = async (galleryItem) => {
  if (!isFirebaseConfigured || !galleryItem) return true;
  try {
    const docId = String(galleryItem.id || `gal_${Date.now()}`);
    await setDoc(doc(db, GALLERY_COLLECTION, docId), {
      ...galleryItem,
      id: docId,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return docId;
  } catch (error) {
    console.error('Error saving gallery item to Firestore:', error);
    return null;
  }
};

export const deleteGalleryItemFromFirestore = async (itemId) => {
  if (!isFirebaseConfigured || !itemId) return true;
  try {
    await deleteDoc(doc(db, GALLERY_COLLECTION, String(itemId)));
    return true;
  } catch (error) {
    console.error('Error deleting gallery item from Firestore:', error);
    return false;
  }
};

