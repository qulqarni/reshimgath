import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROFILES, DEMO_USER } from '../data/mockProfiles';
import { saveProfileToFirestore } from '../services/firebaseService';

const AuthContext = createContext();

export const ADMIN_USER = {
  id: 'admin_1',
  name: 'Bureau Administrator',
  email: 'admin@sambodhisarang.com',
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

    if (!input) {
      return { success: false, message: 'Please enter your registered email or phone number.' };
    }

    // 1. Admin credentials check
    if (input === ADMIN_USER.email || input === 'admin@reshimgath.com' || input === 'admin') {
      const normAdmin = normalizeProfile(ADMIN_USER);
      setUser(normAdmin);
      return { success: true, user: normAdmin };
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

  const loginAsAdmin = () => {
    setUser(normalizeProfile(ADMIN_USER));
    setPrivacyAlert(false);
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

  const unlockProfileForUser = (profileId) => {
    if (!user || !profileId) return false;

    const targetIdStr = String(profileId).toLowerCase();
    const currentSub = user.subscription || { unlockedProfiles: [], creditsRemaining: 0 };
    const unlockedList = (currentSub.unlockedProfiles || []).map(id => String(id).toLowerCase());

    if (unlockedList.includes(targetIdStr)) {
      return true;
    }

    const isAdminUser = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    if (!isAdminUser && (currentSub.creditsRemaining || 0) <= 0) {
      return false;
    }

    setUser((prev) => {
      if (!prev) return prev;
      const prevSub = prev.subscription || { unlockedProfiles: [], creditsRemaining: 0 };
      const prevUnlocked = prevSub.unlockedProfiles || [];
      const prevRemaining = prevSub.creditsRemaining || 0;

      const newUnlocked = prevUnlocked.includes(String(profileId))
        ? prevUnlocked
        : [...prevUnlocked, String(profileId)];

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

  const canViewProfile = (profileId) => {
    if (!user) {
      return { canView: false, alreadyUnlocked: false, remainingVisits: 0, totalVisits: 0, hasActivePlan: false };
    }

    const isAdminUser = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    const isOwnProfile = String(user.id) === String(profileId);

    if (isAdminUser || isOwnProfile) {
      return { canView: true, alreadyUnlocked: true, remainingVisits: 999, totalVisits: 999, hasActivePlan: true };
    }

    const sub = user.subscription || {};
    const unlockedList = (sub.unlockedProfiles || []).map(id => String(id).toLowerCase());
    const targetIdStr = String(profileId).toLowerCase();

    const isAlreadyUnlocked = unlockedList.includes(targetIdStr);
    const remaining = sub.creditsRemaining || 0;
    const total = sub.creditsTotal || 0;
    const hasPlan = (sub.planId && total > 0) || remaining > 0;

    // Check if target user has sent an interest request to current user (Received Interest)
    // If target user initiated an interest request to current user, viewing target profile is 100% FREE!
    const interestsSaved = (() => {
      try {
        return JSON.parse(localStorage.getItem('reshimgath_interests') || '{}');
      } catch (e) {
        return {};
      }
    })();
    const receivedArray = interestsSaved.received || [];
    const isReceivedFromTarget = receivedArray.some(r => {
      if (!r) return false;
      const sender = typeof r === 'string' ? r : (r.senderId || r.profileId || r.user1);
      const target = typeof r === 'string' ? user.id : (r.targetUserId || r.user2);
      return String(sender).toLowerCase() === targetIdStr && String(target).toLowerCase() === String(user.id).toLowerCase();
    });

    if (isAlreadyUnlocked || isReceivedFromTarget) {
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
