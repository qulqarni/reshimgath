import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_PROFILES } from '../data/mockProfiles';
import { 
  fetchProfilesFromFirestore, 
  saveProfileToFirestore, 
  deleteProfileFromFirestore,
  saveHomeContentToFirestore,
  saveSuccessStoryToFirestore,
  deleteSuccessStoryFromFirestore
} from '../services/firebaseService';
import confetti from 'canvas-confetti';

const ProfileContext = createContext();

export const DEFAULT_HOME_CONTENT = {
  heroBadge: "Sambodhi Sarang Matrimony",
  heroTitle: "Find Your Perfect Life Partner",
  heroTitleMr: "तुमच्या आयुष्याचा सुंदर सोबती शोधा",
  heroSubtext: "Connecting hearts with trust, tradition, and dignity across Maharashtra.",
  verifiedProfilesCountText: "100% Verified Profiles",
  happyCouplesCountText: "15,000+ Happy Couples",
  privacyProtectedText: "Privacy Protected",
  rightCardTitle: "Sambodhi Sarang Marriage Bureau",
  rightCardSubtitle: "॥ शुभमंगल सावधान ॥",
  rightCardDesc: "Connecting verified families across Pune, Mumbai, Kolhapur, Sangli, Satara, Solapur, Nashik, Ichalkaranji & worldwide.",
  whyChooseTitle: "Why Families Trust Sambodhi Sarang",
  whyChooseSubtitle: "Designed with utmost dignity, cultural respect, and modern privacy protection",
  ctaTitle: "Ready to Start Your Beautiful Matrimonial Journey?",
  ctaSubtitle: "Join thousands of families who found love and trust at Sambodhi Sarang Marriage Bureau."
};

export const DEFAULT_STORIES = [
  {
    id: 1,
    names: "Snehal & Swapnil",
    location: "Pune & Mumbai",
    quote: "“We found our perfect match within 3 weeks of registering. Sambodhi Sarang brought our two traditional families together seamlessly!”",
    weddingDate: "January 2026 • Pune Palace Ground",
    photos: [
      { url: "/story1.jpg", caption: "Snehal & Swapnil in traditional green Paithani saree & royal Sherwani at mandap" },
      { url: "/story1_2.jpg", caption: "Sweet wedding moment exchanging varmala garland" },
      { url: "/story2.jpg", caption: "Family blessings ritual ceremony" }
    ]
  },
  {
    id: 2,
    names: "Pooja & Varun",
    location: "Kolhapur & Sangli",
    quote: "“The verified profile feature and family privacy gate made us feel 100% safe. Highly recommended for all families.”",
    weddingDate: "November 2025 • Sangli Wedding Hall",
    photos: [
      { url: "/story2.jpg", caption: "Pooja & Varun laughing happily in yellow Paithani saree during mandap rituals" },
      { url: "/story2_2.jpg", caption: "Walking together holding hands amidst marigold flower path" },
      { url: "/story1.jpg", caption: "Auspicious wedding couple portrait" }
    ]
  },
  {
    id: 3,
    names: "Dr. Radhika & Rohan",
    location: "Nashik & Satara",
    quote: "“Authentic verified profiles gave our parents absolute confidence. Today we are happily married for over 2 years!”",
    weddingDate: "February 2024 • Nashik Grand Reception",
    photos: [
      { url: "/story3.jpg", caption: "Dr. Radhika & Rohan at their fairy-lit evening reception in maroon Nauvari saree" },
      { url: "/story3_2.jpg", caption: "Auspicious wedding ring ritual ceremony" },
      { url: "/story1_2.jpg", caption: "Grand Varmala flower garland celebration" }
    ]
  }
];

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('reshimgath_profiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean old demo profiles starting with 'p1', 'p2', etc.
      const cleaned = parsed.filter(p => !['p1','p2','p3','p4','p5','p6','p7','p8'].includes(p.id));
      return cleaned;
    }
    return [];
  });

  const [homeContent, setHomeContent] = useState(() => {
    const saved = localStorage.getItem('reshimgath_home_content');
    if (saved) return JSON.parse(saved);
    return DEFAULT_HOME_CONTENT;
  });

  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('reshimgath_stories');
    if (saved) return JSON.parse(saved);
    return DEFAULT_STORIES;
  });

  const { user } = useAuth();

  // Sync logged-in user profile changes (avatar, photos, details) into profiles array in real-time
  useEffect(() => {
    if (user && user.id) {
      setProfiles((prev) => {
        const index = prev.findIndex((p) => p.id === user.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...user };
          return updated;
        } else {
          return [user, ...prev];
        }
      });
    }
  }, [user]);

  // Fetch Firestore profiles on mount
  useEffect(() => {
    const loadFirestoreProfiles = async () => {
      const firestoreProfiles = await fetchProfilesFromFirestore();
      if (firestoreProfiles && firestoreProfiles.length > 0) {
        setProfiles((prev) => {
          const map = new Map();
          prev.forEach((p) => map.set(p.id, p));
          firestoreProfiles.forEach((p) => map.set(p.id, p));
          return Array.from(map.values());
        });
      }
    };
    loadFirestoreProfiles();
  }, []);

  useEffect(() => {
    localStorage.setItem('reshimgath_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('reshimgath_home_content', JSON.stringify(homeContent));
  }, [homeContent]);

  useEffect(() => {
    localStorage.setItem('reshimgath_stories', JSON.stringify(stories));
  }, [stories]);
  
  // Clean interest states
  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('reshimgath_interests');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Clean demo IDs
      return {
        sent: (parsed.sent || []).filter(id => !['p1','p2','p3','p4','p5','p6','p7','p8'].includes(id)),
        received: (parsed.received || []).filter(item => !['p1','p2','p3','p4','p5','p6','p7','p8'].includes(item.profileId)),
        accepted: (parsed.accepted || []).filter(id => !['p1','p2','p3','p4','p5','p6','p7','p8'].includes(id)),
        declined: (parsed.declined || []).filter(id => !['p1','p2','p3','p4','p5','p6','p7','p8'].includes(id)),
        shortlisted: (parsed.shortlisted || []).filter(id => !['p1','p2','p3','p4','p5','p6','p7','p8'].includes(id))
      };
    }
    return {
      sent: [],
      received: [],
      accepted: [],
      declined: [],
      shortlisted: []
    };
  });

  // Clean chat messages store
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('reshimgath_chats');
    if (saved) {
      const parsed = JSON.parse(saved);
      delete parsed['p1'];
      delete parsed['p3'];
      delete parsed['p5'];
      return parsed;
    }
    return {};
  });

  // Clean notifications
  const [notifications, setNotifications] = useState([]);

  // Clean Profile Views / Visitors store
  const [profileViews, setProfileViews] = useState([]);

  // Toast notifications trigger queue
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('reshimgath_interests', JSON.stringify(interests));
  }, [interests]);

  useEffect(() => {
    localStorage.setItem('reshimgath_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('reshimgath_profile_views', JSON.stringify(profileViews));
  }, [profileViews]);

  const recordProfileView = (targetProfile, viewerUser) => {
    if (!targetProfile) return;

    const viewEntry = {
      id: Date.now(),
      visitorId: viewerUser?.id || 'user',
      visitorName: viewerUser?.name || 'A Member',
      occupation: viewerUser?.occupation || 'Professional',
      location: viewerUser?.district || 'Maharashtra',
      avatar: viewerUser?.avatar || null,
      timestamp: 'Just now',
      targetId: targetProfile.id
    };

    setProfileViews((prev) => [
      viewEntry,
      ...prev.filter((v) => !(v.visitorId === viewEntry.visitorId && v.targetId === viewEntry.targetId))
    ]);

    setNotifications((prev) => [
      {
        id: Date.now(),
        type: 'view',
        profileId: viewerUser?.id || 'user',
        title: 'Profile Visited! 👁️',
        text: `${viewerUser?.name || 'A verified member'} viewed your profile.`,
        time: 'Just now',
        unread: true
      },
      ...prev
    ]);
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const sendInterest = (profileId) => {
    if (interests.sent.includes(profileId)) return;

    setInterests((prev) => ({
      ...prev,
      sent: [...prev.sent, profileId]
    }));

    addToast('Interest sent successfully! Communication will unlock once accepted.', 'success');
  };

  const acceptInterest = (profileId) => {
    setInterests((prev) => ({
      ...prev,
      received: prev.received.filter((item) => item.profileId !== profileId),
      accepted: [...prev.accepted, profileId]
    }));

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // fallback
    }

    addToast('Interest Accepted! You can now start private chat.', 'success');
  };

  const declineInterest = (profileId) => {
    setInterests((prev) => ({
      ...prev,
      received: prev.received.filter((item) => item.profileId !== profileId),
      declined: [...prev.declined, profileId]
    }));
    addToast('Interest declined.', 'info');
  };

  const toggleShortlist = (profileId) => {
    setInterests((prev) => {
      const isShortlisted = prev.shortlisted.includes(profileId);
      const updated = isShortlisted
        ? prev.shortlisted.filter((id) => id !== profileId)
        : [...prev.shortlisted, profileId];

      if (!isShortlisted) {
        addToast('Profile saved to shortlist!', 'success');
      } else {
        addToast('Profile removed from shortlist.', 'info');
      }

      return {
        ...prev,
        shortlisted: updated
      };
    });
  };

  const sendMessage = (profileId, text) => {
    if (!text.trim()) return false;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats((prev) => ({
      ...prev,
      [profileId]: [...(prev[profileId] || []), newMsg]
    }));

    return true;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // ADMIN & MEMBER PROFILE FIRESTORE INTEGRATION
  const toggleVerifyProfile = (profileId) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, verified: !p.verified };
          saveProfileToFirestore(profileId, updated);
          return updated;
        }
        return p;
      })
    );
    addToast('Profile verification status updated successfully!', 'success');
  };

  const addProfile = (newProfileData) => {
    const id = 'p_' + Date.now();
    const createdProfile = {
      id,
      verified: true,
      photos: newProfileData.photos || [],
      avatar: newProfileData.avatar || null,
      maritalStatus: 'Never Married',
      religion: 'Hindu',
      motherTongue: 'Marathi',
      diet: 'Vegetarian',
      smoking: 'No',
      drinking: 'No',
      siblings: '1 Sister',
      familyType: 'Nuclear',
      fatherOccupation: 'Business',
      motherOccupation: 'Homemaker',
      ...newProfileData
    };

    setProfiles((prev) => [createdProfile, ...prev]);
    saveProfileToFirestore(id, createdProfile);
    addToast('New profile registered successfully!', 'success');
    return createdProfile;
  };

  const updateAdminProfile = (profileId, updatedData) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === profileId) {
          const updated = { ...p, ...updatedData };
          saveProfileToFirestore(profileId, updated);
          return updated;
        }
        return p;
      })
    );
    addToast('Profile updated successfully by Admin!', 'success');
  };

  const deleteProfile = (profileId) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    deleteProfileFromFirestore(profileId);
    addToast('Profile deleted successfully.', 'info');
  };

  // HOMEPAGE CONTENT ADMIN METHODS
  const updateHomeContent = (newContent) => {
    setHomeContent((prev) => {
      const updated = { ...prev, ...newContent };
      saveHomeContentToFirestore(updated);
      return updated;
    });
    addToast('Homepage content updated successfully!', 'success');
  };

  const addSuccessStory = (storyData) => {
    const newStory = {
      id: Date.now(),
      names: storyData.names,
      location: storyData.location,
      quote: storyData.quote,
      weddingDate: storyData.weddingDate,
      photos: storyData.photos || [{ url: '/story1.jpg', caption: 'Couple portrait' }]
    };
    setStories((prev) => [newStory, ...prev]);
    saveSuccessStoryToFirestore(newStory);
    addToast('New success story added to homepage!', 'success');
  };

  const deleteSuccessStory = (storyId) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
    deleteSuccessStoryFromFirestore(storyId);
    addToast('Success story removed from homepage.', 'info');
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        interests,
        chats,
        notifications,
        profileViews,
        toasts,
        homeContent,
        stories,
        sendInterest,
        acceptInterest,
        declineInterest,
        toggleShortlist,
        sendMessage,
        markNotificationRead,
        recordProfileView,
        addToast,
        toggleVerifyProfile,
        addProfile,
        updateAdminProfile,
        deleteProfile,
        updateHomeContent,
        addSuccessStory,
        deleteSuccessStory
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => useContext(ProfileContext);
