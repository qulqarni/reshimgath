import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_PROFILES } from '../data/mockProfiles';
import { 
  fetchProfilesFromFirestore, 
  saveProfileToFirestore, 
  deleteProfileFromFirestore,
  fetchHomeContentFromFirestore,
  saveHomeContentToFirestore,
  fetchSuccessStoriesFromFirestore,
  saveSuccessStoryToFirestore,
  deleteSuccessStoryFromFirestore,
  fetchChatsFromFirestore,
  saveChatToFirestore,
  fetchInterestsFromFirestore,
  saveInterestsToFirestore,
  saveProfileViewToFirestore,
  saveNotificationToFirestore,
  subscribeToProfilesFromFirestore,
  subscribeToChatsFromFirestore,
  subscribeToInterestsFromFirestore,
  subscribeToProfileViewsFromFirestore,
  subscribeToNotificationsFromFirestore
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
      const map = new Map();
      MOCK_PROFILES.forEach(p => map.set(p.id, p));
      cleaned.forEach(p => map.set(p.id, p));
      return Array.from(map.values());
    }
    return MOCK_PROFILES;
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

  // Sync logged-in candidate user profile changes into profiles array in real-time (Excludes Admin)
  useEffect(() => {
    if (user && user.id && !user.isAdmin && user.role !== 'admin' && user.id !== 'admin_1') {
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

  // Real-time Cloud Firestore data subscriptions (onSnapshot)
  useEffect(() => {
    const unsubProfiles = subscribeToProfilesFromFirestore((firestoreProfiles) => {
      const deletedIds = (() => {
        try {
          return JSON.parse(localStorage.getItem('reshimgath_deleted_profiles') || '[]');
        } catch (e) {
          return [];
        }
      })();

      const isAdminCheck = (p) => p.isAdmin || p.role === 'admin' || p.id === 'admin_1' || (p.email && p.email.includes('admin'));

      setProfiles((prev) => {
        const map = new Map();
        MOCK_PROFILES.forEach((p) => {
          if (!deletedIds.includes(p.id) && !isAdminCheck(p)) map.set(p.id, p);
        });
        if (firestoreProfiles && firestoreProfiles.length > 0) {
          firestoreProfiles.forEach((p) => {
            if (!deletedIds.includes(p.id) && !isAdminCheck(p)) map.set(p.id, p);
          });
        }
        prev.forEach((p) => {
          if (!deletedIds.includes(p.id) && !isAdminCheck(p)) map.set(p.id, p);
        });
        return Array.from(map.values()).filter((p) => !isAdminCheck(p));
      });
    });

    const unsubChats = subscribeToChatsFromFirestore((firestoreChats) => {
      if (firestoreChats && Object.keys(firestoreChats).length > 0) {
        setChats((prev) => ({ ...prev, ...firestoreChats }));
      }
    });

    const unsubInterests = subscribeToInterestsFromFirestore((firestoreInterests) => {
      if (firestoreInterests) {
        setInterests((prev) => ({
          sent: firestoreInterests.sent || [],
          received: firestoreInterests.received || [],
          accepted: firestoreInterests.accepted || [],
          declined: firestoreInterests.declined || [],
          shortlisted: firestoreInterests.shortlisted || []
        }));
      }
    });

    const unsubViews = subscribeToProfileViewsFromFirestore((firestoreViews) => {
      if (firestoreViews && firestoreViews.length > 0) {
        setProfileViews(firestoreViews);
      }
    });

    const unsubNotifs = subscribeToNotificationsFromFirestore((firestoreNotifs) => {
      if (firestoreNotifs && firestoreNotifs.length > 0) {
        const readIds = (() => {
          try {
            return JSON.parse(localStorage.getItem('reshimgath_read_notifications') || '[]');
          } catch (e) {
            return [];
          }
        })();
        const updated = firestoreNotifs.map((n) =>
          readIds.includes(n.id) ? { ...n, unread: false } : n
        );
        setNotifications(updated);
      }
    });

    const loadOtherContent = async () => {
      const firestoreHome = await fetchHomeContentFromFirestore();
      if (firestoreHome) {
        setHomeContent((prev) => ({ ...prev, ...firestoreHome }));
      }
      const firestoreStories = await fetchSuccessStoriesFromFirestore();
      if (firestoreStories && firestoreStories.length > 0) {
        setStories(firestoreStories);
      }
    };
    loadOtherContent();

    return () => {
      unsubProfiles();
      unsubChats();
      unsubInterests();
      unsubViews();
      unsubNotifs();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('reshimgath_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.warn('Profiles quota exceeded:', e);
    }
  }, [profiles]);

  useEffect(() => {
    try {
      localStorage.setItem('reshimgath_home_content', JSON.stringify(homeContent));
    } catch (e) {}
  }, [homeContent]);

  useEffect(() => {
    try {
      localStorage.setItem('reshimgath_stories', JSON.stringify(stories));
    } catch (e) {}
  }, [stories]);
  
  // Clean interest states
  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('reshimgath_interests');
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleanItem = (item) => {
        if (!item) return false;
        const idStr = typeof item === 'string' ? item : (item.profileId || item.user1);
        return !['p1','p2','p3','p4','p5','p6','p7','p8','admin_1'].includes(idStr);
      };
      return {
        sent: (parsed.sent || []).filter(cleanItem),
        received: (parsed.received || []).filter(cleanItem),
        accepted: (parsed.accepted || []).filter(cleanItem),
        declined: (parsed.declined || []).filter(cleanItem),
        shortlisted: (parsed.shortlisted || []).filter(cleanItem)
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

  // Clean notifications store with persistent read IDs check
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('reshimgath_notifications');
    const readIds = (() => {
      try {
        return JSON.parse(localStorage.getItem('reshimgath_read_notifications') || '[]');
      } catch (e) {
        return [];
      }
    })();

    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed
        .filter((n) => !(n.type === 'view' && String(n.profileId) === String(n.targetUserId)))
        .map((n) => (readIds.includes(n.id) ? { ...n, unread: false } : n));
    }
    return [];
  });

  // Clean Profile Views / Visitors store (filter out self views)
  const [profileViews, setProfileViews] = useState(() => {
    const saved = localStorage.getItem('reshimgath_profile_views');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.filter((v) => String(v.visitorId) !== String(v.targetId));
    }
    return [];
  });

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

  useEffect(() => {
    localStorage.setItem('reshimgath_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const recordProfileView = (targetProfile, viewerUser) => {
    if (!targetProfile || !viewerUser) return;

    // DO NOT record view if user is viewing their own profile
    if (
      String(viewerUser.id) === String(targetProfile.id) ||
      (viewerUser.email && targetProfile.email && viewerUser.email === targetProfile.email)
    ) {
      return;
    }

    const viewEntry = {
      id: Date.now(),
      visitorId: viewerUser.id,
      visitorName: viewerUser.name || 'A Member',
      occupation: viewerUser.occupation || 'Professional',
      location: viewerUser.district || 'Maharashtra',
      avatar: viewerUser.avatar || null,
      timestamp: 'Just now',
      targetId: targetProfile.id
    };

    setProfileViews((prev) => [
      viewEntry,
      ...prev.filter((v) => !(String(v.visitorId) === String(viewEntry.visitorId) && String(v.targetId) === String(viewEntry.targetId)))
    ]);
    saveProfileViewToFirestore(viewEntry);

    const viewNotif = {
      id: Date.now(),
      type: 'view',
      profileId: viewerUser.id,
      targetUserId: targetProfile.id,
      title: 'Profile Visited! 👁️',
      text: `${viewerUser.name || 'A verified member'} viewed your profile.`,
      time: 'Just now',
      unread: true
    };

    setNotifications((prev) => [viewNotif, ...prev]);
    saveNotificationToFirestore(viewNotif);
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const sendInterest = (profileId) => {
    if (!user) return;

    // Check if already sent
    const alreadySent = (interests.sent || []).some((item) =>
      typeof item === 'string'
        ? item === profileId
        : (String(item.profileId) === String(profileId) && String(item.senderId) === String(user.id))
    );
    if (alreadySent) return;

    const senderName = user.name || 'A verified member';
    const senderPhoto = user.avatar || user.photos?.[0] || null;

    const sentEntry = { 
      profileId: profileId, 
      senderId: user.id, 
      senderName: senderName,
      senderEmail: user.email || '',
      senderPhoto: senderPhoto,
      timestamp: 'Just now' 
    };

    const receivedEntry = { 
      profileId: user.id, 
      targetUserId: profileId, 
      senderId: user.id,
      senderName: senderName,
      senderEmail: user.email || '',
      senderPhoto: senderPhoto,
      senderGender: user.gender,
      senderDistrict: user.district,
      senderCaste: user.caste,
      timestamp: 'Just now' 
    };

    setInterests((prev) => {
      const updated = {
        ...prev,
        sent: [...prev.sent, sentEntry],
        received: [
          ...prev.received.filter(
            (item) => !(String(item.profileId) === String(user.id) && String(item.targetUserId) === String(profileId))
          ),
          receivedEntry
        ]
      };
      saveInterestsToFirestore(updated);
      return updated;
    });

    // Add notification for target user receiving the interest
    const interestNotif = {
      id: Date.now(),
      type: 'interest',
      profileId: user.id,
      targetUserId: profileId,
      title: 'New Interest Received! ❤️',
      text: `${senderName} expressed interest in your profile.`,
      time: 'Just now',
      unread: true
    };
    setNotifications((prev) => [interestNotif, ...prev]);
    saveNotificationToFirestore(interestNotif);

    addToast('Interest sent successfully! Communication will unlock once accepted.', 'success');
  };

  const acceptInterest = (profileId) => {
    if (!user) return;

    const acceptedEntry = { user1: user.id, user2: profileId, profileId: profileId, timestamp: 'Just now' };

    setInterests((prev) => {
      const updated = {
        ...prev,
        received: prev.received.filter((item) => String(item.profileId) !== String(profileId)),
        accepted: [...prev.accepted, acceptedEntry, profileId]
      };
      saveInterestsToFirestore(updated);
      return updated;
    });

    // Add notification for candidate whose interest was accepted
    const acceptedNotif = {
      id: Date.now(),
      type: 'accepted',
      profileId: user.id,
      targetUserId: profileId,
      title: 'Interest Accepted! 💕',
      text: `${user.name || 'A verified member'} accepted your interest request! You can now start chatting.`,
      time: 'Just now',
      unread: true
    };
    setNotifications((prev) => [acceptedNotif, ...prev]);
    saveNotificationToFirestore(acceptedNotif);

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
    if (!user) return;

    setInterests((prev) => {
      const updated = {
        ...prev,
        received: prev.received.filter((item) => String(item.profileId) !== String(profileId)),
        declined: [...prev.declined, { user1: user.id, user2: profileId, profileId: profileId }]
      };
      saveInterestsToFirestore(updated);
      return updated;
    });
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

  const sendMessage = (partnerProfileId, text) => {
    if (!text.trim() || !user) return false;

    const senderId = String(user.id);
    const targetId = String(partnerProfileId);
    const combinedKey = [senderId, targetId].sort().join('_');
    const now = new Date();

    const newMsg = {
      id: Date.now(),
      senderId: senderId,
      sender: 'user',
      text: text.trim(),
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: now.toISOString(),
      status: 'delivered'
    };

    setChats((prev) => {
      const existingCombined = prev[combinedKey] || [];
      const updatedThread = [...existingCombined, newMsg];

      // Save to Cloud Firestore
      saveChatToFirestore(combinedKey, updatedThread);

      return {
        ...prev,
        [combinedKey]: updatedThread
      };
    });

    return true;
  };

  const markChatAsRead = (partnerProfileId) => {
    if (!user || !partnerProfileId) return;

    const meId = String(user.id);
    const targetId = String(partnerProfileId);
    const combinedKey = [meId, targetId].sort().join('_');

    setChats((prev) => {
      const existingThread = prev[combinedKey] || [];
      let hasUnread = false;

      const updatedThread = existingThread.map((msg) => {
        if (String(msg.senderId) !== meId && msg.status !== 'read') {
          hasUnread = true;
          return { ...msg, status: 'read' };
        }
        return msg;
      });

      if (hasUnread) {
        saveChatToFirestore(combinedKey, updatedThread);
        return {
          ...prev,
          [combinedKey]: updatedThread
        };
      }

      return prev;
    });
  };

  // Calculate total unread messages count across all conversations for current user
  const totalUnreadMessagesCount = (() => {
    if (!user) return 0;
    const meId = String(user.id);
    let total = 0;
    Object.keys(chats).forEach((convoKey) => {
      if (convoKey.includes(meId)) {
        const thread = chats[convoKey] || [];
        thread.forEach((msg) => {
          if (String(msg.senderId) !== meId && msg.status !== 'read') {
            total++;
          }
        });
      }
    });
    return total;
  })();

  const markNotificationRead = (id) => {
    try {
      const readIds = JSON.parse(localStorage.getItem('reshimgath_read_notifications') || '[]');
      if (!readIds.includes(id)) {
        readIds.push(id);
        localStorage.setItem('reshimgath_read_notifications', JSON.stringify(readIds));
      }
    } catch (e) {}

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, unread: false };
          saveNotificationToFirestore(updated);
          return updated;
        }
        return n;
      })
    );
  };

  const markAllNotificationsRead = (targetIds) => {
    const idsToMark = targetIds || notifications.map((n) => n.id);
    try {
      const readIds = JSON.parse(localStorage.getItem('reshimgath_read_notifications') || '[]');
      const newReadIds = Array.from(new Set([...readIds, ...idsToMark]));
      localStorage.setItem('reshimgath_read_notifications', JSON.stringify(newReadIds));
    } catch (e) {}

    setNotifications((prev) =>
      prev.map((n) => {
        if (idsToMark.includes(n.id)) {
          const updated = { ...n, unread: false };
          saveNotificationToFirestore(updated);
          return updated;
        }
        return n;
      })
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
    setProfiles((prev) => prev.filter((p) => String(p.id) !== String(profileId)));
    deleteProfileFromFirestore(profileId);

    try {
      const deletedSaved = JSON.parse(localStorage.getItem('reshimgath_deleted_profiles') || '[]');
      if (!deletedSaved.includes(profileId)) {
        const updated = [...deletedSaved, profileId];
        localStorage.setItem('reshimgath_deleted_profiles', JSON.stringify(updated));
      }
    } catch (e) {}

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

  const updateSuccessStory = (storyId, updatedStoryData) => {
    setStories((prev) =>
      prev.map((s) => {
        if (String(s.id) === String(storyId)) {
          const updated = { ...s, ...updatedStoryData };
          saveSuccessStoryToFirestore(updated);
          return updated;
        }
        return s;
      })
    );
    addToast('Success story updated successfully!', 'success');
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
        markChatAsRead,
        totalUnreadMessagesCount,
        markNotificationRead,
        markAllNotificationsRead,
        recordProfileView,
        addToast,
        toggleVerifyProfile,
        addProfile,
        updateAdminProfile,
        deleteProfile,
        updateHomeContent,
        addSuccessStory,
        updateSuccessStory,
        deleteSuccessStory
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => useContext(ProfileContext);
