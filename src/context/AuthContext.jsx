import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER } from '../data/mockProfiles';
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('reshimgath_user');
    return saved ? JSON.parse(saved) : null;
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

  const login = (email, password) => {
    // Admin credentials check
    if (email === ADMIN_USER.email || email === 'admin@reshimgath.com' || email === 'admin') {
      setUser(ADMIN_USER);
      return { success: true, user: ADMIN_USER };
    }

    // Basic simulation logic
    if (email === DEMO_USER.email || email.includes('aditya') || email === 'demo@reshimgath.com') {
      setUser(DEMO_USER);
      return { success: true, user: DEMO_USER };
    }

    const customUser = {
      id: "u_" + Date.now(),
      name: email.split('@')[0].replace('.', ' '),
      email: email,
      gender: "male",
      age: 27,
      district: "Ichalkaranji",
      education: "Graduate",
      occupation: "Professional",
      verified: true,
      avatar: null,
      photos: []
    };
    setUser(customUser);
    saveProfileToFirestore(customUser.id, customUser);
    return { success: true, user: customUser };
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    setPrivacyAlert(false);
  };

  const loginAsAdmin = () => {
    setUser(ADMIN_USER);
    setPrivacyAlert(false);
  };

  const signup = (signupData) => {
    const newUser = {
      id: "u_" + Date.now(),
      name: signupData.name || "Member",
      email: signupData.email,
      phone: signupData.phone || "",
      gender: signupData.gender || "female",
      age: signupData.age || 25,
      district: signupData.district || "Ichalkaranji",
      maritalStatus: "Never Married",
      religion: signupData.religion || "Hindu",
      caste: signupData.caste || "Maratha",
      motherTongue: "Marathi",
      verified: false,
      aboutMe: "Newly registered member looking for a life partner.",
      avatar: null,
      photos: [],
      biodataPdf: signupData.biodataPdf || null,
      partnerPref: {
        ageRange: "24 - 30",
        districts: ["Ichalkaranji", "Kolhapur", "Sangli", "Pune"]
      },
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
