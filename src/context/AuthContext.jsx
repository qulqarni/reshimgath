import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROFILES, DEMO_USER } from '../data/mockProfiles';
import { saveProfileToFirestore, saveUnlockedConnectionToFirestore, saveNotificationToFirestore } from '../services/firebaseService';
import { db, isFirebaseConfigured } from '../config/firebase';
import { doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore';
import { calculateAgeFromDob } from '../utils/ageCalculator';

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

  return {
    ...p,
    gender: genderVal,
    lookingFor: genderVal,
    registrationId: numId,
    regId: `SS-${numId}`
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

  const login = (emailOrPhone, password) => {
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
      (p) => (p.email && p.email.toLowerCase() === input) || (p.phone && p.phone === input)
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

    // 3. Search in saved registered profiles from local storage
    const savedProfiles = (() => {
      try {
        const stored = localStorage.getItem('reshimgath_profiles');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    })();

    const matchedProfile = savedProfiles.find(
      (p) =>
        (p.email && p.email.toLowerCase() === input) ||
        (p.phone && String(p.phone).trim() === input) ||
        (p.id && String(p.id).toLowerCase() === input) ||
        (p.regId && String(p.regId).toLowerCase() === input) ||
        (p.registrationId && String(p.registrationId) === input)
    );

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

  const checkExistingUser = (email, phone) => {
    const inputEmail = (email || '').trim().toLowerCase();
    const inputPhone = (phone || '').trim();
    const cleanInputPhone = inputPhone.replace(/[^0-9]/g, '').slice(-10);

    const savedProfiles = (() => {
      try {
        const stored = localStorage.getItem('reshimgath_profiles');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    })();

    const allRegistered = [...savedProfiles, ...DEMO_PROFILES];

    let emailExists = false;
    if (inputEmail) {
      emailExists = allRegistered.some(
        (p) => (p.email && String(p.email).trim().toLowerCase() === inputEmail)
      ) || inputEmail === ADMIN_USER.email.toLowerCase();
    }

    let phoneExists = false;
    if (inputPhone) {
      phoneExists = allRegistered.some((p) => {
        if (!p.phone) return false;
        const pPhone = String(p.phone).trim();
        if (pPhone === inputPhone) return true;
        const cleanPPhone = pPhone.replace(/[^0-9]/g, '').slice(-10);
        return cleanInputPhone.length >= 10 && cleanPPhone.length >= 10 && cleanPPhone === cleanInputPhone;
      });
    }

    return { emailExists, phoneExists };
  };

  const signup = (signupData) => {
    const inputEmail = (signupData.email || '').trim();
    const inputPhone = (signupData.phone || '').trim();

    const { emailExists, phoneExists } = checkExistingUser(inputEmail, inputPhone);

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
    const newUser = {
      id: "u_" + Date.now(),
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
    saveProfileToFirestore(newUser.id, newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
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

  const getProfileIdentifiers = (profileId) => {
    if (!profileId) return [];
    const searchStr = String(profileId).toLowerCase().trim();

    let allProfiles = DEMO_PROFILES || [];
    try {
      const stored = localStorage.getItem('reshimgath_profiles');
      if (stored) {
        allProfiles = [...allProfiles, ...JSON.parse(stored)];
      }
    } catch (e) {}

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

  const canViewProfile = (profileId) => {
    if (!user) {
      return { canView: false, alreadyUnlocked: false, remainingVisits: 0, totalVisits: 0, hasActivePlan: false };
    }

    const isAdminUser = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    const targetIdentifiers = getProfileIdentifiers(profileId);
    const isOwnProfile = targetIdentifiers.includes(String(user.id).toLowerCase());

    if (isAdminUser || isOwnProfile) {
      return { canView: true, alreadyUnlocked: true, remainingVisits: 999, totalVisits: 999, hasActivePlan: true };
    }

    const sub = user.subscription || {};
    const unlockedList = [
      ...(sub.unlockedProfiles || []),
      ...(user.unlockedProfiles || [])
    ].map(id => String(id).toLowerCase());

    let isAlreadyUnlocked = unlockedList.some(id => targetIdentifiers.includes(id));

    // Mutual Unlock Check 1: Check if candidate has unlocked current user in their profile
    if (!isAlreadyUnlocked) {
      try {
        const stored = localStorage.getItem('reshimgath_profiles');
        const allProfiles = stored ? JSON.parse(stored) : DEMO_PROFILES;
        const targetProfile = allProfiles.find(p => {
          if (!p) return false;
          const pId = String(p.id || '').toLowerCase();
          const pReg = String(p.regId || '').toLowerCase();
          const pNum = String(p.registrationId || '').toLowerCase();
          return targetIdentifiers.includes(pId) || targetIdentifiers.includes(pReg) || targetIdentifiers.includes(pNum) || targetIdentifiers.includes(`ss-${pNum}`);
        });

        if (targetProfile) {
          const targetUnlocked = [
            ...(targetProfile.subscription?.unlockedProfiles || []),
            ...(targetProfile.unlockedProfiles || [])
          ].map(id => String(id).toLowerCase());

          const myIdentifiers = getProfileIdentifiers(user.id);
          if (targetUnlocked.some(id => myIdentifiers.includes(id))) {
            isAlreadyUnlocked = true;
          }
        }
      } catch (e) {}
    }

    // Mutual Unlock Check 2: Check global unlockedConnections records in localStorage
    if (!isAlreadyUnlocked) {
      try {
        const connsRaw = localStorage.getItem('reshimgath_unlocked_connections');
        const conns = connsRaw ? JSON.parse(connsRaw) : [];
        const myIdentifiers = getProfileIdentifiers(user.id);
        const hasMutual = conns.some(c => {
          if (!c) return false;
          const u1 = String(c.user1 || '').toLowerCase();
          const u2 = String(c.user2 || '').toLowerCase();
          return (myIdentifiers.includes(u1) && targetIdentifiers.includes(u2)) ||
                 (myIdentifiers.includes(u2) && targetIdentifiers.includes(u1));
        });
        if (hasMutual) {
          isAlreadyUnlocked = true;
        }
      } catch (e) {}
    }

    // Mutual Unlock Check 3: Check interests in localStorage for unlockedConnections
    if (!isAlreadyUnlocked) {
      try {
        const interestsRaw = localStorage.getItem('reshimgath_interests');
        const interestsObj = interestsRaw ? JSON.parse(interestsRaw) : null;
        if (interestsObj?.unlockedConnections && Array.isArray(interestsObj.unlockedConnections)) {
          const myIdentifiers = getProfileIdentifiers(user.id);
          const hasMutual = interestsObj.unlockedConnections.some(c => {
            if (!c) return false;
            const u1 = String(c.user1 || '').toLowerCase();
            const u2 = String(c.user2 || '').toLowerCase();
            return (myIdentifiers.includes(u1) && targetIdentifiers.includes(u2)) ||
                   (myIdentifiers.includes(u2) && targetIdentifiers.includes(u1));
          });
          if (hasMutual) {
            isAlreadyUnlocked = true;
          }
        }
      } catch (e) {}
    }

    const remaining = sub.creditsRemaining || 0;
    const total = sub.creditsTotal || 0;
    const hasPlan = (sub.planId && total > 0) || remaining > 0;

    return {
      canView: isAlreadyUnlocked,
      alreadyUnlocked: isAlreadyUnlocked,
      remainingVisits: remaining,
      totalVisits: total,
      hasActivePlan: hasPlan
    };
  };

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
        logout,
        updateProfile,
        subscribeUserToPlan,
        unlockProfileForUser,
        canViewProfile,
        hasActiveSubscription,
        privacyAlert,
        triggerPrivacyAlert
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
