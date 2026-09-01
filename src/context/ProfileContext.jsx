import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_PROFILES } from '../data/mockProfiles';
import confetti from 'canvas-confetti';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('reshimgath_profiles');
    if (saved) return JSON.parse(saved);
    return MOCK_PROFILES;
  });

  useEffect(() => {
    localStorage.setItem('reshimgath_profiles', JSON.stringify(profiles));
  }, [profiles]);
  
  // Initial interest states for lively demo experience
  const [interests, setInterests] = useState(() => {
    const saved = localStorage.getItem('reshimgath_interests');
    if (saved) return JSON.parse(saved);
    return {
      sent: ['p3'], // User A sent interest to Pooja Patil (p3)
      received: [
        { profileId: 'p1', timestamp: '2 hours ago' }, // Dr. Ananya Deshmukh sent interest to demo user!
        { profileId: 'p5', timestamp: '1 day ago' }     // Tejaswini Jadhav sent interest!
      ],
      accepted: ['p1'], // Pre-accepted connection with Dr. Ananya Deshmukh for instant chat demonstration!
      declined: [],
      shortlisted: ['p7'] // Saved profile Aishwarya Mahajan
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

    // Dispatch real-time notification
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

    // Trigger celebration confetti
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

    // Auto-reply simulation for testing
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

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        interests,
        chats,
        notifications,
        profileViews,
        toasts,
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
        deleteProfile
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfiles = () => useContext(ProfileContext);
