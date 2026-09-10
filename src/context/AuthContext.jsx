import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROFILES, DEMO_USER } from '../data/mockProfiles';
import { saveProfileToFirestore } from '../services/firebaseService';

const AuthContext = createContext();

export const ADMIN_USER = {
  id: 'admin_1',
  name: 'Bureau Administrator',
  email: 'pk9823435404@gmail.com',
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

  const login = (emailOrPhone, password) => {
    const input = (emailOrPhone || '').trim().toLowerCase();
    const pass = (password || '').trim();

    if (!input) {
      return { success: false, message: 'Please enter your registered email or phone number.' };
    }

    // 1. Admin credentials check
    const isInputAdminEmail =
      input === ADMIN_USER.email.toLowerCase() ||
      input === 'pk9823435404@gmail.com' ||
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
      const normMatched = normalizeProfile(matchedProfile);
      setUser(normMatched);
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

  const signup = (signupData) => {
    const regNum = getNextRegistrationId();
    const newUser = {
      id: "u_" + Date.now(),
      registrationId: regNum,
      regId: `SS-${regNum}`,
      name: (signupData.name || "").trim(),
      email: (signupData.email || "").trim(),
      phone: (signupData.phone || "").trim(),
      gender: signupData.gender || "female",
      password: signupData.password || "",
      verified: false,
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
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

      const updatedSub = {
        planId: plan.id,
        planName: plan.name,
        creditsTotal: plan.visits,
        creditsRemaining: currentRemaining + plan.visits,
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
    const unlockedList = (sub.unlockedProfiles || []).map(id => String(id).toLowerCase());

    const isAlreadyUnlocked = unlockedList.some(id => targetIdentifiers.includes(id));
    const remaining = sub.creditsRemaining || 0;
    const total = sub.creditsTotal || 0;
    const hasPlan = (sub.planId && total > 0) || remaining > 0;

    // Check if target user has sent an interest request to current user (Received Interest)
    // Or if target user and current user have accepted connection (Connected Profiles)
    // If target user initiated an interest request or is connected, viewing target profile is 100% FREE!
    const interestsSaved = (() => {
      try {
        return JSON.parse(localStorage.getItem('reshimgath_interests') || '{}');
      } catch (e) {
        return {};
      }
    })();

    const myIdStr = String(user.id).toLowerCase();
    const myEmailStr = user.email ? String(user.email).toLowerCase() : '';
    const myNameStr = user.name ? String(user.name).toLowerCase() : '';

    const receivedArray = interestsSaved.received || [];
    const isReceivedFromTarget = receivedArray.some(r => {
      if (!r) return false;
      const sender = typeof r === 'string' ? r : (r.senderId || r.profileId || r.user1);
      const target = typeof r === 'string' ? user.id : (r.targetUserId || r.user2);
      const senderStr = String(sender).toLowerCase();
      const targetStr = String(target).toLowerCase();
      return targetIdentifiers.includes(senderStr) && targetStr === myIdStr;
    });

    const acceptedArray = [...(interestsSaved.accepted || []), ...(interestsSaved.connected || [])];
    const isConnectedWithTarget = acceptedArray.some(a => {
      if (!a) return false;
      let u1 = '';
      let u2 = '';
      if (typeof a === 'string') {
        u1 = a.toLowerCase();
        u2 = '';
      } else {
        u1 = String(a.user1 || a.senderId || '').toLowerCase();
        u2 = String(a.user2 || a.targetUserId || a.profileId || '').toLowerCase();
      }

      const u1IsMe = u1 === myIdStr || (myEmailStr && u1 === myEmailStr) || (myNameStr && u1 === myNameStr);
      const u2IsMe = u2 === myIdStr || (myEmailStr && u2 === myEmailStr) || (myNameStr && u2 === myNameStr);

      const u1IsTarget = targetIdentifiers.includes(u1);
      const u2IsTarget = targetIdentifiers.includes(u2);

      return (u1IsMe && u2IsTarget) || (u2IsMe && u1IsTarget);
    });

    if (isAlreadyUnlocked || isReceivedFromTarget || isConnectedWithTarget) {
      return { canView: true, alreadyUnlocked: true, remainingVisits: remaining, totalVisits: total, hasActivePlan: true };
    }

    return {
      canView: false,
      alreadyUnlocked: false,
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

    const targetIdentifiers = getProfileIdentifiers(profileId);

    setUser((prev) => {
      if (!prev) return prev;
      const prevSub = prev.subscription || { unlockedProfiles: [], creditsRemaining: 0 };
      const prevUnlocked = (prevSub.unlockedProfiles || []).map(id => String(id).toLowerCase());
      const prevRemaining = prevSub.creditsRemaining || 0;

      // Store all variant identifiers so future views by ID, regId, or SS-XXXX are immediately recognized as unlocked
      const newUnlocked = Array.from(new Set([...prevUnlocked, ...targetIdentifiers]));
      const newRemaining = isAdminUser ? prevRemaining : Math.max(0, prevRemaining - 1);

      const updatedSub = {
        ...prevSub,
        creditsRemaining: newRemaining,
        unlockedProfiles: newUnlocked
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

    return true;
  };

  const triggerPrivacyAlert = () => {
    setPrivacyAlert(true);
    setTimeout(() => setPrivacyAlert(false), 5000);
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
        logout,
        updateProfile,
        subscribeUserToPlan,
        unlockProfileForUser,
        canViewProfile,
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
