import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PROFILES } from '../data/mockProfiles';
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
    if (saved) return JSON.parse(saved);
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

  useEffect(() => {
    localStorage.setItem('reshimgath_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem('reshimgath_home_content', JSON.stringify(homeContent));
  }, [homeContent]);

  useEffect(() => {
    localStorage.setItem('reshimgath_stories', JSON.stringify(stories));
  }, [stories]);
  
  // Initial interest states for lively demo experience
  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('reshimgath_interests');
    if (saved) return JSON.parse(saved);
    return {
      sent: ['p3'],
      received: [
        { profileId: 'p1', timestamp: '2 hours ago' },
        { profileId: 'p5', timestamp: '1 day ago' }
      ],
      accepted: ['p1'],
      declined: [],
      shortlisted: ['p7']
    };
  });

  // Chat messages store
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('reshimgath_chats');
    if (saved) return JSON.parse(saved);
    return {
      'p1': [
        { id: 1, sender: 'p1', text: 'Namaste Aditya! I went through your profile. We share a common interest in Hindustani music and Sahyadri treks.', timestamp: '10:30 AM' },
        { id: 2, sender: 'user', text: 'Namaste Dr. Ananya! Thank you for accepting the Sambodhi Sarang connection. I read about your medical practice in Pune.', timestamp: '10:32 AM' },
        { id: 3, sender: 'p1', text: 'Yes! Our families would also love to interact. Would weekend filter coffee at Kothrud be convenient?', timestamp: '10:35 AM' }
      ]
    };
  });

  // Notifications
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'interest', profileId: 'p1', title: 'New Interest Received', text: 'Dr. Ananya Deshmukh expressed interest in your profile.', time: '2 hours ago', unread: true },
    { id: 2, type: 'accepted', profileId: 'p1', title: 'Match Accepted!', text: 'Dr. Ananya Deshmukh accepted your interest. Private messaging is now active.', time: '3 hours ago', unread: true },
    { id: 3, type: 'view', profileId: 'p4', title: 'Profile Viewed', text: 'Rohan Joshi (CA, Mumbai) viewed your profile.', time: '5 hours ago', unread: false }
  ]);

  // Profile Views / Visitors store
  const [profileViews, setProfileViews] = useState(() => {
    const saved = localStorage.getItem('reshimgath_profile_views');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, visitorId: 'p1', visitorName: 'Dr. Ananya Deshmukh', occupation: 'MD Pediatrics', location: 'Pune', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600', timestamp: '10 minutes ago' },
      { id: 2, visitorId: 'p3', visitorName: 'Pooja Patil', occupation: 'Architect', location: 'Kolhapur', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', timestamp: '2 hours ago' },
      { id: 3, visitorId: 'p5', visitorName: 'Tejaswini Jadhav', occupation: 'Software Engineer', location: 'Mumbai', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800', timestamp: '1 day ago' }
    ];
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

  const recordProfileView = (targetProfile, viewerUser) => {
    if (!targetProfile) return;

    const viewEntry = {
      id: Date.now(),
      visitorId: viewerUser?.id || 'demo_user',
      visitorName: viewerUser?.name || 'Aditya Kulkarni',
      occupation: viewerUser?.occupation || 'Software Engineer',
      location: viewerUser?.district || 'Pune',
      avatar: viewerUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
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
        profileId: viewerUser?.id || 'demo_user',
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

    setTimeout(() => {
      const replies = [
        "That sounds wonderful! Family discussions are so important to us as well.",
        "Thank you for your message. Let me speak with my parents this evening and share our update.",
        "Glad to hear from you!",
        "Yes, our family values and career expectations align very nicely."
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      setChats((prev) => ({
        ...prev,
        [profileId]: [
          ...(prev[profileId] || []),
          {
            id: Date.now() + 1,
            sender: profileId,
            text: randomReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }));
    }, 1500);

    return true;
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  // ADMIN METHODS
  const toggleVerifyProfile = (profileId) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, verified: !p.verified } : p))
    );
    addToast('Profile verification status updated successfully!', 'success');
  };

  const addProfile = (newProfileData) => {
    const id = 'p_' + Date.now();
    const createdProfile = {
      id,
      verified: true,
      photos: newProfileData.photos || ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'],
      avatar: newProfileData.avatar || newProfileData.photos?.[0] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800',
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
    addToast('New profile registered successfully!', 'success');
    return createdProfile;
  };

  const updateAdminProfile = (profileId, updatedData) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, ...updatedData } : p))
    );
    addToast('Profile updated successfully by Admin!', 'success');
  };

  const deleteProfile = (profileId) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    addToast('Profile deleted successfully.', 'info');
  };

  // HOMEPAGE CONTENT ADMIN METHODS
  const updateHomeContent = (newContent) => {
    setHomeContent((prev) => ({ ...prev, ...newContent }));
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
    addToast('New success story added to homepage!', 'success');
  };

  const deleteSuccessStory = (storyId) => {
    setStories((prev) => prev.filter((s) => s.id !== storyId));
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
