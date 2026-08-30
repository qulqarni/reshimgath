import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER } from '../data/mockProfiles';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('reshimgath_user');
    return saved ? JSON.parse(saved) : DEMO_USER; // Default logged in as DEMO_USER for interactive exploration
  });

  const [privacyAlert, setPrivacyAlert] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('reshimgath_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('reshimgath_user');
    }
  }, [user]);

  const login = (email, password) => {
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
      district: "Pune",
      education: "Graduate",
      occupation: "Professional",
      verified: true,
      avatar: null,
      photos: []
    };
    setUser(customUser);
    return { success: true, user: customUser };
  };

  const loginAsDemo = () => {
    setUser(DEMO_USER);
    setPrivacyAlert(false);
  };

  const signup = (signupData) => {
    const newUser = {
      id: "u_" + Date.now(),
      name: signupData.name || "Member",
      email: signupData.email,
      gender: signupData.gender || "female",
      age: signupData.age || 25,
      district: signupData.district || "Pune",
      maritalStatus: "Never Married",
      religion: "Hindu",
      caste: signupData.caste || "Maratha",
      motherTongue: "Marathi",
      verified: false,
      aboutMe: "Newly registered member looking for a life partner.",
      avatar: null,
      photos: [],
      biodataPdf: signupData.biodataPdf || null,
      partnerPref: {
        ageRange: "24 - 30",
        districts: ["Pune", "Mumbai", "Kolhapur"]
      }
    };
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('reshimgath_user', JSON.stringify(updated));
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
        login,
        loginAsDemo,
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

export const useAuth = () => useContext(AuthContext);
