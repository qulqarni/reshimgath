import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, normalizeProfile } from './AuthContext';
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
  subscribeToNotificationsFromFirestore,
  saveInquiryToFirestore,
  deleteInquiryFromFirestore,
  subscribeToInquiriesFromFirestore
} from '../services/firebaseService';
import confetti from 'canvas-confetti';

const ProfileContext = createContext();

export const DEFAULT_INQUIRIES = [
  { id: 'inq_1', name: 'Suhas Patil', phone: '+91 98230 11223', email: 'suhas.patil@gmail.com', message: 'I would like to verify biodata PDF for profile ID p1.', date: 'Today, 10:15 AM', createdAt: new Date().toISOString(), resolved: false },
  { id: 'inq_2', name: 'Sunita Deshmukh', phone: '+91 98900 44556', email: 'sunita.d@gmail.com', message: 'Interested in registration assistance for my son in Ichalkaranji.', date: 'Yesterday, 4:30 PM', createdAt: new Date().toISOString(), resolved: true },
  { id: 'inq_3', name: 'Rajesh Kulkarni', phone: '+91 97654 32100', email: 'rajesh.k@gmail.com', message: 'Please update my native place to Kolhapur.', date: 'Aug 30, 2026', createdAt: new Date().toISOString(), resolved: false }
];

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
    const deletedIds = (() => {
      try {
        return JSON.parse(localStorage.getItem('reshimgath_deleted_profiles') || '[]');
      } catch (e) {
        return [];
      }
    })();

    const dummyIds = ['demo_m1', 'demo_m2', 'demo_f1', 'demo_f2', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
    const allExcluded = [...deletedIds, ...dummyIds];

    const saved = localStorage.getItem('reshimgath_profiles');
    if (saved) {
      const parsed = JSON.parse(saved);
      const cleaned = parsed.filter(p => !allExcluded.includes(String(p.id)));
      const map = new Map();
      MOCK_PROFILES.forEach(p => {
        const norm = normalizeGender(p);
        if (!allExcluded.includes(String(norm.id))) map.set(String(norm.id), norm);
      });
      cleaned.forEach((p, idx) => {
        const norm = normalizeProfile(p, idx);
        if (!allExcluded.includes(String(norm.id))) map.set(String(norm.id), norm);
      });
      return Array.from(map.values());
    }
    return MOCK_PROFILES.map((p, idx) => normalizeProfile(p, idx)).filter(p => !allExcluded.includes(String(p.id)));
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

  const [inquiries, setInquiries] = useState(() => {
    const saved = localStorage.getItem('reshimgath_inquiries');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_INQUIRIES;
  });

  const { user } = useAuth();

  // Sync logged-in candidate user profile changes into profiles array in real-time (Excludes Admin)
  useEffect(() => {
    if (user && user.id && !user.isAdmin && user.role !== 'admin' && user.id !== 'admin_1') {
      const normUser = normalizeProfile(user);
      setProfiles((prev) => {
        const index = prev.findIndex((p) => String(p.id) === String(normUser.id));
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...normUser };
          return updated;
        } else {
          return [normUser, ...prev];
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

      const dummyIds = ['demo_m1', 'demo_m2', 'demo_f1', 'demo_f2', 'p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
      const allExcluded = [...deletedIds, ...dummyIds];

      const isAdminCheck = (p) => p.isAdmin || p.role === 'admin' || p.id === 'admin_1' || (p.email && p.email.includes('admin'));

      setProfiles(() => {
        const map = new Map();

        // 1. Load live active profiles from Cloud Firestore
        if (firestoreProfiles && firestoreProfiles.length > 0) {
          firestoreProfiles.forEach((rawP, idx) => {
            const p = normalizeProfile(rawP, idx);
            if (!allExcluded.includes(String(p.id)) && !isAdminCheck(p)) {
              map.set(String(p.id), p);
            }
          });
        }

        // 2. Preserve logged-in candidate user profile if not yet synced in Firestore
        if (user && user.id && !user.isAdmin && user.role !== 'admin' && user.id !== 'admin_1') {
          const normUser = normalizeProfile(user);
          if (!allExcluded.includes(String(normUser.id))) {
            const existing = map.get(String(normUser.id));
            if (existing) {
              map.set(String(normUser.id), { ...existing, ...normUser });
            } else if (firestoreProfiles && firestoreProfiles.length === 0) {
              map.set(String(normUser.id), normUser);
            }
          }
        }

        const updatedList = Array.from(map.values()).filter((p) => !allExcluded.includes(String(p.id)) && !isAdminCheck(p));
        try {
          localStorage.setItem('reshimgath_profiles', JSON.stringify(updatedList));
        } catch (e) {}
        return updatedList;
      });
    });

    const unsubChats = subscribeToChatsFromFirestore((firestoreChats) => {
      if (firestoreChats && Object.keys(firestoreChats).length > 0) {
        setChats((prev) => ({ ...prev, ...firestoreChats }));
      }
    });

    const unsubInterests = subscribeToInterestsFromFirestore((firestoreInterests) => {
      if (firestoreInterests) {
        const cleanObjItem = (item) => {
          if (!item || typeof item !== 'object') return false;
          const idStr = String(item.profileId || item.user1 || item.senderId || '');
          return !['p1','p2','p3','p4','p5','p6','p7','p8','admin_1'].includes(idStr);
        };

        setInterests({
          sent: (firestoreInterests.sent || []).filter(cleanObjItem),
          received: (firestoreInterests.received || []).filter(cleanObjItem),
          accepted: (firestoreInterests.accepted || []).filter(cleanObjItem),
          declined: (firestoreInterests.declined || []).filter(cleanObjItem),
          shortlisted: (firestoreInterests.shortlisted || []).filter(id => typeof id === 'string')
        });
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

    const unsubInquiries = subscribeToInquiriesFromFirestore((firestoreInquiries) => {
      if (firestoreInquiries && firestoreInquiries.length > 0) {
        setInquiries(firestoreInquiries);
        try {
          localStorage.setItem('reshimgath_inquiries', JSON.stringify(firestoreInquiries));
        } catch (e) {}
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
      if (unsubInquiries) unsubInquiries();
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
        received: prev.received.filter((item) => {
          const pid = typeof item === 'string' ? item : item.profileId || item.senderId;
          return String(pid) !== String(profileId);
        }),
        accepted: [
          ...(prev.accepted || []).filter(a => typeof a === 'object' && a !== null),
          acceptedEntry
        ]
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

  const withdrawInterest = (profileId) => {
    if (!user) return;

    setInterests((prev) => {
      const updated = {
        ...prev,
        sent: (prev.sent || []).filter((item) => {
          const pid = typeof item === 'string' ? item : (item.profileId || item.targetUserId);
          const sid = typeof item === 'string' ? user.id : (item.senderId || item.user1);
          return !(String(pid).toLowerCase() === String(profileId).toLowerCase() && String(sid).toLowerCase() === String(user.id).toLowerCase());
        }),
        received: (prev.received || []).filter((item) => {
          const pid = typeof item === 'string' ? item : (item.profileId || item.senderId);
          const tid = typeof item === 'string' ? '' : (item.targetUserId || item.user2);
          return !(String(pid).toLowerCase() === String(user.id).toLowerCase() && String(tid).toLowerCase() === String(profileId).toLowerCase());
        })
      };
      saveInterestsToFirestore(updated);
      return updated;
    });

    addToast('Interest request withdrawn successfully.', 'info');
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
    const meId = String(user.id).toLowerCase();
    const isMeAdmin = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    let total = 0;

    Object.keys(chats).forEach((convoKey) => {
      const parts = convoKey.split('_').map((id) => id.toLowerCase());
      if (parts.includes(meId)) {
        const otherId = parts.find((id) => id !== meId);
        if (otherId) {
          const partner = profiles.find((p) => String(p.id).toLowerCase() === otherId);
          if (!isMeAdmin && partner && partner.blocked) {
            return;
          }
        }

        const thread = chats[convoKey] || [];
        thread.forEach((msg) => {
          if (String(msg.senderId).toLowerCase() !== meId && msg.status !== 'read') {
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
    const idStr = String(profileId);
    setProfiles((prev) => {
      const next = prev.map((p) => {
        if (String(p.id) === idStr) {
          const updated = { ...p, verified: !p.verified };
          saveProfileToFirestore(idStr, updated);
          return updated;
        }
        return p;
      });
      try {
        localStorage.setItem('reshimgath_profiles', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    addToast('Profile verification status updated successfully!', 'success');
  };

  const toggleBlockProfile = (profileId) => {
    const idStr = String(profileId);
    setProfiles((prev) => {
      const next = prev.map((p) => {
        if (String(p.id) === idStr) {
          const isCurrentlyBlocked = !!p.blocked;
          const updated = { ...p, blocked: !isCurrentlyBlocked };
          saveProfileToFirestore(idStr, updated);
          return updated;
        }
        return p;
      });
      try {
        localStorage.setItem('reshimgath_profiles', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    addToast('Profile block status updated successfully!', 'info');
  };

  const addProfile = (newProfileData) => {
    const id = 'p_' + Date.now();
    const createdProfile = normalizeProfile({
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
    });

    setProfiles((prev) => {
      const next = [createdProfile, ...prev];
      try {
        localStorage.setItem('reshimgath_profiles', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    saveProfileToFirestore(String(id), createdProfile);
    addToast('New profile registered successfully!', 'success');
    return createdProfile;
  };

  const updateAdminProfile = (profileId, updatedData) => {
    const idStr = String(profileId);
    setProfiles((prev) => {
      const next = prev.map((p) => {
        if (String(p.id) === idStr) {
          const merged = { ...p, ...updatedData };
          if (updatedData.gender) {
            const cleanG = String(updatedData.gender).toLowerCase().trim();
            merged.gender = cleanG;
            merged.lookingFor = cleanG;
            delete merged.looking_for;
            delete merged.seeking;
            delete merged.matchFor;
          }
          const updated = normalizeProfile(merged);
          saveProfileToFirestore(idStr, updated);
          return updated;
        }
        return p;
      });
      try {
        localStorage.setItem('reshimgath_profiles', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    try {
      const savedUser = JSON.parse(localStorage.getItem('reshimgath_user') || 'null');
      if (savedUser && String(savedUser.id) === idStr) {
        const mergedUser = { ...savedUser, ...updatedData };
        if (updatedData.gender) {
          const cleanG = String(updatedData.gender).toLowerCase().trim();
          mergedUser.gender = cleanG;
          mergedUser.lookingFor = cleanG;
          delete mergedUser.looking_for;
          delete mergedUser.seeking;
          delete mergedUser.matchFor;
        }
        const updatedUser = normalizeProfile(mergedUser);
        localStorage.setItem('reshimgath_user', JSON.stringify(updatedUser));
      }
    } catch (e) {}

    addToast('Profile updated successfully by Admin!', 'success');
  };

  const createAdminProfile = async (newProfileData) => {
    const timeStamp = Date.now();
    const newId = `p_${timeStamp}`;
    
    let nextRegNum = 1015;
    if (profiles.length > 0) {
      const existingNums = profiles.map(p => {
        const num = Number(String(p.registrationId || p.regId || '').replace(/[^0-9]/g, ''));
        return isNaN(num) ? 0 : num;
      });
      nextRegNum = Math.max(...existingNums, 1000) + 1;
    }

    const regIdStr = newProfileData.regId || `SS-${nextRegNum}`;
    const cleanGender = String(newProfileData.gender || 'female').toLowerCase().trim();

    const rawProfile = {
      id: newId,
      regId: regIdStr,
      registrationId: nextRegNum,
      createdAt: new Date().toISOString(),
      verified: newProfileData.verified !== undefined ? newProfileData.verified : true,
      blocked: false,
      gender: cleanGender,
      lookingFor: cleanGender,
      ...newProfileData
    };

    const normalized = normalizeProfile(rawProfile);

    setProfiles((prev) => {
      const updatedList = [normalized, ...prev];
      try {
        localStorage.setItem('reshimgath_profiles', JSON.stringify(updatedList));
      } catch (e) {}
      return updatedList;
    });

    await saveProfileToFirestore(newId, normalized);
    addToast(`New member profile (${normalized.name} — ${normalized.regId}) created successfully!`, 'success');
    return normalized;
  };

  const deleteProfile = async (profileId) => {
    const idStr = String(profileId);

    try {
      const deletedSaved = JSON.parse(localStorage.getItem('reshimgath_deleted_profiles') || '[]');
      if (!deletedSaved.includes(idStr)) {
        const updated = [...deletedSaved, idStr];
        localStorage.setItem('reshimgath_deleted_profiles', JSON.stringify(updated));
      }
    } catch (e) {}

    setProfiles((prev) => {
      const updated = prev.filter((p) => String(p.id) !== idStr);
      try {
        localStorage.setItem('reshimgath_profiles', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    await deleteProfileFromFirestore(idStr);
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

  const addInquiry = (data) => {
    const newInquiry = {
      id: `inq_${Date.now()}`,
      name: data.name || 'Anonymous Candidate',
      phone: data.phone || '',
      email: data.email || '',
      message: data.message || '',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      createdAt: new Date().toISOString(),
      resolved: false
    };

    setInquiries((prev) => {
      const next = [newInquiry, ...prev];
      try {
        localStorage.setItem('reshimgath_inquiries', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    saveInquiryToFirestore(newInquiry);
    addToast('Support inquiry submitted successfully! Our representative will contact you.', 'success');
    return newInquiry;
  };

  const toggleResolveInquiry = (inquiryId) => {
    setInquiries((prev) => {
      const next = prev.map((inq) => {
        if (String(inq.id) === String(inquiryId)) {
          const updated = { ...inq, resolved: !inq.resolved };
          saveInquiryToFirestore(updated);
          return updated;
        }
        return inq;
      });
      try {
        localStorage.setItem('reshimgath_inquiries', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    addToast('Inquiry resolution status updated!', 'info');
  };

  const deleteInquiry = (inquiryId) => {
    setInquiries((prev) => {
      const next = prev.filter((inq) => String(inq.id) !== String(inquiryId));
      try {
        localStorage.setItem('reshimgath_inquiries', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    deleteInquiryFromFirestore(inquiryId);
    addToast('Inquiry record deleted.', 'info');
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
        inquiries,
        addInquiry,
        toggleResolveInquiry,
        deleteInquiry,
        sendInterest,
        acceptInterest,
        declineInterest,
        withdrawInterest,
        toggleShortlist,
        sendMessage,
        markChatAsRead,
        totalUnreadMessagesCount,
        markNotificationRead,
        markAllNotificationsRead,
        recordProfileView,
        addToast,
        toggleVerifyProfile,
        toggleBlockProfile,
        addProfile,
        createAdminProfile,
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
