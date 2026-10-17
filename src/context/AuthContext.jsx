import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { DEMO_PROFILES, DEMO_USER } from '../data/mockProfiles';
import { saveProfileToFirestore, saveUnlockedConnectionToFirestore, saveNotificationToFirestore, checkExistingUserInFirestore, saveUserBlockedListToFirestore, findProfileInFirestore } from '../services/firebaseService';
import { db, isFirebaseConfigured } from '../config/firebase';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { calculateAgeFromDob } from '../utils/ageCalculator';
import { doesProfileHavePhone, isSamePhoneNumber, normalizePhoneNumber } from '../utils/phoneUtils';
import { CURRENT_TERMS_VERSION, hasAcceptedTerms, createTermsAcceptanceRecord } from '../utils/termsEnforcement';

const AuthContext = createContext();

export const ADMIN_USER = {
  id: 'admin_1',
  name: 'Bureau Administrator',
  email: 'pk9823425404@gmail.com',
  password: 'Ganesh@123',
  role: 'admin',
  isAdmin: true,
  gender: 'male',
  district: 'Ichalkaranji',
  verified: true,
  avatar: null,
  photos: []
};

export const getNextRegistrationId = () => {
  try {
    const stored = localStorage.getItem('reshimgath_profiles');
    const profiles = stored ? JSON.parse(stored) : [];
    let maxId = 1000;
    profiles.forEach(p => {
      let num = Number(p.registrationId);
      if ((!num || isNaN(num)) && p.regId) {
        const match = String(p.regId).match(/\d+/);
        if (match) num = Number(match[0]);
      }
      if (num && !isNaN(num) && num > maxId) {
        maxId = num;
      }
    });
    return maxId + 1;
  } catch (e) {
    return 1001;
  }
};

export const getProfileCreationTime = (p) => {
  if (!p) return 0;
  
  if (p.createdAt) {
    if (typeof p.createdAt === 'object' && p.createdAt.seconds) {
      return p.createdAt.seconds * 1000;
    }
    const t = new Date(p.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  const alt = p.registeredAt || p.timestamp;
  if (alt) {
    if (typeof alt === 'object' && alt.seconds) {
      return alt.seconds * 1000;
    }
    const t = new Date(alt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }

  if (p.id && (String(p.id).startsWith('u_') || String(p.id).startsWith('p_'))) {
    const digits = String(p.id).replace(/[^0-9]/g, '');
    const num = Number(digits);
    if (!isNaN(num) && num > 1577836800000) {
      return num;
    }
  }

  return 0;
};

export const getProfileRegNumber = (p) => {
  if (!p) return 0;
  if (p.registrationId && !isNaN(Number(p.registrationId))) {
    return Number(p.registrationId);
  }
  const rawId = String(p.regId || p.id || '').replace(/[^0-9]/g, '');
  const num = parseInt(rawId, 10);
  return !isNaN(num) ? num : 0;
};

export const sortProfilesByLatest = (profilesList) => {
  if (!Array.isArray(profilesList)) return [];
  return [...profilesList].sort((a, b) => {
    // 1. Compare registration timestamps if both have valid creation dates
    const timeA = getProfileCreationTime(a);
    const timeB = getProfileCreationTime(b);
    if (timeA > 0 && timeB > 0 && timeA !== timeB) {
      return timeB - timeA;
    }

    // 2. Compare Profile Registration numbers (e.g., Profile 1033 > 1032 > 1001)
    const regA = getProfileRegNumber(a);
    const regB = getProfileRegNumber(b);
    if (regA !== regB) {
      return regB - regA;
    }

    // 3. If only one has timestamp
    if (timeA > 0 && timeB === 0) return -1;
    if (timeB > 0 && timeA === 0) return 1;

    // 4. Compare timestamp embedded in ID
    const idA = Number(String(a?.id || '').replace(/[^0-9]/g, '')) || 0;
    const idB = Number(String(b?.id || '').replace(/[^0-9]/g, '')) || 0;
    if (idA !== idB) {
      return idB - idA;
    }

    return 0;
  });
};

export const normalizeProfile = (p, defaultIndex = 0) => {
  if (!p) return p;

  let raw = p.gender;
  if (!raw || typeof raw !== 'string') {
    raw = p.lookingFor || p.looking_for || p.seeking || p.matchFor || '';
  }

  let genderVal = 'female';
  if (typeof raw === 'string' && raw.trim() !== '') {
    const lower = raw.toLowerCase().trim();
    if (
      lower === 'female' ||
      lower === 'bride' ||
      lower === 'woman' ||
      lower === 'girl' ||
      lower.includes('female') ||
      lower.includes('bride') ||
      lower.includes('वधू')
    ) {
      genderVal = 'female';
    } else if (
      lower === 'male' ||
      lower === 'groom' ||
      lower === 'man' ||
      lower === 'boy' ||
      lower.includes('groom') ||
      (lower.includes('male') && !lower.includes('female')) ||
      lower.includes('वर')
    ) {
      genderVal = 'male';
    }
  }

  let numId = Number(p.registrationId);
  if (!numId || isNaN(numId) || numId < 1001) {
    if (p.regId) {
      const match = String(p.regId).match(/\d+/);
      if (match && Number(match[0]) >= 1001) {
        numId = Number(match[0]);
      }
    }
  }
  if (!numId || isNaN(numId) || numId < 1001) {
    numId = 1001 + defaultIndex;
  }

  const cleanBauddha = (val) => {
    if (typeof val !== 'string') return val;
    if (val.toLowerCase().trim() === 'bauddha') return 'Buddhist';
    if (/bauddha/i.test(val)) return val.replace(/bauddha/gi, 'Buddhist');
    return val;
  };

  const cleanCaste = cleanBauddha(p.caste);
  const cleanReligion = cleanBauddha(p.religion);
  const cleanCommunity = cleanBauddha(p.community);
  const cleanSubcaste = cleanBauddha(p.subcaste);
  const cleanCustomCaste = cleanBauddha(p.customCaste);
  const cleanCustomReligion = cleanBauddha(p.customReligion);
  const cleanAboutMe = cleanBauddha(p.aboutMe);
  const cleanExpectations = cleanBauddha(p.expectations);
  const cleanPartnerExpectations = cleanBauddha(p.partnerExpectations);

  return {
    ...p,
    ...(cleanCaste !== undefined ? { caste: cleanCaste } : {}),
    ...(cleanReligion !== undefined ? { religion: cleanReligion } : {}),
    ...(cleanCommunity !== undefined ? { community: cleanCommunity } : {}),
    ...(cleanSubcaste !== undefined ? { subcaste: cleanSubcaste } : {}),
    ...(cleanCustomCaste !== undefined ? { customCaste: cleanCustomCaste } : {}),
    ...(cleanCustomReligion !== undefined ? { customReligion: cleanCustomReligion } : {}),
    ...(cleanAboutMe !== undefined ? { aboutMe: cleanAboutMe } : {}),
    ...(cleanExpectations !== undefined ? { expectations: cleanExpectations } : {}),
    ...(cleanPartnerExpectations !== undefined ? { partnerExpectations: cleanPartnerExpectations } : {}),
    gender: genderVal,
    lookingFor: genderVal,
    registrationId: numId,
    regId: `SS-${numId}`,
    blockedUsers: Array.isArray(p.blockedUsers) ? p.blockedUsers : []
  };
};

export const normalizeGender = normalizeProfile;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('reshimgath_user');
      return saved ? normalizeProfile(JSON.parse(saved)) : null;
    } catch (e) {
      return null;
    }
  });

  const [privacyAlert, setPrivacyAlert] = useState(false);

  useEffect(() => {
    if (user) {
      try {
        localStorage.setItem('reshimgath_user', JSON.stringify(user));
      } catch (err) {
        console.warn('localStorage quota exceeded:', err);
      }
    } else {
      localStorage.removeItem('reshimgath_user');
    }
  }, [user]);

  // Register FCM device token via Android Native bridge when running inside Android WebView
  useEffect(() => {
    if (user?.id) {
      try {
        if (
          typeof window !== 'undefined' &&
          window.AndroidNative &&
          typeof window.AndroidNative.registerUserToken === 'function'
        ) {
          window.AndroidNative.registerUserToken(String(user.id));
          console.log('[FCM] Native Android token registered for user:', user.id);
        }
      } catch (err) {
        console.warn('[FCM] Native Android token registration call failed:', err);
      }
    }
  }, [user?.id]);

  // Real-time Firestore sync for logged-in user profile, subscription & unlocked profiles
  useEffect(() => {
    if (!user?.id || user.id === 'admin_1' || !isFirebaseConfigured) return;

    const userDocRef = doc(db, 'profiles', String(user.id));
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const liveData = snap.data();
        setUser((prev) => {
          if (!prev || String(prev.id) !== String(user.id)) return prev;
          const liveSub = liveData.subscription || {};
          const liveUnlocked = liveData.unlockedProfiles || liveSub.unlockedProfiles || [];
          const prevUnlocked = prev.unlockedProfiles || prev.subscription?.unlockedProfiles || [];
          const mergedUnlocked = Array.from(new Set([...prevUnlocked, ...liveUnlocked]));

          const mergedSub = {
            ...(prev.subscription || {}),
            ...liveSub,
            unlockedProfiles: mergedUnlocked
          };

          return {
            ...prev,
            ...liveData,
            subscription: mergedSub,
            unlockedProfiles: mergedUnlocked
          };
        });
      }
    }, (err) => {
      console.warn('Realtime user subscription error:', err);
    });

    return () => unsub();
  }, [user?.id]);

  const login = async (emailOrPhone, password) => {
    const input = (emailOrPhone || '').trim().toLowerCase();
    const pass = (password || '').trim();

    if (!input) {
      return { success: false, message: 'Please enter your registered email or phone number.' };
    }

    // 1. Admin credentials check
    const isInputAdminEmail =
      input === ADMIN_USER.email.toLowerCase() ||
      input === 'pk9823425404@gmail.com' ||
      input === 'admin@sambodhisarang.com' ||
      input === 'admin@reshimgath.com' ||
      input === 'admin';

    if (isInputAdminEmail) {
      if (pass === ADMIN_USER.password || pass === 'Ganesh@123') {
        const normAdmin = normalizeProfile(ADMIN_USER);
        setUser(normAdmin);
        return { success: true, user: normAdmin };
      } else {
        return {
          success: false,
          message: 'Incorrect Admin Password. Access denied to admin panel.'
        };
      }
    }

    // 2. Demo Profiles credentials check
    const matchedDemo = DEMO_PROFILES.find(
      (p) => (p.email && p.email.toLowerCase() === input) || doesProfileHavePhone(p, input)
    );

    if (matchedDemo) {
      const expectedPass = matchedDemo.password || '123456';
      if (pass !== expectedPass) {
        return {
          success: false,
          message: 'Incorrect password. Please check your password and try again.'
        };
      }
      const normDemo = normalizeProfile(matchedDemo);
      setUser(normDemo);
      return { success: true, user: normDemo };
    }

    // 3. Search in cached profiles
    const savedProfiles = getStoredProfilesFast();

    let matchedProfile = savedProfiles.find(
      (p) =>
        (p.email && p.email.toLowerCase() === input) ||
        doesProfileHavePhone(p, input) ||
        (p.id && String(p.id).toLowerCase() === input) ||
        (p.regId && String(p.regId).toLowerCase() === input) ||
        (p.registrationId && String(p.registrationId) === input) ||
        (p.registrationId && `ss-${p.registrationId}`.toLowerCase() === input)
    );

    // 4. If not found in cache, lookup directly in Firestore
    if (!matchedProfile && isFirebaseConfigured) {
      try {
        const firestoreFound = await findProfileInFirestore(input);
        if (firestoreFound) {
          matchedProfile = firestoreFound;
        }
      } catch (err) {
        console.warn('Firestore fallback lookup error during login:', err);
      }
    }

    if (matchedProfile) {
      if (matchedProfile.blocked) {
        return {
          success: false,
          message: 'Your account has been suspended/blocked by bureau administration. Please contact bureau support.'
        };
      }
      const expectedPass = matchedProfile.password || '123456';
      if (pass !== expectedPass) {
        return {
          success: false,
          message: 'Incorrect password. Please check your password and try again.'
        };
      }
      const normMatched = normalizeProfile(matchedProfile);
      setUser(normMatched);

      // Proactively fetch latest profile data from Firestore (source of truth for unlockedProfiles and credits)
      if (isFirebaseConfigured && matchedProfile.id) {
        getDoc(doc(db, 'profiles', String(matchedProfile.id))).then((snap) => {
          if (snap.exists()) {
            const firestoreData = snap.data();
            setUser((prev) => {
              if (!prev || String(prev.id) !== String(matchedProfile.id)) return prev;
              const liveSub = firestoreData.subscription || {};
              const liveUnlocked = firestoreData.unlockedProfiles || liveSub.unlockedProfiles || [];
              const prevUnlocked = prev.unlockedProfiles || prev.subscription?.unlockedProfiles || [];
              const mergedUnlocked = Array.from(new Set([...prevUnlocked, ...liveUnlocked]));
              const mergedSub = {
                ...(prev.subscription || {}),
                ...liveSub,
                unlockedProfiles: mergedUnlocked
              };
              return {
                ...prev,
                ...firestoreData,
                subscription: mergedSub,
                unlockedProfiles: mergedUnlocked
              };
            });
          }
        }).catch((err) => {
          console.warn('Proactive firestore fetch on login:', err);
        });
      }

      return { success: true, user: normMatched };
    }

    // 4. If account does not exist, reject login
    return {
      success: false,
      message: 'Account not found. Please enter valid registered credentials or click "Register New Account".'
    };
  };

  const loginAsDemo = () => {
    if (DEMO_USER) {
      setUser(normalizeProfile(DEMO_USER));
    }
    setPrivacyAlert(false);
  };

  const loginAsAdmin = (email, password) => {
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPass = (password || '').trim();
    return login(inputEmail || ADMIN_USER.email, inputPass);
  };

  const checkExistingUser = useCallback((email, phone) => {
    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if (!cleanEmail && !cleanPhone) {
      return { emailExists: false, phoneExists: false };
    }
    if ((!cleanEmail || !cleanEmail.includes('@')) && (!cleanPhone || cleanPhone.length < 10)) {
      return { emailExists: false, phoneExists: false };
    }

    const allRegistered = getStoredProfilesFast();

    let emailExists = false;
    if (cleanEmail && cleanEmail.includes('@')) {
      emailExists = allRegistered.some(
        (p) => (p.email && String(p.email).trim().toLowerCase() === cleanEmail)
      ) || cleanEmail === ADMIN_USER.email.toLowerCase();
    }

    let phoneExists = false;
    if (cleanPhone && cleanPhone.length >= 10) {
      phoneExists = allRegistered.some((p) => doesProfileHavePhone(p, cleanPhone));
    }

    return { emailExists, phoneExists };
  }, []);

  const checkExistingUserAsync = async (email, phone) => {
    // 1. Local synchronous check
    const localCheck = checkExistingUser(email, phone);
    if (localCheck.emailExists && localCheck.phoneExists) {
      return localCheck;
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    const cleanPhone = phone ? phone.replace(/[^0-9]/g, '') : '';
    if ((!cleanEmail || !cleanEmail.includes('@')) && (!cleanPhone || cleanPhone.length < 10)) {
      return localCheck;
    }

    // 2. Remote Firestore check to guarantee single mobile number registration
    if (isFirebaseConfigured) {
      try {
        const firestoreCheck = await checkExistingUserInFirestore(email, phone);
        return {
          emailExists: localCheck.emailExists || firestoreCheck.emailExists,
          phoneExists: localCheck.phoneExists || firestoreCheck.phoneExists
        };
      } catch (err) {
        console.warn('Async Firestore existing user check error:', err);
      }
    }

    return localCheck;
  };

  const signup = async (signupData) => {
    const inputEmail = (signupData.email || '').trim();
    const inputPhone = (signupData.phone || '').trim();

    if (!inputPhone) {
      return {
        success: false,
        message: 'Mobile Number is required for registration.'
      };
    }

    // Comprehensive local + Firestore check to guarantee 1 mobile number = 1 registration
    const { emailExists, phoneExists } = await checkExistingUserAsync(inputEmail, inputPhone);

    if (emailExists && phoneExists) {
      return {
        success: false,
        message: 'This Email ID and Mobile Number are already registered. Please login to your existing account.'
      };
    }

    if (emailExists) {
      return {
        success: false,
        message: 'This Email ID is already registered. Please login or use a different email address.'
      };
    }

    if (phoneExists) {
      return {
        success: false,
        message: 'This Mobile Number is already registered. Please login or use a different phone number.'
      };
    }

    const regNum = getNextRegistrationId();
    const newUserId = "u_" + Date.now();
    const termsRecord = createTermsAcceptanceRecord(newUserId, CURRENT_TERMS_VERSION);

    const newUser = {
      id: newUserId,
      registrationId: regNum,
      regId: `SS-${regNum}`,
      name: (signupData.name || "").trim(),
      email: inputEmail,
      phone: inputPhone,
      gender: signupData.gender || "female",
      dob: signupData.dob || "",
      age: signupData.age || (signupData.dob ? calculateAgeFromDob(signupData.dob) : ""),
      password: signupData.password || "",
      verified: false,
      termsAcceptedVersion: CURRENT_TERMS_VERSION,
      termsAcceptedAt: termsRecord.termsAcceptedAt,
      termsAcceptedServerTimestamp: termsRecord.termsAcceptedServerTimestamp,
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    try {
      const stored = localStorage.getItem('reshimgath_profiles');
      const profiles = stored ? JSON.parse(stored) : [];
      const updated = sortProfilesByLatest([newUser, ...profiles.filter(p => p.id !== newUser.id)]);
      localStorage.setItem('reshimgath_profiles', JSON.stringify(updated));
    } catch (e) {
      console.warn('localStorage quota or write error:', e);
    }
    // Push newly created user profile directly to Firebase Firestore Database!
    await saveProfileToFirestore(newUser.id, newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  const recordTermsAcceptance = async (version = CURRENT_TERMS_VERSION) => {
    if (!user || !user.id) return false;
    const record = createTermsAcceptanceRecord(user.id, version);
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        termsAcceptedVersion: record.termsAcceptedVersion,
        termsAcceptedAt: record.termsAcceptedAt,
        termsAcceptedServerTimestamp: record.termsAcceptedServerTimestamp
      };
      try {
        localStorage.setItem('reshimgath_user', JSON.stringify(updated));
        const stored = localStorage.getItem('reshimgath_profiles');
        if (stored) {
          const profiles = JSON.parse(stored);
          const nextProfiles = profiles.map(p => String(p.id) === String(user.id) ? { ...p, ...record } : p);
          localStorage.setItem('reshimgath_profiles', JSON.stringify(nextProfiles));
        }
      } catch (e) {}

      if (isFirebaseConfigured && user.id && user.id !== 'admin_1') {
        saveProfileToFirestore(user.id, updated);
      }
      return updated;
    });
    return true;
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('reshimgath_user', JSON.stringify(updated));
      // Sync profile update to Firebase Firestore Database!
      if (updated.id) {
        saveProfileToFirestore(updated.id, updated);
      }
      return updated;
    });
  };

  const subscribeUserToPlan = (plan, paymentId = null) => {
    setUser((prev) => {
      if (!prev) return prev;
      const currentSub = prev.subscription || {};
      const currentUnlocked = currentSub.unlockedProfiles || [];
      const currentRemaining = currentSub.creditsRemaining || 0;
      const currentTotal = currentSub.creditsTotal || 0;

      const newRemaining = currentRemaining + plan.visits;
      const newTotal = Math.max(plan.visits, currentTotal + plan.visits);

      const updatedSub = {
        planId: plan.id,
        planName: plan.name,
        creditsTotal: newTotal,
        creditsRemaining: newRemaining,
        unlockedProfiles: currentUnlocked,
        paymentId: paymentId || `pay_${Date.now()}`,
        activatedAt: new Date().toISOString()
      };

      const updated = {
        ...prev,
        subscription: updatedSub
      };

      localStorage.setItem('reshimgath_user', JSON.stringify(updated));
      if (updated.id) {
        saveProfileToFirestore(updated.id, updated);
      }
      return updated;
    });
  };

// In-memory cache for fast profile, connection, and interest lookups without blocking JSON.parse loops
let cachedProfilesRaw = null;
let cachedProfilesParsed = null;
const getStoredProfilesFast = () => {
  try {
    const raw = localStorage.getItem('reshimgath_profiles');
    if (!raw) return DEMO_PROFILES || [];
    if (raw === cachedProfilesRaw && cachedProfilesParsed) {
      return cachedProfilesParsed;
    }
    cachedProfilesRaw = raw;
    cachedProfilesParsed = [...(DEMO_PROFILES || []), ...JSON.parse(raw)];
    return cachedProfilesParsed;
  } catch (e) {
    return DEMO_PROFILES || [];
  }
};

let cachedConnsRaw = null;
let cachedConnsParsed = null;
const getStoredConnectionsFast = () => {
  try {
    const raw = localStorage.getItem('reshimgath_unlocked_connections');
    if (!raw) return [];
    if (raw === cachedConnsRaw && cachedConnsParsed) {
      return cachedConnsParsed;
    }
    cachedConnsRaw = raw;
    cachedConnsParsed = JSON.parse(raw);
    return cachedConnsParsed;
  } catch (e) {
    return [];
  }
};

let cachedInterestsRaw = null;
let cachedInterestsParsed = null;
const getStoredInterestsFast = () => {
  try {
    const raw = localStorage.getItem('reshimgath_interests');
    if (!raw) return null;
    if (raw === cachedInterestsRaw && cachedInterestsParsed) {
      return cachedInterestsParsed;
    }
    cachedInterestsRaw = raw;
    cachedInterestsParsed = JSON.parse(raw);
    return cachedInterestsParsed;
  } catch (e) {
    return null;
  }
};

  const getProfileIdentifiers = (profileId) => {
    if (!profileId) return [];
    const searchStr = String(profileId).toLowerCase().trim();

    const allProfiles = getStoredProfilesFast();

    const found = allProfiles.find((p) => {
      if (!p) return false;
      if (String(p.id).toLowerCase() === searchStr) return true;
      if (p.regId && String(p.regId).toLowerCase() === searchStr) return true;
      if (p.registrationId && String(p.registrationId).toLowerCase() === searchStr) return true;
      if (p.registrationId && String(`ss-${p.registrationId}`).toLowerCase() === searchStr) return true;
      if (p.email && String(p.email).toLowerCase() === searchStr) return true;
      return false;
    });

    const ids = new Set([searchStr]);
    if (found) {
      if (found.id) ids.add(String(found.id).toLowerCase());
      if (found.registrationId) {
        ids.add(String(found.registrationId).toLowerCase());
        ids.add(String(`ss-${found.registrationId}`).toLowerCase());
      }
      if (found.regId) ids.add(String(found.regId).toLowerCase());
      if (found.email) ids.add(String(found.email).toLowerCase());
    }
    return Array.from(ids);
  };

  // Precomputed fast Set of all profile IDs/Reg IDs unlocked by current user or mutual connections
  const userUnlockedSet = useMemo(() => {
    const set = new Set();
    if (!user) return set;
    const myId = String(user.id || '').toLowerCase().trim();
    if (myId) set.add(myId);
    if (user.registrationId) {
      set.add(String(user.registrationId));
      set.add(`ss-${user.registrationId}`.toLowerCase());
    }

    const addTargetId = (raw) => {
      if (!raw) return;
      const s = String(raw).toLowerCase().trim();
      set.add(s);
      const cleanSS = s.replace(/^ss-?/i, '');
      if (cleanSS) {
        set.add(cleanSS);
        set.add(`ss-${cleanSS}`);
      }
      const numOnly = s.replace(/[^0-9]/g, '');
      if (numOnly) {
        set.add(numOnly);
        set.add(`ss-${numOnly}`);
      }
    };

    (user.subscription?.unlockedProfiles || []).forEach(addTargetId);
    (user.unlockedProfiles || []).forEach(addTargetId);

    // Mutual connections in localStorage
    const conns = getStoredConnectionsFast();
    conns.forEach((c) => {
      if (!c) return;
      const u1 = String(c.user1 || '').toLowerCase().trim();
      const u2 = String(c.user2 || '').toLowerCase().trim();
      if (u1 === myId && u2) addTargetId(u2);
      if (u2 === myId && u1) addTargetId(u1);
    });

    const interestsObj = getStoredInterestsFast();
    if (interestsObj?.unlockedConnections && Array.isArray(interestsObj.unlockedConnections)) {
      interestsObj.unlockedConnections.forEach((c) => {
        if (!c) return;
        const u1 = String(c.user1 || '').toLowerCase().trim();
        const u2 = String(c.user2 || '').toLowerCase().trim();
        if (u1 === myId && u2) addTargetId(u2);
        if (u2 === myId && u1) addTargetId(u1);
      });
    }

    return set;
  }, [user]);

  const canViewProfile = useCallback((profileId) => {
    if (!user) {
      return { canView: false, alreadyUnlocked: false, remainingVisits: 0, totalVisits: 0, hasActivePlan: false };
    }

    const isAdminUser = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    if (isAdminUser) {
      return { canView: true, alreadyUnlocked: true, remainingVisits: 999, totalVisits: 999, hasActivePlan: true };
    }

    const cleanId = String(profileId || '').toLowerCase().trim();
    if (cleanId === String(user.id || '').toLowerCase().trim()) {
      return { canView: true, alreadyUnlocked: true, remainingVisits: 999, totalVisits: 999, hasActivePlan: true };
    }

    const isAlreadyUnlocked = userUnlockedSet.has(cleanId) ||
      userUnlockedSet.has(cleanId.replace(/^ss-?/i, '')) ||
      userUnlockedSet.has(`ss-${cleanId.replace(/^ss-?/i, '')}`);

    const sub = user.subscription || {};
    const remaining = sub.creditsRemaining || 0;
    const total = sub.creditsTotal || 0;
    const hasPlan = (sub.planId && total > 0) || remaining > 0;

    return {
      canView: Boolean(isAlreadyUnlocked),
      alreadyUnlocked: Boolean(isAlreadyUnlocked),
      remainingVisits: remaining,
      totalVisits: total,
      hasActivePlan: hasPlan
    };
  }, [user, userUnlockedSet]);

  const unlockProfileForUser = (profileId) => {
    if (!user || !profileId) return false;

    // First check if profile is ALREADY viewable / unlocked!
    const viewStatus = canViewProfile(profileId);
    if (viewStatus.alreadyUnlocked || viewStatus.canView) {
      // Profile is already opened/unlocked! Return true without deducting any credit!
      return true;
    }

    const isAdminUser = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    const currentSub = user.subscription || { unlockedProfiles: [], creditsRemaining: 0 };
    if (!isAdminUser && (currentSub.creditsRemaining || 0) <= 0) {
      return false;
    }

    const primaryId = String(profileId).toLowerCase().trim();
    const myId = String(user.id).toLowerCase().trim();

    // 1. Update current user state and storage
    setUser((prev) => {
      if (!prev) return prev;
      const prevSub = prev.subscription || { unlockedProfiles: [], creditsRemaining: 0 };
      const prevUnlocked = [
        ...(prevSub.unlockedProfiles || []),
        ...(prev.unlockedProfiles || [])
      ].map(id => String(id).toLowerCase());
      const prevRemaining = prevSub.creditsRemaining || 0;

      const newUnlocked = Array.from(new Set([...prevUnlocked, primaryId]));
      const newRemaining = isAdminUser ? prevRemaining : Math.max(0, prevRemaining - 1);

      const updatedSub = {
        ...prevSub,
        creditsRemaining: newRemaining,
        unlockedProfiles: newUnlocked
      };

      const updated = {
        ...prev,
        subscription: updatedSub,
        unlockedProfiles: newUnlocked
      };

      try {
        localStorage.setItem('reshimgath_user', JSON.stringify(updated));
      } catch (e) {}

      if (updated.id) {
        saveProfileToFirestore(updated.id, updated);
      }
      return updated;
    });

    // 2. Perform mutual unlock across localStorage, Firestore, and connections
    const newConnectionRecord = {
      user1: myId,
      user2: primaryId,
      unlockedBy: myId,
      unlockedAt: new Date().toISOString()
    };

    // Save to reshimgath_unlocked_connections
    try {
      const existingConnsRaw = localStorage.getItem('reshimgath_unlocked_connections');
      const existingConns = existingConnsRaw ? JSON.parse(existingConnsRaw) : [];
      const isAlreadyRecorded = existingConns.some(
        c => (c.user1 === myId && c.user2 === primaryId) || (c.user1 === primaryId && c.user2 === myId)
      );
      if (!isAlreadyRecorded) {
        localStorage.setItem('reshimgath_unlocked_connections', JSON.stringify([...existingConns, newConnectionRecord]));
      }
    } catch (e) {}

    // Save to interests.unlockedConnections
    try {
      const interestsRaw = localStorage.getItem('reshimgath_interests');
      const interestsObj = interestsRaw ? JSON.parse(interestsRaw) : { sent: [], received: [], accepted: [], declined: [], shortlisted: [] };
      const existingUnlocked = interestsObj.unlockedConnections || [];
      const hasConn = existingUnlocked.some(
        c => (c.user1 === myId && c.user2 === primaryId) || (c.user1 === primaryId && c.user2 === myId)
      );
      if (!hasConn) {
        const updatedInterests = {
          ...interestsObj,
          unlockedConnections: [...existingUnlocked, newConnectionRecord]
        };
        localStorage.setItem('reshimgath_interests', JSON.stringify(updatedInterests));
      }
    } catch (e) {}

    // Update target profile in reshimgath_profiles so target has user.id in unlockedProfiles
    let targetProfileObj = null;
    try {
      const storedProfiles = localStorage.getItem('reshimgath_profiles');
      let allProfiles = storedProfiles ? JSON.parse(storedProfiles) : DEMO_PROFILES;
      allProfiles = allProfiles.map(p => {
        if (!p) return p;
        const pId = String(p.id || '').toLowerCase();
        const pReg = String(p.regId || '').toLowerCase();
        const pNum = String(p.registrationId || '').toLowerCase();
        if (pId === primaryId || pReg === primaryId || pNum === primaryId || `ss-${pNum}` === primaryId) {
          targetProfileObj = p;
          const prevTargetUnlocked = [
            ...(p.subscription?.unlockedProfiles || []),
            ...(p.unlockedProfiles || [])
          ].map(id => String(id).toLowerCase());
          const newTargetUnlocked = Array.from(new Set([...prevTargetUnlocked, myId]));
          return {
            ...p,
            unlockedProfiles: newTargetUnlocked,
            subscription: {
              ...(p.subscription || {}),
              unlockedProfiles: newTargetUnlocked
            }
          };
        }
        return p;
      });
      localStorage.setItem('reshimgath_profiles', JSON.stringify(allProfiles));
    } catch (e) {}

    // Update target profile in Firestore and record mutual connection in Firestore
    if (isFirebaseConfigured) {
      saveUnlockedConnectionToFirestore(newConnectionRecord);

      // Also update target profile document in Firestore
      const targetDocId = targetProfileObj?.id || primaryId;
      if (targetDocId) {
        (async () => {
          try {
            const targetDocRef = doc(db, 'profiles', String(targetDocId));
            const targetSnap = await getDoc(targetDocRef);
            if (targetSnap.exists()) {
              const tData = targetSnap.data();
              const tSub = tData.subscription || {};
              const tUnlocked = Array.from(new Set([
                ...(tData.unlockedProfiles || []),
                ...(tSub.unlockedProfiles || []),
                myId
              ]));
              await setDoc(targetDocRef, {
                unlockedProfiles: tUnlocked,
                subscription: {
                  ...tSub,
                  unlockedProfiles: tUnlocked
                }
              }, { merge: true });
            }
          } catch (err) {
            console.warn('Error updating target profile in Firestore:', err);
          }
        })();
      }

      // Send real-time notification to the target candidate
      const mutualNotif = {
        id: Date.now(),
        type: 'unlocked',
        profileId: user.id,
        senderId: user.id,
        targetUserId: targetDocId,
        senderName: user.name || 'A connected member',
        senderRegId: user.regId || (user.registrationId ? `SS-${user.registrationId}` : null),
        title: 'Connection Unlocked! 🔓',
        text: `${user.name || 'A connected member'} unlocked your connection! You can now view their contact details, biodata, and chat for free.`,
        time: 'Just now',
        unread: true
      };
      saveNotificationToFirestore(mutualNotif);
    }

    return true;
  };

  const triggerPrivacyAlert = () => {
    setPrivacyAlert(true);
    setTimeout(() => setPrivacyAlert(false), 5000);
  };

  const hasActiveSubscription = () => {
    if (!user) return false;
    if (user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1') return true;
    const sub = user.subscription || {};
    const planId = (sub.planId || user.subPlanId || 'none').toLowerCase();
    const planName = sub.planName || '';
    const remaining = sub.creditsRemaining || 0;
    const total = sub.creditsTotal || 0;
    return (planId !== 'none' && planId !== 'free' && planName !== 'Free / Inactive') || remaining > 0 || total > 0;
  };

  const isUserBlocked = (targetUserId) => {
    if (!user || !user.blockedUsers || !targetUserId) return false;
    const cleanTarget = String(targetUserId).toLowerCase().trim().replace(/^ss-/, '');
    return user.blockedUsers.some(b => {
      const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
      const bReg = String(typeof b === 'object' ? (b.regId || '') : '').toLowerCase().trim().replace(/^ss-/, '');
      return bId === cleanTarget || (bReg && bReg === cleanTarget);
    });
  };

  const blockUser = async (targetProfileOrId) => {
    if (!user || !targetProfileOrId) return false;
    const targetId = typeof targetProfileOrId === 'object' ? targetProfileOrId.id : targetProfileOrId;
    if (String(targetId) === String(user.id)) return false;

    const targetEntry = typeof targetProfileOrId === 'object' ? {
      id: String(targetProfileOrId.id),
      regId: targetProfileOrId.regId || (targetProfileOrId.registrationId ? `SS-${targetProfileOrId.registrationId}` : `SS-${targetProfileOrId.id}`),
      name: targetProfileOrId.name || 'Member',
      avatar: targetProfileOrId.avatar || targetProfileOrId.photos?.[0] || null,
      district: targetProfileOrId.district || '',
      blockedAt: new Date().toISOString()
    } : {
      id: String(targetId),
      regId: String(targetId).startsWith('SS-') ? targetId : `SS-${targetId}`,
      name: 'Member',
      avatar: null,
      district: '',
      blockedAt: new Date().toISOString()
    };

    const currentList = Array.isArray(user.blockedUsers) ? user.blockedUsers : [];
    const alreadyBlocked = currentList.some(b => {
      const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
      const tId = String(targetEntry.id).toLowerCase().trim().replace(/^ss-/, '');
      return bId === tId;
    });

    if (alreadyBlocked) return true;

    const updatedBlocked = [...currentList, targetEntry];
    const updatedUser = {
      ...user,
      blockedUsers: updatedBlocked
    };

    setUser(updatedUser);

    try {
      localStorage.setItem('reshimgath_user', JSON.stringify(updatedUser));
      const storedProfiles = localStorage.getItem('reshimgath_profiles');
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles);
        const nextProfiles = parsed.map(p => {
          if (String(p.id) === String(user.id)) {
            return { ...p, blockedUsers: updatedBlocked };
          }
          return p;
        });
        localStorage.setItem('reshimgath_profiles', JSON.stringify(nextProfiles));
      }
    } catch (e) {}

    if (isFirebaseConfigured && user.id && user.id !== 'admin_1') {
      saveUserBlockedListToFirestore(user.id, updatedBlocked);
    }

    return true;
  };

  const unblockUser = async (targetUserId) => {
    if (!user || !targetUserId) return false;
    const cleanTarget = String(targetUserId).toLowerCase().trim().replace(/^ss-/, '');
    const currentList = Array.isArray(user.blockedUsers) ? user.blockedUsers : [];
    const updatedBlocked = currentList.filter(b => {
      const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
      const bReg = String(typeof b === 'object' ? (b.regId || '') : '').toLowerCase().trim().replace(/^ss-/, '');
      return bId !== cleanTarget && bReg !== cleanTarget;
    });

    const updatedUser = {
      ...user,
      blockedUsers: updatedBlocked
    };

    setUser(updatedUser);

    try {
      localStorage.setItem('reshimgath_user', JSON.stringify(updatedUser));
      const storedProfiles = localStorage.getItem('reshimgath_profiles');
      if (storedProfiles) {
        const parsed = JSON.parse(storedProfiles);
        const nextProfiles = parsed.map(p => {
          if (String(p.id) === String(user.id)) {
            return { ...p, blockedUsers: updatedBlocked };
          }
          return p;
        });
        localStorage.setItem('reshimgath_profiles', JSON.stringify(nextProfiles));
      }
    } catch (e) {}

    if (isFirebaseConfigured && user.id && user.id !== 'admin_1') {
      saveUserBlockedListToFirestore(user.id, updatedBlocked);
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin === true || user?.role === 'admin',
        login,
        loginAsDemo,
        loginAsAdmin,
        signup,
        checkExistingUser,
        checkExistingUserAsync,
        logout,
        updateProfile,
        subscribeUserToPlan,
        unlockProfileForUser,
        canViewProfile,
        hasActiveSubscription,
        privacyAlert,
        triggerPrivacyAlert,
        blockedUsers: user?.blockedUsers || [],
        blockUser,
        unblockUser,
        isUserBlocked,
        recordTermsAcceptance,
        hasAcceptedTerms: (ver) => hasAcceptedTerms(user, ver),
        CURRENT_TERMS_VERSION
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
