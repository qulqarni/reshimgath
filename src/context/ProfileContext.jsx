import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth, normalizeProfile, sortProfilesByLatest } from './AuthContext';
export { sortProfilesByLatest } from './AuthContext';
import { MOCK_PROFILES } from '../data/mockProfiles';
import { DEFAULT_SUBSCRIPTION_PLANS } from '../data/subscriptionPlans';
import { 
  fetchProfilesFromFirestore, 
  saveProfileToFirestore, 
  deleteProfileFromFirestore,
  fetchHomeContentFromFirestore,
  saveHomeContentToFirestore,
  fetchSubscriptionPlansFromFirestore,
  saveSubscriptionPlansToFirestore,
  fetchSuccessStoriesFromFirestore,
  saveSuccessStoryToFirestore,
  deleteSuccessStoryFromFirestore,
  fetchChatsFromFirestore,
  saveChatToFirestore,
  fetchInterestsFromFirestore,
  saveInterestsToFirestore,
  isProfileVisitedInFirestore,
  saveProfileViewToFirestore,
  saveNotificationToFirestore,
  subscribeToProfilesFromFirestore,
  subscribeToChatsFromFirestore,
  subscribeToInterestsFromFirestore,
  subscribeToProfileViewsFromFirestore,
  subscribeToNotificationsFromFirestore,
  saveInquiryToFirestore,
  deleteInquiryFromFirestore,
  subscribeToInquiriesFromFirestore,
  fetchReportsFromFirestore,
  saveReportToFirestore,
  updateReportInFirestore,
  deleteReportFromFirestore,
  subscribeToReportsFromFirestore,
  removePhotoFromProfileInFirestore,
  deleteChatMessageFromFirestore,
  fetchDeletionRequestsFromFirestore,
  updateDeletionRequestStatus,
  deleteUserAccount,
  fetchFeedbacksFromFirestore,
  saveFeedbackToFirestore,
  deleteFeedbackFromFirestore,
  fetchEventsFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  fetchGalleryFromFirestore,
  saveGalleryItemToFirestore,
  deleteGalleryItemFromFirestore
} from '../services/firebaseService';
import { doesProfileHavePhone } from '../utils/phoneUtils';
import { safeSetItem, evictStorageQuota } from '../utils/safeStorage';
import confetti from 'canvas-confetti';

// In-memory session tracking for profile visits to eliminate repeat Firestore reads
const sessionVisitedViewKeys = new Set();

const ProfileContext = createContext();

const normalizeVisitorTargetId = (id) => {
  if (!id) return '';
  return String(id).toLowerCase().trim().replace(/^ss-/, '');
};

const deduplicateViewNotifications = (notifsList) => {
  if (!Array.isArray(notifsList)) return [];
  const seenPairs = new Set();
  const seenMsgIds = new Set();
  const result = [];

  for (const n of notifsList) {
    if (!n) continue;
    if (n.type === 'view') {
      const vId = normalizeVisitorTargetId(n.visitor_user_id || n.visitorId || n.profileId);
      const tId = normalizeVisitorTargetId(n.profile_owner_user_id || n.targetUserId);
      if (vId && tId && vId === tId) continue;
      const key = `${vId}_${tId}`;
      if (key !== '_' && seenPairs.has(key)) continue;
      if (key !== '_') seenPairs.add(key);
    } else if (n.type === 'message') {
      const mId = String(n.messageId || n.id || '');
      if (mId && seenMsgIds.has(mId)) continue;
      if (mId) seenMsgIds.add(mId);
    }
    result.push(n);
  }

  return result;
};

const deduplicateProfileViews = (viewsList) => {
  if (!Array.isArray(viewsList)) return [];
  const seenPairs = new Set();
  const result = [];

  for (const v of viewsList) {
    if (!v) continue;
    const vId = normalizeVisitorTargetId(v.visitor_user_id || v.visitorId);
    const tId = normalizeVisitorTargetId(v.profile_owner_user_id || v.targetId || v.targetUserId);
    if (vId && tId && vId === tId) continue;
    const key = `${vId}_${tId}`;
    if (key !== '_' && seenPairs.has(key)) continue;
    if (key !== '_') seenPairs.add(key);
    result.push(v);
  }

  return result;
};

export const resolveNotificationProfile = (notification, profiles = []) => {
  if (!notification) return null;

  const personId = notification.profileId || notification.senderId || notification.visitorId;

  // 1. Direct ID match from profiles list
  if (personId && Array.isArray(profiles) && profiles.length > 0) {
    const idStr = String(personId).toLowerCase().trim();
    const matched = profiles.find((p) => {
      const pId = String(p.id || '').toLowerCase().trim();
      const pReg = String(p.regId || '').toLowerCase().trim();
      const pRegNum = String(p.registrationId || '').toLowerCase().trim();
      return pId === idStr || pReg === idStr || pRegNum === idStr || `ss-${pRegNum}` === idStr;
    });
    if (matched) return matched;
  }

  // 2. Direct senderRegId on notification
  if (notification.senderRegId && Array.isArray(profiles) && profiles.length > 0) {
    const regStr = String(notification.senderRegId).toLowerCase().trim();
    const matched = profiles.find((p) => {
      const pReg = String(p.regId || '').toLowerCase().trim();
      const pRegNum = String(p.registrationId || '').toLowerCase().trim();
      return pReg === regStr || pRegNum === regStr || `ss-${pRegNum}` === regStr;
    });
    if (matched) return matched;
  }

  // 3. Fallback: Search candidate by name from notification title, text, or senderName
  const notifSearchContent = `${notification.title || ''} ${notification.text || ''} ${notification.senderName || ''}`.toLowerCase().trim();
  if (notifSearchContent && Array.isArray(profiles) && profiles.length > 0) {
    const matchedByName = profiles.find((p) => {
      if (p.name) {
        const cleanName = p.name.toLowerCase().trim();
        if (cleanName.length >= 3 && notifSearchContent.includes(cleanName)) return true;
        const parts = cleanName.split(/\s+/).filter((w) => w.length >= 3);
        if (parts.length > 1 && parts.every((part) => notifSearchContent.includes(part))) return true;
      }
      if (p.nameMr) {
        const cleanMr = p.nameMr.trim();
        if (cleanMr.length >= 3 && notifSearchContent.includes(cleanMr)) return true;
      }
      return false;
    });
    if (matchedByName) return matchedByName;
  }

  // 4. Fallback: If not found in profiles, construct slug from senderRegId or personId
  if (notification.senderRegId) {
    return { id: notification.senderRegId, regId: notification.senderRegId };
  }
  if (personId) {
    return { id: personId, regId: String(personId).startsWith('SS-') ? personId : null };
  }

  return null;
};

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
  verifiedProfilesCountText: "Bureau-Screened Profiles",
  happyCouplesCountText: "Trusted Matrimonial Bureau",
  privacyProtectedText: "Privacy Protected",
  rightCardTitle: "Sambodhi Sarang Marriage Bureau",
  rightCardSubtitle: "॥ शुभमंगल सावधान ॥",
  rightCardDesc: "Connecting registered families across Pune, Mumbai, Kolhapur, Sangli, Satara, Solapur, Nashik, Ichalkaranji & across Maharashtra.",
  whyChooseTitle: "Why Families Choose Sambodhi Sarang",
  whyChooseSubtitle: "Designed with dignity, cultural respect, and privacy protection",
  ctaTitle: "Ready to Start Your Matrimonial Journey?",
  ctaSubtitle: "Connect with registered families seeking compatible alliances at Sambodhi Sarang Marriage Bureau.",
  popupAd: {
    enabled: false,
    imageUrl: "",
    title: "",
    subtitle: "",
    linkUrl: "",
    buttonText: "अधिक माहिती (View Details)",
    updatedAt: null
  }
};

export const DEFAULT_STORIES = [
  {
    id: 1,
    names: "Snehal & Swapnil",
    location: "Pune & Mumbai",
    quote: "“We found a compatible match through Sambodhi Sarang. The platform brought our two traditional families together seamlessly!”",
    weddingDate: "January 2026 • Pune Palace Ground",
    order: 1,
    published: true,
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
    quote: "“The profile review process and privacy controls made our family feel secure and respected. Very helpful for matrimonial search.”",
    weddingDate: "November 2025 • Sangli Wedding Hall",
    order: 2,
    published: true,
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
    order: 3,
    published: true,
    photos: [
      { url: "/story3.jpg", caption: "Dr. Radhika & Rohan at their fairy-lit evening reception in maroon Nauvari saree" },
      { url: "/story3_2.jpg", caption: "Auspicious wedding ring ritual ceremony" },
      { url: "/story1_2.jpg", caption: "Grand Varmala flower garland celebration" }
    ]
  }
];

export const DEFAULT_FEEDBACKS = [
  {
    id: 'fb_1',
    name: 'Sunil & Sunita Narade',
    type: 'text',
    message: 'Sambodhi Sarang Marriage Bureau is exceptionally trustworthy. The team personally verifies each candidate profile and family background with utmost dignity.',
    status: 'approved',
    published: true,
    rating: 5,
    date: 'March 2026',
    createdAt: '2026-03-15T10:00:00.000Z'
  },
  {
    id: 'fb_2',
    name: 'Anjali Deshmukh',
    type: 'photo',
    message: 'We found our daughter’s life partner in just 3 months. Transparent contact exchange and clean biodata verification made all the difference!',
    mediaUrl: '/story2.jpg',
    status: 'approved',
    published: true,
    rating: 5,
    date: 'February 2026',
    createdAt: '2026-02-18T12:30:00.000Z'
  },
  {
    id: 'fb_3',
    name: 'Mahesh Kulkarni',
    type: 'video',
    message: 'Heartfelt gratitude to Sambodhi Sarang! The online portal combined with local Ichalkaranji office guidance made our search seamless.',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'approved',
    published: true,
    rating: 5,
    date: 'January 2026',
    createdAt: '2026-01-10T14:20:00.000Z'
  }
];

export const DEFAULT_EVENTS = [
  {
    id: 'ev_1',
    title: 'Grand Vadhu-Var Melawa 2026 (भव्य वधू-वर मेळावा)',
    date: '2026-11-15',
    time: '10:00 AM - 5:00 PM',
    venue: 'Maharaja Palace Ground, Station Road, Kolhapur',
    city: 'Kolhapur',
    posterUrl: '/popup_banner.jpg',
    description: 'A grand matrimonial gathering bringing together screened prospective brides, grooms, and their families across Maharashtra. Direct face-to-face interaction, astrologer consultation, and instant profile registration.',
    registrationLink: 'https://wa.me/919823425404?text=Interested%20in%20Kolhapur%20Vadhu-Var%20Melawa%202026',
    registrationFee: 'Free for Registered Members',
    contactPhone: '+91 9823425404',
    published: true,
    order: 1,
    createdAt: '2026-04-01T10:00:00.000Z'
  },
  {
    id: 'ev_2',
    title: 'Engineers & Doctors Matrimonial Meet (इंजिनिअर व डॉक्टर विशेष परिचय मेळावा)',
    date: '2026-12-06',
    time: '11:00 AM - 4:00 PM',
    venue: 'Hotel Pearl Hall, Market Yard, Sangli',
    city: 'Sangli',
    posterUrl: '/event_placeholder.jpg',
    description: 'Exclusive match-making meet designed specifically for engineering, IT, medical, and civil service professionals. Meet like-minded professionals in a comfortable, respectful setting.',
    registrationLink: 'https://wa.me/919823425404?text=Interested%20in%20Engineers%20and%20Doctors%20Meet',
    registrationFee: '₹500 per family',
    contactPhone: '+91 9823425404',
    published: true,
    order: 2,
    createdAt: '2026-04-05T10:00:00.000Z'
  },
  {
    id: 'ev_3',
    title: 'Ichalkaranji Parichay Melawa 2025 (इचलकरंजी परिचय मेळावा)',
    date: '2025-10-12',
    time: '9:30 AM - 3:30 PM',
    venue: 'Sambodhi Sarang Bureau Hall, Main Road, Ichalkaranji',
    city: 'Ichalkaranji',
    posterUrl: '/popup_banner.jpg',
    description: 'Successful regional meet concluded with over 250 participating families and 42 successful matches initiated.',
    registrationLink: '',
    registrationFee: 'Free',
    contactPhone: '+91 9823425404',
    published: true,
    order: 3,
    createdAt: '2025-09-01T10:00:00.000Z'
  }
];

export const DEFAULT_GALLERY = [
  {
    id: 'gal_1',
    title: 'Kolhapur Melawa Auspicious Lamp Lighting',
    category: 'Events',
    type: 'photo',
    url: '/story1.jpg',
    caption: 'Dignitaries inaugurating the matrimonial get-together with traditional Deep Prajwalan.',
    order: 1,
    published: true
  },
  {
    id: 'gal_2',
    title: 'Family Consultations & Introductions',
    category: 'Events',
    type: 'photo',
    url: '/story2.jpg',
    caption: 'Parents and candidates engaging in friendly family discussions at the bureau lounge.',
    order: 2,
    published: true
  },
  {
    id: 'gal_3',
    title: 'Happy Newlywed Couple Blessing Ceremony',
    category: 'Weddings',
    type: 'photo',
    url: '/story3.jpg',
    caption: 'Couple celebrating their marriage milestone after finding each other through Sambodhi Sarang.',
    order: 3,
    published: true
  },
  {
    id: 'gal_4',
    title: 'Bureau Office & Reception Desk',
    category: 'Office',
    type: 'photo',
    url: '/logo.png',
    caption: 'Warm reception and dedicated counseling desk at Ichalkaranji headquarters.',
    order: 4,
    published: true
  },
  {
    id: 'gal_5',
    title: 'Annual Melawa Highlights & Couple Testimonials',
    category: 'Videos',
    type: 'video',
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    caption: 'Highlights from our annual family gathering celebrating 500+ successful matches.',
    order: 5,
    published: true
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
      return sortProfilesByLatest(Array.from(map.values()));
    }
    return sortProfilesByLatest(MOCK_PROFILES.map((p, idx) => normalizeProfile(p, idx)).filter(p => !allExcluded.includes(String(p.id))));
  });

  const [homeContent, setHomeContent] = useState(() => {
    const saved = localStorage.getItem('reshimgath_home_content');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_HOME_CONTENT,
          ...parsed,
          popupAd: {
            ...DEFAULT_HOME_CONTENT.popupAd,
            ...(parsed.popupAd || {})
          }
        };
      } catch (e) {}
    }
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

  const mergeWithDefaultPlans = (plans) => {
    if (!Array.isArray(plans)) return DEFAULT_SUBSCRIPTION_PLANS;
    return plans.map((p) => {
      const def = DEFAULT_SUBSCRIPTION_PLANS.find((dp) => dp.id === p.id) || {};
      return {
        ...def,
        ...p,
        features: Array.isArray(p.features) && p.features.length > 0 ? p.features : (def.features || [])
      };
    });
  };

  const [subscriptionPlans, setSubscriptionPlans] = useState(() => {
    const saved = localStorage.getItem('reshimgath_subscription_plans');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return mergeWithDefaultPlans(parsed);
      } catch (e) {}
    }
    return DEFAULT_SUBSCRIPTION_PLANS;
  });

  const [reports, setReports] = useState(() => {
    const saved = localStorage.getItem('reshimgath_reports');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [deletionRequests, setDeletionRequests] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('reshimgath_deletion_requests') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [feedbacks, setFeedbacks] = useState(() => {
    const saved = localStorage.getItem('reshimgath_feedbacks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_FEEDBACKS;
  });

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('reshimgath_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_EVENTS;
  });

  const [gallery, setGallery] = useState(() => {
    const saved = localStorage.getItem('reshimgath_gallery');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_GALLERY;
  });


  const { user, hasActiveSubscription, canViewProfile, unlockProfileForUser, isUserBlocked, blockUser, unblockUser } = useAuth();

  // Global subscription modal control for actions that require membership (Send Interest, Connect, Unlock)
  const [subModalConfig, setSubModalConfig] = useState({
    isOpen: false,
    targetProfileName: null,
    reason: null
  });

  const openSubscriptionModal = (targetProfileName = null, reason = 'send_interest') => {
    setSubModalConfig({
      isOpen: true,
      targetProfileName,
      reason
    });
  };

  const closeSubscriptionModal = () => {
    setSubModalConfig({
      isOpen: false,
      targetProfileName: null,
      reason: null
    });
  };

  // Sync logged-in candidate user profile changes into profiles array in real-time (Excludes Admin)
  useEffect(() => {
    if (user && user.id && !user.isAdmin && user.role !== 'admin' && user.id !== 'admin_1') {
      const normUser = normalizeProfile(user);
      setProfiles((prev) => {
        const index = prev.findIndex((p) => String(p.id) === String(normUser.id));
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...normUser };
          return sortProfilesByLatest(updated);
        } else {
          return sortProfilesByLatest([normUser, ...prev]);
        }
      });
    }
  }, [user]);

  // 1. Public Content & Profiles Subscription (Shared, Cached with persistent cache)
  useEffect(() => {
    // Evict any stale/oversized caches on startup to maintain ample storage headroom
    evictStorageQuota();

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
        const sortedList = sortProfilesByLatest(updatedList);
        setTimeout(() => {
          safeSetItem('reshimgath_profiles', sortedList);
        }, 50);
        return sortedList;
      });
    });

    const loadPublicContent = async () => {
      const firestoreHome = await fetchHomeContentFromFirestore();
      if (firestoreHome) {
        setHomeContent((prev) => ({
          ...prev,
          ...firestoreHome,
          popupAd: {
            ...DEFAULT_HOME_CONTENT.popupAd,
            ...(prev.popupAd || {}),
            ...(firestoreHome.popupAd || {})
          }
        }));
      }
      const firestoreStories = await fetchSuccessStoriesFromFirestore();
      if (firestoreStories && firestoreStories.length > 0) {
        setStories(firestoreStories);
      }
      const firestorePlans = await fetchSubscriptionPlansFromFirestore();
      if (firestorePlans && Array.isArray(firestorePlans) && firestorePlans.length > 0) {
        const merged = mergeWithDefaultPlans(firestorePlans);
        setSubscriptionPlans(merged);
        try {
          localStorage.setItem('reshimgath_subscription_plans', JSON.stringify(merged));
        } catch (e) {}
      }
      const firestoreFeedbacks = await fetchFeedbacksFromFirestore(false);
      if (firestoreFeedbacks && Array.isArray(firestoreFeedbacks) && firestoreFeedbacks.length > 0) {
        setFeedbacks(firestoreFeedbacks);
        try {
          localStorage.setItem('reshimgath_feedbacks', JSON.stringify(firestoreFeedbacks));
        } catch (e) {}
      }
      const firestoreEvents = await fetchEventsFromFirestore(false);
      if (firestoreEvents && Array.isArray(firestoreEvents) && firestoreEvents.length > 0) {
        setEvents(firestoreEvents);
        try {
          localStorage.setItem('reshimgath_events', JSON.stringify(firestoreEvents));
        } catch (e) {}
      }
      const firestoreGallery = await fetchGalleryFromFirestore(false);
      if (firestoreGallery && Array.isArray(firestoreGallery) && firestoreGallery.length > 0) {
        setGallery(firestoreGallery);
        try {
          localStorage.setItem('reshimgath_gallery', JSON.stringify(firestoreGallery));
        } catch (e) {}
      }
    };
    loadPublicContent();

    return () => {
      unsubProfiles();
    };
  }, []);

  // 2. User & Admin Scoped Real-Time Subscriptions (Only active when logged in)
  useEffect(() => {
    if (!user || !user.id) {
      return;
    }

    const isUserAdmin = Boolean(
      user.isAdmin || 
      user.role === 'admin' || 
      user.id === 'admin_1' || 
      (user.email && user.email.includes('admin'))
    );

    const unsubChats = subscribeToChatsFromFirestore((firestoreChats) => {
      if (firestoreChats && Object.keys(firestoreChats).length > 0) {
        setChats((prev) => ({ ...prev, ...firestoreChats }));
      }
    }, user.id, isUserAdmin);

    const unsubInterests = subscribeToInterestsFromFirestore((firestoreInterests) => {
      if (firestoreInterests) {
        const cleanObjItem = (item) => {
          if (!item || typeof item !== 'object') return false;
          const idStr = String(item.profileId || item.user1 || item.senderId || '');
          return !['p1','p2','p3','p4','p5','p6','p7','p8','admin_1'].includes(idStr);
        };

        const incomingUnlocked = firestoreInterests.unlockedConnections || [];
        if (incomingUnlocked.length > 0) {
          try {
            localStorage.setItem('reshimgath_unlocked_connections', JSON.stringify(incomingUnlocked));
          } catch (e) {}
        }

        setInterests({
          sent: (firestoreInterests.sent || []).filter(cleanObjItem),
          received: (firestoreInterests.received || []).filter(cleanObjItem),
          accepted: (firestoreInterests.accepted || []).filter(cleanObjItem),
          declined: (firestoreInterests.declined || []).filter(cleanObjItem),
          shortlisted: (firestoreInterests.shortlisted || []).filter(id => typeof id === 'string'),
          unlockedConnections: incomingUnlocked
        });
      }
    });

    const unsubViews = subscribeToProfileViewsFromFirestore((firestoreViews) => {
      if (firestoreViews && firestoreViews.length > 0) {
        setProfileViews(deduplicateProfileViews(firestoreViews));
      }
    }, user.id, isUserAdmin);

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
        setNotifications(deduplicateViewNotifications(updated));
      }
    }, user.id, isUserAdmin);

    let unsubInquiries = null;
    let unsubReports = null;

    if (isUserAdmin) {
      unsubInquiries = subscribeToInquiriesFromFirestore((firestoreInquiries) => {
        if (firestoreInquiries && firestoreInquiries.length > 0) {
          setInquiries(firestoreInquiries);
          try {
            localStorage.setItem('reshimgath_inquiries', JSON.stringify(firestoreInquiries));
          } catch (e) {}
        }
      });

      unsubReports = subscribeToReportsFromFirestore((firestoreReports) => {
        if (firestoreReports && Array.isArray(firestoreReports)) {
          setReports(firestoreReports);
          try {
            localStorage.setItem('reshimgath_reports', JSON.stringify(firestoreReports));
          } catch (e) {}
        }
      });

      fetchDeletionRequestsFromFirestore().then((firestoreDeletions) => {
        if (firestoreDeletions && Array.isArray(firestoreDeletions)) {
          setDeletionRequests(firestoreDeletions);
          try {
            localStorage.setItem('reshimgath_deletion_requests', JSON.stringify(firestoreDeletions));
          } catch (e) {}
        }
      }).catch((e) => console.warn('Admin deletions fetch error:', e));

      // Admin view for all feedbacks, events, and gallery items
      fetchFeedbacksFromFirestore(true).then((fb) => {
        if (fb && Array.isArray(fb) && fb.length > 0) {
          setFeedbacks(fb);
        }
      }).catch(() => {});
      fetchEventsFromFirestore(true).then((ev) => {
        if (ev && Array.isArray(ev) && ev.length > 0) {
          setEvents(ev);
        }
      }).catch(() => {});
      fetchGalleryFromFirestore(true).then((gal) => {
        if (gal && Array.isArray(gal) && gal.length > 0) {
          setGallery(gal);
        }
      }).catch(() => {});
    }

    return () => {
      if (unsubChats) unsubChats();
      if (unsubInterests) unsubInterests();
      if (unsubViews) unsubViews();
      if (unsubNotifs) unsubNotifs();
      if (unsubInquiries) unsubInquiries();
      if (unsubReports) unsubReports();
    };
  }, [user?.id, user?.isAdmin, user?.role, user?.email]);

  useEffect(() => {
    safeSetItem('reshimgath_subscription_plans', subscriptionPlans);
  }, [subscriptionPlans]);

  useEffect(() => {
    safeSetItem('reshimgath_profiles', profiles);
  }, [profiles]);

  useEffect(() => {
    safeSetItem('reshimgath_home_content', homeContent);
  }, [homeContent]);

  useEffect(() => {
    safeSetItem('reshimgath_stories', stories);
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
        shortlisted: (parsed.shortlisted || []).filter(cleanItem),
        unlockedConnections: parsed.unlockedConnections || []
      };
    }
    return {
      sent: [],
      received: [],
      accepted: [],
      declined: [],
      shortlisted: [],
      unlockedConnections: []
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
      const cleaned = parsed
        .filter((n) => !(n.type === 'view' && String(n.profileId) === String(n.targetUserId)))
        .map((n) => (readIds.includes(n.id) ? { ...n, unread: false } : n));
      return deduplicateViewNotifications(cleaned);
    }
    return [];
  });

  // Clean Profile Views / Visitors store (filter out self views)
  const [profileViews, setProfileViews] = useState(() => {
    const saved = localStorage.getItem('reshimgath_profile_views');
    if (saved) {
      const parsed = JSON.parse(saved);
      return deduplicateProfileViews(parsed);
    }
    return [];
  });

  // Toast notifications trigger queue
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    safeSetItem('reshimgath_interests', interests);
  }, [interests]);

  useEffect(() => {
    const timer = setTimeout(() => {
      safeSetItem('reshimgath_chats', chats);
    }, 400);
    return () => clearTimeout(timer);
  }, [chats]);

  useEffect(() => {
    safeSetItem('reshimgath_profile_views', profileViews);
  }, [profileViews]);

  useEffect(() => {
    safeSetItem('reshimgath_notifications', notifications);
  }, [notifications]);

  const recordProfileView = async (targetProfile, viewerUser) => {
    if (!targetProfile || !viewerUser) return;

    const cleanVisitorId = normalizeVisitorTargetId(viewerUser.id);
    const cleanTargetId = normalizeVisitorTargetId(targetProfile.id);

    // Rule 1: Do NOT record view or create notification if user is viewing their own profile
    if (!cleanVisitorId || !cleanTargetId || cleanVisitorId === cleanTargetId) {
      return;
    }
    if (viewerUser.email && targetProfile.email && viewerUser.email === targetProfile.email) {
      return;
    }

    // Rule: Do NOT record view or create notification if either user has blocked the other
    const viewerBlocked = Array.isArray(viewerUser.blockedUsers) && viewerUser.blockedUsers.some(b => {
      const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
      return bId === cleanTargetId;
    });
    const targetBlocked = Array.isArray(targetProfile.blockedUsers) && targetProfile.blockedUsers.some(b => {
      const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
      return bId === cleanVisitorId;
    });
    if (viewerBlocked || targetBlocked) {
      return;
    }

    const docKey = `${cleanVisitorId}_${cleanTargetId}`;

    // Fast-path: Check in-memory session cache first to eliminate duplicate reads
    if (sessionVisitedViewKeys.has(docKey)) {
      return;
    }

    // Rule 2: Check if visitor_user_id + profile_owner_user_id pair already exists in local profileViews state
    const alreadyVisitedLocally = (profileViews || []).some((v) => {
      if (!v) return false;
      const vId = normalizeVisitorTargetId(v.visitor_user_id || v.visitorId);
      const tId = normalizeVisitorTargetId(v.profile_owner_user_id || v.targetId || v.targetUserId);
      return vId === cleanVisitorId && tId === cleanTargetId;
    });

    // Rule 3: Check if visitor_user_id + profile_owner_user_id pair already exists in local notifications state
    const alreadyNotifiedLocally = (notifications || []).some((n) => {
      if (!n || n.type !== 'view') return false;
      const vId = normalizeVisitorTargetId(n.visitor_user_id || n.visitorId || n.profileId);
      const tId = normalizeVisitorTargetId(n.profile_owner_user_id || n.targetUserId);
      return vId === cleanVisitorId && tId === cleanTargetId;
    });

    if (alreadyVisitedLocally || alreadyNotifiedLocally) {
      sessionVisitedViewKeys.add(docKey);
      return;
    }

    // Rule 4: Database-level check to prevent duplicate records/notifications from concurrent requests or page refreshes
    const existsInDb = await isProfileVisitedInFirestore(cleanVisitorId, cleanTargetId);
    if (existsInDb) {
      sessionVisitedViewKeys.add(docKey);
      return;
    }
    sessionVisitedViewKeys.add(docKey);

    const viewEntry = {
      id: docKey,
      visitor_user_id: viewerUser.id,
      visitorId: viewerUser.id,
      profile_owner_user_id: targetProfile.id,
      targetUserId: targetProfile.id,
      targetId: targetProfile.id,
      visitorName: viewerUser.name || 'A Member',
      occupation: viewerUser.occupation || 'Professional',
      location: viewerUser.district || 'Maharashtra',
      avatar: viewerUser.avatar || null,
      first_visited_at: new Date().toISOString(),
      timestamp: 'Just now',
      updatedAt: new Date().toISOString()
    };

    const viewNotif = {
      id: Date.now(),
      type: 'view',
      profileId: viewerUser.id,
      visitorId: viewerUser.id,
      visitor_user_id: viewerUser.id,
      targetUserId: targetProfile.id,
      profile_owner_user_id: targetProfile.id,
      senderName: viewerUser.name || 'A verified member',
      senderRegId: viewerUser.regId || (viewerUser.registrationId ? `SS-${viewerUser.registrationId}` : null),
      senderAvatar: viewerUser.avatar || viewerUser.photos?.[0] || null,
      title: 'Profile Visited! 👁️',
      text: `${viewerUser.name || 'A verified member'} viewed your profile.`,
      time: 'Just now',
      unread: true
    };

    setProfileViews((prev) => deduplicateProfileViews([viewEntry, ...prev]));

    setNotifications((prev) => deduplicateViewNotifications([viewNotif, ...prev]));

    saveProfileViewToFirestore(viewEntry, viewNotif);
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const matchId = (a, b) => {
    if (!a || !b) return false;
    const strA = String(a).toLowerCase().trim();
    const strB = String(b).toLowerCase().trim();
    const cleanA = strA.replace(/^ss-/, '');
    const cleanB = strB.replace(/^ss-/, '');
    return strA === strB || cleanA === cleanB;
  };

  const sendInterest = (profileId) => {
    if (!user) {
      addToast('Please log in to send an interest.', 'warning');
      return false;
    }

    if (!profileId) {
      addToast('Invalid profile selection.', 'error');
      return false;
    }

    const myId = user.id;
    const targetId = profileId;

    if (isUserBlocked && isUserBlocked(profileId)) {
      addToast('Cannot send interest. You have blocked this member.', 'error');
      return false;
    }

    const targetP = profiles.find(p => String(p.id) === String(profileId));
    if (targetP && Array.isArray(targetP.blockedUsers)) {
      const myCleanId = String(user.id).toLowerCase().trim().replace(/^ss-/, '');
      const blockedMe = targetP.blockedUsers.some(b => {
        const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
        return bId === myCleanId;
      });
      if (blockedMe) {
        addToast('Cannot send interest. This member is unavailable.', 'error');
        return false;
      }
    }

    if (targetP && targetP.blocked) {
      addToast('Cannot send interest. This member profile is inactive.', 'error');
      return false;
    }

    // Check if already sent
    const alreadySent = (interests.sent || []).some((item) => {
      if (!item) return false;
      if (typeof item === 'string') return matchId(item, targetId);
      const sId = item.senderId || item.user1;
      const pId = item.profileId || item.targetUserId || item.user2;
      return (matchId(sId, myId) || !sId) && matchId(pId, targetId);
    });

    if (alreadySent) {
      addToast('Interest request is already pending.', 'info');
      return true;
    }

    const senderName = user.name || 'A verified member';
    const senderPhoto = user.avatar || user.photo || user.photos?.[0] || null;

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
        sent: [
          ...(prev.sent || []).filter(item => {
            if (!item) return false;
            const pId = typeof item === 'string' ? item : (item.profileId || item.targetUserId || item.user2);
            return !matchId(pId, targetId);
          }),
          sentEntry
        ],
        received: [
          ...(prev.received || []).filter((item) => {
            if (!item) return false;
            const sId = typeof item === 'string' ? item : (item.senderId || item.user1);
            const tId = typeof item === 'string' ? item : (item.targetUserId || item.profileId || item.user2);
            return !(matchId(sId, myId) && matchId(tId, targetId));
          }),
          receivedEntry
        ]
      };
      saveInterestsToFirestore(updated);
      try {
        localStorage.setItem('reshimgath_interests', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Add notification for target user receiving the interest
    const interestNotif = {
      id: Date.now(),
      type: 'interest',
      profileId: user.id,
      senderId: user.id,
      targetUserId: profileId,
      senderName: senderName,
      senderRegId: user.regId || (user.registrationId ? `SS-${user.registrationId}` : null),
      senderAvatar: senderPhoto,
      title: 'New Interest Received! ❤️',
      text: `${senderName} expressed interest in your profile.`,
      time: 'Just now',
      unread: true
    };
    setNotifications((prev) => [interestNotif, ...prev]);
    saveNotificationToFirestore(interestNotif);

    addToast('Interest sent successfully! ❤️', 'success');
    return true;
  };

  const acceptInterest = (profileId) => {
    if (!user) {
      addToast('Please log in to accept an interest.', 'warning');
      return false;
    }

    const acceptedEntry = { user1: user.id, user2: profileId, profileId: profileId, timestamp: 'Just now' };

    setInterests((prev) => {
      const updated = {
        ...prev,
        received: (prev.received || []).filter((item) => {
          if (!item) return false;
          const pid = typeof item === 'string' ? item : item.profileId || item.senderId;
          return !matchId(pid, profileId);
        }),
        accepted: [
          ...(prev.accepted || []).filter(a => {
            if (!a) return false;
            if (typeof a === 'string') return !matchId(a, profileId);
            const u1 = a.user1 || a.senderId;
            const u2 = a.user2 || a.targetUserId || a.profileId;
            return !( (matchId(u1, user.id) && matchId(u2, profileId)) || (matchId(u1, profileId) && matchId(u2, user.id)) );
          }),
          acceptedEntry
        ]
      };
      saveInterestsToFirestore(updated);
      try {
        localStorage.setItem('reshimgath_interests', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // Add notification for candidate whose interest was accepted
    const acceptedNotif = {
      id: Date.now(),
      type: 'accepted',
      profileId: user.id,
      senderId: user.id,
      targetUserId: profileId,
      senderName: user.name || 'A verified member',
      senderRegId: user.regId || (user.registrationId ? `SS-${user.registrationId}` : null),
      title: 'Interest Accepted! 💕',
      text: `${user.name || 'A verified member'} accepted your interest request!`,
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

    addToast('Interest Accepted!', 'success');
    return true;
  };

  const declineInterest = (profileId) => {
    if (!user) return;

    setInterests((prev) => {
      const updated = {
        ...prev,
        received: (prev.received || []).filter((item) => {
          if (!item) return false;
          const pid = typeof item === 'string' ? item : item.profileId || item.senderId;
          return !matchId(pid, profileId);
        }),
        declined: [
          ...(prev.declined || []).filter(d => {
            if (!d) return false;
            if (typeof d === 'string') return !matchId(d, profileId);
            const u1 = d.user1 || d.senderId;
            const u2 = d.user2 || d.targetUserId || d.profileId;
            return !( (matchId(u1, user.id) && matchId(u2, profileId)) || (matchId(u1, profileId) && matchId(u2, user.id)) );
          }),
          { user1: user.id, user2: profileId, profileId: profileId }
        ]
      };
      saveInterestsToFirestore(updated);
      try {
        localStorage.setItem('reshimgath_interests', JSON.stringify(updated));
      } catch (e) {}
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
          if (!item) return false;
          const pid = typeof item === 'string' ? item : (item.profileId || item.targetUserId);
          const sid = typeof item === 'string' ? user.id : (item.senderId || item.user1);
          return !(matchId(pid, profileId) && (matchId(sid, user.id) || !sid));
        }),
        received: (prev.received || []).filter((item) => {
          if (!item) return false;
          const pid = typeof item === 'string' ? item : (item.profileId || item.senderId);
          const tid = typeof item === 'string' ? '' : (item.targetUserId || item.user2);
          return !(matchId(pid, user.id) && matchId(tid, profileId));
        })
      };
      saveInterestsToFirestore(updated);
      try {
        localStorage.setItem('reshimgath_interests', JSON.stringify(updated));
      } catch (e) {}
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

  const sendMessage = useCallback((partnerProfileId, text) => {
    if (!text || !text.trim() || !user) return false;

    if (isUserBlocked && isUserBlocked(partnerProfileId)) {
      addToast('Cannot send message. You have blocked this member.', 'error');
      return false;
    }

    const partnerProfile = profiles.find(p => String(p.id) === String(partnerProfileId));
    if (partnerProfile && Array.isArray(partnerProfile.blockedUsers)) {
      const myCleanId = String(user.id).toLowerCase().trim().replace(/^ss-/, '');
      const blockedMe = partnerProfile.blockedUsers.some(b => {
        const bId = String(typeof b === 'object' ? b.id : b).toLowerCase().trim().replace(/^ss-/, '');
        return bId === myCleanId;
      });
      if (blockedMe) {
        addToast('Cannot send message. This member is unavailable.', 'error');
        return false;
      }
    }

    if (partnerProfile && partnerProfile.blocked) {
      addToast('Cannot send message. This account is suspended.', 'error');
      return false;
    }

    const senderId = String(user.id);
    const targetId = String(partnerProfileId);
    const cleanSenderId = senderId.toLowerCase().trim().replace(/^ss-/, '');
    const cleanTargetId = targetId.toLowerCase().trim().replace(/^ss-/, '');

    const combinedKey = [senderId, targetId].sort().join('_');
    const now = new Date();
    const msgId = Date.now();

    const newMsg = {
      id: msgId,
      senderId: senderId,
      sender: 'user',
      text: text.trim(),
      timestamp: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
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

    // Rule: Do NOT create message notification for self-messages
    if (cleanSenderId === cleanTargetId || (user.email && user.email === partnerProfileId)) {
      return true;
    }

    // Create privacy-safe notification document (NEVER includes message body/content)
    const senderName = user.name || 'A verified member';
    const senderPhoto = user.photo || user.photos?.[0] || user.avatar || null;
    const notifId = `msg_notif_${msgId}`;

    const messageNotif = {
      id: notifId,
      docId: notifId,
      messageId: msgId,
      chatId: combinedKey,
      conversationId: combinedKey,
      type: 'message',
      profileId: senderId,
      senderId: senderId,
      visitor_user_id: senderId,
      targetUserId: targetId,
      profile_owner_user_id: targetId,
      senderName: senderName,
      senderRegId: user.regId || (user.registrationId ? `SS-${user.registrationId}` : null),
      senderAvatar: senderPhoto,
      title: 'New Message',
      text: `${senderName} sent you a message.`,
      time: 'Just now',
      unread: true
    };

    setNotifications((prev) => {
      const exists = (prev || []).some((n) => {
        if (!n || n.type !== 'message') return false;
        return String(n.messageId || n.id) === String(msgId) || String(n.id) === notifId;
      });
      if (exists) return prev;
      return [messageNotif, ...prev];
    });

    saveNotificationToFirestore(messageNotif);

    return true;
  }, [user, profiles, isUserBlocked, addToast]);

  const markChatAsRead = useCallback((partnerProfileId) => {
    if (!user || !partnerProfileId) return;

    const meId = String(user.id);
    const targetId = String(partnerProfileId);
    const combinedKey = [meId, targetId].sort().join('_');

    setChats((prev) => {
      const existingThread = prev[combinedKey];
      if (!existingThread || existingThread.length === 0) return prev;

      // Fast check if any unread messages from partner exist before allocating array
      let hasUnread = false;
      for (let i = 0; i < existingThread.length; i++) {
        const msg = existingThread[i];
        if (String(msg.senderId) !== meId && msg.status !== 'read') {
          hasUnread = true;
          break;
        }
      }
      if (!hasUnread) return prev;

      const updatedThread = existingThread.map((msg) => {
        if (String(msg.senderId) !== meId && msg.status !== 'read') {
          return { ...msg, status: 'read' };
        }
        return msg;
      });

      saveChatToFirestore(combinedKey, updatedThread);
      return {
        ...prev,
        [combinedKey]: updatedThread
      };
    });
  }, [user]);

  // Calculate total unread messages count across all conversations for current user
  const totalUnreadMessagesCount = useMemo(() => {
    if (!user) return 0;
    const meId = String(user.id).toLowerCase();
    const isMeAdmin = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    let total = 0;

    // Fast blocked check map
    const blockedMap = new Map();
    if (!isMeAdmin) {
      profiles.forEach((p) => {
        if (p.blocked) blockedMap.set(String(p.id).toLowerCase(), true);
      });
    }

    Object.keys(chats).forEach((convoKey) => {
      const lowerKey = convoKey.toLowerCase();
      if (!lowerKey.includes(meId)) return;
      const parts = lowerKey.split('_');
      if (parts.includes(meId)) {
        const otherId = parts.find((id) => id !== meId);
        if (otherId && blockedMap.has(otherId)) {
          return;
        }

        const thread = chats[convoKey] || [];
        for (let i = 0; i < thread.length; i++) {
          const msg = thread[i];
          if (String(msg.senderId).toLowerCase() !== meId && msg.status !== 'read') {
            total++;
          }
        }
      }
    });
    return total;
  }, [user?.id, user?.isAdmin, user?.role, chats, profiles]);

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
      safeSetItem('reshimgath_profiles', next);
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
      safeSetItem('reshimgath_profiles', next);
      return next;
    });
    addToast('Profile block status updated successfully!', 'info');
  };

  const addProfile = (newProfileData) => {
    const candidatePhone = (newProfileData.phone || newProfileData.mobile || newProfileData.contactNumber || '').trim();
    if (candidatePhone) {
      const isDuplicate = profiles.some(p => doesProfileHavePhone(p, candidatePhone));
      if (isDuplicate) {
        addToast('This Mobile Number is already registered with another profile! Only 1 registration allowed per mobile number.', 'error');
        return null;
      }
    }

    const id = 'p_' + Date.now();
    const createdProfile = normalizeProfile({
      id,
      createdAt: new Date().toISOString(),
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
      const next = sortProfilesByLatest([createdProfile, ...prev]);
      safeSetItem('reshimgath_profiles', next);
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
      const sortedNext = sortProfilesByLatest(next);
      safeSetItem('reshimgath_profiles', sortedNext);
      return sortedNext;
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
        safeSetItem('reshimgath_user', updatedUser);
      }
    } catch (e) {}

    addToast('Profile updated successfully by Admin!', 'success');
  };

  const createAdminProfile = async (newProfileData) => {
    const candidatePhone = (newProfileData.phone || newProfileData.mobile || newProfileData.contactNumber || '').trim();
    if (candidatePhone) {
      const isDuplicate = profiles.some(p => doesProfileHavePhone(p, candidatePhone));
      if (isDuplicate) {
        addToast('This Mobile Number is already registered with another profile! Only 1 registration allowed per mobile number.', 'error');
        return null;
      }
    }

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
      const updatedList = sortProfilesByLatest([normalized, ...prev]);
      safeSetItem('reshimgath_profiles', updatedList);
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
        safeSetItem('reshimgath_deleted_profiles', updated);
      }
    } catch (e) {}

    setProfiles((prev) => {
      const updated = prev.filter((p) => String(p.id) !== idStr);
      safeSetItem('reshimgath_profiles', updated);
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

  const updateSubscriptionPlans = async (newPlans) => {
    setSubscriptionPlans(newPlans);
    try {
      localStorage.setItem('reshimgath_subscription_plans', JSON.stringify(newPlans));
    } catch (e) {}
    await saveSubscriptionPlansToFirestore(newPlans);
    addToast('Subscription plans and descriptions updated successfully!', 'success');
  };

  const addSuccessStory = (storyData) => {
    const newStory = {
      id: storyData.id || Date.now(),
      names: storyData.names,
      location: storyData.location || '',
      quote: storyData.quote || '',
      weddingDate: storyData.weddingDate || '',
      order: typeof storyData.order === 'number' ? storyData.order : 0,
      published: storyData.published !== false,
      photos: storyData.photos || [{ url: '/story1.jpg', caption: 'Couple portrait' }],
      createdAt: new Date().toISOString()
    };
    setStories((prev) => [newStory, ...prev]);
    saveSuccessStoryToFirestore(newStory);
    addToast('Success story saved successfully!', 'success');
    return newStory;
  };

  const updateSuccessStory = (storyId, updatedStoryData) => {
    setStories((prev) =>
      prev.map((s) => {
        if (String(s.id) === String(storyId)) {
          const updated = { ...s, ...updatedStoryData, updatedAt: new Date().toISOString() };
          saveSuccessStoryToFirestore(updated);
          return updated;
        }
        return s;
      })
    );
    addToast('Success story updated successfully!', 'success');
  };

  const deleteSuccessStory = (storyId) => {
    setStories((prev) => prev.filter((s) => String(s.id) !== String(storyId)));
    deleteSuccessStoryFromFirestore(storyId);
    addToast('Success story removed.', 'info');
  };

  // FEEDBACKS ACTIONS
  const addFeedback = (feedbackData) => {
    const newFeedback = {
      id: `fb_${Date.now()}`,
      name: feedbackData.name || 'Anonymous User',
      type: feedbackData.type || 'text', // 'text' | 'photo' | 'video'
      message: feedbackData.message || '',
      mediaUrl: feedbackData.mediaUrl || null,
      videoUrl: feedbackData.videoUrl || null,
      status: feedbackData.status || 'pending', // 'pending' | 'approved' | 'rejected'
      published: feedbackData.published || false,
      rating: feedbackData.rating || 5,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };
    setFeedbacks((prev) => {
      const next = [newFeedback, ...prev];
      try {
        localStorage.setItem('reshimgath_feedbacks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    saveFeedbackToFirestore(newFeedback);
    return newFeedback;
  };

  const updateFeedbackStatus = (feedbackId, status, published = null) => {
    setFeedbacks((prev) => {
      const next = prev.map((fb) => {
        if (String(fb.id) === String(feedbackId)) {
          const updated = { 
            ...fb, 
            status, 
            published: published !== null ? published : (status === 'approved')
          };
          saveFeedbackToFirestore(updated);
          return updated;
        }
        return fb;
      });
      try {
        localStorage.setItem('reshimgath_feedbacks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    addToast(`Feedback status updated to ${status}.`, 'info');
  };

  const deleteFeedback = (feedbackId) => {
    setFeedbacks((prev) => {
      const next = prev.filter((fb) => String(fb.id) !== String(feedbackId));
      try {
        localStorage.setItem('reshimgath_feedbacks', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    deleteFeedbackFromFirestore(feedbackId);
    addToast('Feedback item deleted.', 'info');
  };

  // EVENTS ACTIONS
  const addEvent = (eventData) => {
    const newEvent = {
      id: eventData.id || `ev_${Date.now()}`,
      title: eventData.title || 'Upcoming Matrimonial Event',
      date: eventData.date || '',
      time: eventData.time || '',
      venue: eventData.venue || '',
      city: eventData.city || 'Maharashtra',
      posterUrl: eventData.posterUrl || '/popup_banner.jpg',
      description: eventData.description || '',
      registrationLink: eventData.registrationLink || '',
      registrationFee: eventData.registrationFee || 'Free',
      contactPhone: eventData.contactPhone || '+91 9823425404',
      published: eventData.published !== false,
      order: typeof eventData.order === 'number' ? eventData.order : 0,
      createdAt: new Date().toISOString()
    };
    setEvents((prev) => {
      const next = [newEvent, ...prev].sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('reshimgath_events', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    saveEventToFirestore(newEvent);
    addToast('Event created successfully!', 'success');
    return newEvent;
  };

  const updateEvent = (eventId, updatedData) => {
    setEvents((prev) => {
      const next = prev.map((ev) => {
        if (String(ev.id) === String(eventId)) {
          const updated = { ...ev, ...updatedData, updatedAt: new Date().toISOString() };
          saveEventToFirestore(updated);
          return updated;
        }
        return ev;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('reshimgath_events', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    addToast('Event updated successfully!', 'success');
  };

  const deleteEvent = (eventId) => {
    setEvents((prev) => {
      const next = prev.filter((ev) => String(ev.id) !== String(eventId));
      try {
        localStorage.setItem('reshimgath_events', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    deleteEventFromFirestore(eventId);
    addToast('Event removed.', 'info');
  };

  // GALLERY ACTIONS
  const addGalleryItem = (itemData) => {
    const newItem = {
      id: itemData.id || `gal_${Date.now()}`,
      title: itemData.title || '',
      category: itemData.category || 'Events',
      type: itemData.type || 'photo', // 'photo' | 'video'
      url: itemData.url || '',
      caption: itemData.caption || '',
      order: typeof itemData.order === 'number' ? itemData.order : 0,
      published: itemData.published !== false,
      createdAt: new Date().toISOString()
    };
    setGallery((prev) => {
      const next = [newItem, ...prev].sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('reshimgath_gallery', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    saveGalleryItemToFirestore(newItem);
    addToast('Gallery item added successfully!', 'success');
    return newItem;
  };

  const updateGalleryItem = (itemId, updatedData) => {
    setGallery((prev) => {
      const next = prev.map((item) => {
        if (String(item.id) === String(itemId)) {
          const updated = { ...item, ...updatedData, updatedAt: new Date().toISOString() };
          saveGalleryItemToFirestore(updated);
          return updated;
        }
        return item;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));
      try {
        localStorage.setItem('reshimgath_gallery', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    addToast('Gallery item updated!', 'success');
  };

  const deleteGalleryItem = (itemId) => {
    setGallery((prev) => {
      const next = prev.filter((item) => String(item.id) !== String(itemId));
      try {
        localStorage.setItem('reshimgath_gallery', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    deleteGalleryItemFromFirestore(itemId);
    addToast('Gallery item deleted.', 'info');
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

  const submitReport = async ({ 
    targetType, 
    targetUserId, 
    targetId,
    targetName, 
    targetRegId, 
    reason, 
    details = '', 
    evidence = null, 
    reporterName, 
    reporterEmail, 
    reporterPhone,
    isChildSafety = false,
    priority = 'normal'
  }) => {
    const isCritical = isChildSafety || /child|minor|underage|csam|csae|grooming|बाल सुरक्षा|अल्पवयीन/i.test(reason || '') || priority === 'critical';
    const repName = user?.name || reporterName || 'Concerned Citizen';
    const repEmail = user?.email || reporterEmail || '';
    const repPhone = user?.phone || user?.mobile || reporterPhone || '';
    const effectiveTargetId = String(targetUserId || targetId || '');

    if (!user && !isCritical && !repEmail && !repPhone) {
      addToast('Please login or provide contact information to submit a report.', 'error');
      return null;
    }

    const reportId = `rep_${Date.now()}`;
    const newReport = {
      id: reportId,
      targetType: targetType || 'profile', // 'profile' | 'photo' | 'message'
      targetUserId: effectiveTargetId,
      targetId: effectiveTargetId,
      targetName: targetName || 'Member',
      targetRegId: targetRegId || '',
      reason: reason || 'Other violation',
      details: (details || '').trim(),
      evidence: evidence || null,
      evidencePhotoUrl: evidence?.photoUrl || (typeof evidence === 'string' ? evidence : null),
      evidenceText: evidence?.text || (typeof evidence === 'string' ? evidence : null),
      messageId: evidence?.messageId || null,
      reporterId: user ? String(user.id) : 'public_reporter',
      reporterName: repName,
      reporterRegId: user?.regId || (user?.registrationId ? `SS-${user.registrationId}` : ''),
      reporterEmail: repEmail,
      reporterPhone: repPhone,
      isChildSafety: isCritical,
      priority: isCritical ? 'critical' : 'normal',
      status: 'pending', // 'pending' | 'resolved' | 'dismissed'
      actionTaken: null,
      adminNotes: '',
      resolvedAt: null,
      resolvedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setReports((prev) => {
      const updated = [newReport, ...prev];
      try {
        localStorage.setItem('reshimgath_reports', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    await saveReportToFirestore(newReport);
    if (isCritical) {
      addToast('Urgent Child Safety report submitted. Our bureau moderation team prioritizes this for immediate review.', 'success');
    } else {
      addToast('Report submitted successfully! Sambodhi Sarang administration will review it.', 'success');
    }
    return { success: true, report: newReport };
  };

  const resolveReport = async (reportId, optionsOrStatus = 'resolved', actionTakenArg = 'Reviewed', adminNotesArg = '', resolvedByArg = 'Admin') => {
    let status = 'resolved';
    let actionTaken = 'Reviewed';
    let adminNotes = '';
    let resolvedBy = 'Admin';

    if (typeof optionsOrStatus === 'object' && optionsOrStatus !== null) {
      status = optionsOrStatus.status || 'resolved';
      actionTaken = optionsOrStatus.actionTaken || 'Reviewed';
      adminNotes = optionsOrStatus.adminNotes || '';
      resolvedBy = optionsOrStatus.resolvedBy || 'Admin';
    } else if (typeof optionsOrStatus === 'string') {
      status = optionsOrStatus;
      actionTaken = actionTakenArg;
      adminNotes = adminNotesArg;
      resolvedBy = resolvedByArg;
    }

    const now = new Date().toISOString();
    const updateData = {
      status,
      actionTaken,
      adminNotes,
      resolvedBy,
      resolvedAt: now,
      updatedAt: now
    };

    setReports((prev) => {
      const updated = prev.map((r) => String(r.id) === String(reportId) ? { ...r, ...updateData } : r);
      try {
        localStorage.setItem('reshimgath_reports', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    await updateReportInFirestore(reportId, updateData);
    addToast(`Report marked as ${status}.`, 'info');
    return true;
  };

  const dismissReport = async (reportId, adminNotes = 'Dismissed after review.', resolvedBy = 'Admin') => {
    return resolveReport(reportId, {
      status: 'dismissed',
      actionTaken: 'dismissed',
      adminNotes,
      resolvedBy
    });
  };

  const warnUser = async (targetUserId, warningMessage, reason = 'Community Guidelines') => {
    if (!targetUserId) return false;
    const warnNotif = {
      id: `warn_${Date.now()}`,
      type: 'admin_warning',
      title: 'Official Bureau Warning / ताकीद ⚠️',
      text: warningMessage || `You have received an official warning from Sambodhi Sarang administration regarding violation of ${reason}. Repeated violations will result in permanent account suspension.`,
      targetUserId: String(targetUserId),
      profileId: 'admin_1',
      senderId: 'admin_1',
      senderName: 'Bureau Administration',
      time: 'Just now',
      unread: true,
      createdAt: new Date().toISOString()
    };
    await saveNotificationToFirestore(warnNotif);
    setNotifications((prev) => [warnNotif, ...prev]);
    addToast('Official warning notification sent to member.', 'success');
    return true;
  };

  const removeViolatingContent = async (targetType, targetUserId, evidence) => {
    if (targetType === 'photo' && evidence?.photoUrl) {
      await removePhotoFromProfileInFirestore(targetUserId, evidence.photoUrl);
      setProfiles((prev) => {
        const next = prev.map((p) => {
          if (String(p.id) === String(targetUserId)) {
            const nextPhotos = (p.photos || []).filter(ph => (typeof ph === 'string' ? ph : ph?.url) !== evidence.photoUrl);
            let nextAvatar = p.avatar;
            if (nextAvatar === evidence.photoUrl) {
              nextAvatar = nextPhotos.length > 0 ? (typeof nextPhotos[0] === 'string' ? nextPhotos[0] : nextPhotos[0]?.url) : null;
            }
            const updated = { ...p, photos: nextPhotos, avatar: nextAvatar };
            saveProfileToFirestore(p.id, updated);
            return updated;
          }
          return p;
        });
        safeSetItem('reshimgath_profiles', next);
        return next;
      });
      addToast('Violating photo removed from member profile.', 'success');
      return true;
    } else if (targetType === 'message' && evidence?.messageId && evidence?.chatId) {
      await deleteChatMessageFromFirestore(evidence.chatId, evidence.messageId);
      setChats((prev) => {
        const thread = prev[evidence.chatId] || [];
        const nextThread = thread.filter(m => String(m.id) !== String(evidence.messageId));
        return {
          ...prev,
          [evidence.chatId]: nextThread
        };
      });
      addToast('Violating message removed from conversation.', 'success');
      return true;
    }
    return false;
  };

  const processDeletionRequest = async (requestId, options = {}) => {
    const req = deletionRequests.find(r => String(r.id) === String(requestId));
    if (!req) return false;

    // Target profile ID: either memberId, userId, or find by phone/email
    let targetProfileId = req.memberId || req.userId;
    if (!targetProfileId) {
      const matched = profiles.find(p => 
        (req.phone && doesProfileHavePhone(p, req.phone)) ||
        (req.email && p.email && String(p.email).toLowerCase() === String(req.email).toLowerCase())
      );
      if (matched) targetProfileId = matched.id;
    }

    if (targetProfileId) {
      await deleteUserAccount(targetProfileId, {
        reason: req.reason || 'deletion_request_processed',
        requestedBy: 'admin'
      });
      await deleteProfile(targetProfileId);
    }

    await updateDeletionRequestStatus(requestId, 'completed', options.notes || 'Processed and permanently erased by Administrator.');

    setDeletionRequests(prev => prev.map(r => String(r.id) === String(requestId) ? { ...r, status: 'completed', processedAt: new Date().toISOString() } : r));
    addToast('Deletion request processed. Account & media permanently purged.', 'success');
    return true;
  };

  const dismissDeletionRequest = async (requestId, notes = '') => {
    await updateDeletionRequestStatus(requestId, 'dismissed', notes || 'Dismissed by Administrator.');
    setDeletionRequests(prev => prev.map(r => String(r.id) === String(requestId) ? { ...r, status: 'dismissed', processedAt: new Date().toISOString(), notes } : r));
    addToast('Deletion request dismissed.', 'info');
    return true;
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
        subscriptionPlans,
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
        updateSubscriptionPlans,
        addSuccessStory,
        updateSuccessStory,
        deleteSuccessStory,
        subModalConfig,
        openSubscriptionModal,
        closeSubscriptionModal,
        sortProfilesByLatest,
        resolveNotificationProfile,
        reports,
        submitReport,
        resolveReport,
        dismissReport,
        warnUser,
        removeViolatingContent,
        deletionRequests,
        processDeletionRequest,
        dismissDeletionRequest,
        feedbacks,
        addFeedback,
        updateFeedbackStatus,
        deleteFeedback,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        gallery,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => useContext(ProfileContext);
