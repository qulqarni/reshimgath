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

export const normalizeGender = (p) => {
  if (!p) return p;
  let raw = p.gender || p.lookingFor || p.looking_for || p.seeking || p.matchFor;
  let genderVal = 'female';
  if (typeof raw === 'string') {
    const lower = raw.toLowerCase().trim();
    if (lower === 'male' || lower === 'groom' || lower === 'man' || lower === 'boy' || lower.includes('groom') || lower.includes('male')) {
      genderVal = 'male';
    } else if (lower === 'female' || lower === 'bride' || lower === 'woman' || lower === 'girl' || lower.includes('bride') || lower.includes('female')) {
      genderVal = 'female';
    }
  }
  return {
    ...p,
    gender: genderVal
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('reshimgath_user');
      return saved ? normalizeGender(JSON.parse(saved)) : null;
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
      const normAdmin = normalizeGender(ADMIN_USER);
      setUser(normAdmin);
      return { success: true, user: normAdmin };
    }

    // 2. Demo Profiles credentials check
    const matchedDemo = DEMO_PROFILES.find(
      (p) => (p.email && p.email.toLowerCase() === input) || (p.phone && p.phone === input)
    );

    if (matchedDemo) {
      const normDemo = normalizeGender(matchedDemo);
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
        (p.id && String(p.id).toLowerCase() === input)
    );

    if (matchedProfile) {
      const normMatched = normalizeGender(matchedProfile);
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
      setUser(normalizeGender(DEMO_USER));
    }
    setPrivacyAlert(false);
  };

  const loginAsAdmin = () => {
    setUser(normalizeGender(ADMIN_USER));
    setPrivacyAlert(false);
  };

  const signup = (signupData) => {
    const newUser = {
      id: "u_" + Date.now(),
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
