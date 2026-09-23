import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { WatermarkOverlay } from '../components/common/WatermarkOverlay';
import { useProfiles } from '../context/ProfileContext';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  Check,
  CheckCheck, 
  User, 
  Heart, 
  Search,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

// Helper function ensuring consistent 12-hour AM/PM format across all browsers and devices
const formatMessageTime = (raw, createdAt) => {
  // 1. Try ISO createdAt first if present
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }
  }

  // 2. Parse string timestamp
  if (typeof raw === 'string' && raw.trim()) {
    const trimmed = raw.trim();

    // Already 12-hour format: "3:24 PM" or "03:24 pm"
    const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
    if (match12) {
      const h = parseInt(match12[1], 10);
      const min = match12[2];
      const ampm = match12[3].toUpperCase();
      return `${String(h).padStart(2, '0')}:${min} ${ampm}`;
    }

    // 24-hour format: "15:13" or "09:05" or "15:13:00"
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match24) {
      const h = parseInt(match24[1], 10);
      const min = match24[2];
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${min} ${ampm}`;
    }

    // Try parsing as full date string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    return trimmed;
  }

  return '';
};

export const MessagesPage = ({ onNavigate }) => {
  const { user, isAuthenticated, triggerPrivacyAlert, canViewProfile } = useAuth();
  const { t } = useLanguage();
  const { profiles, chats, sendMessage, markChatAsRead } = useProfiles();

  // Check if navigating directly to a specific chat via profile/interest page
  const [activePartnerId, setActivePartnerId] = useState(() => {
    return sessionStorage.getItem('reshimgath_target_chat') || null;
  });
  const [mobileView, setMobileView] = useState(() => {
    return sessionStorage.getItem('reshimgath_target_chat') ? 'chat' : 'list';
  });
  const [messageInput, setMessageInput] = useState('');

  // Clear target chat from session storage after reading
  useEffect(() => {
    if (sessionStorage.getItem('reshimgath_target_chat')) {
      sessionStorage.removeItem('reshimgath_target_chat');
    }
  }, []);

  // Filter profiles that current user can message:
  // Must be unlocked by current user, or have existing chat history, or is the active target
  const conversationProfiles = profiles.filter((p) => {
    if (!user) return false;

    // 1. Exclude self
    if (
      String(p.id).toLowerCase() === String(user.id).toLowerCase() ||
      (user.email && p.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.name && p.name && p.name.toLowerCase() === user.name.toLowerCase())
    ) {
      return false;
    }

    // 2. Exclude Admin accounts
    if (p.isAdmin || p.role === 'admin' || p.id === 'admin_1' || (p.email && p.email.includes('admin'))) return false;

    // 3. Exclude Blocked candidate profiles (disappears from messages when blocked by admin)
    const isMeAdmin = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';
    if (!isMeAdmin && p.blocked) return false;

    // 4. Must be unlocked by current user OR have an existing chat thread OR be the active target
    const isUnlocked = canViewProfile ? canViewProfile(p.id).alreadyUnlocked : false;
    const convoKey = [String(user.id), String(p.id)].sort().join('_');
    const hasChatHistory = chats[convoKey] && chats[convoKey].length > 0;
    const isActiveTarget = activePartnerId && String(activePartnerId) === String(p.id);

    return isUnlocked || hasChatHistory || isActiveTarget;
  });

  // Sort conversation list dynamically by most recent message timestamp (Latest messages first!)
  const sortedProfiles = [...conversationProfiles].sort((a, b) => {
    if (!user) return 0;
    const keyA = [String(user.id), String(a.id)].sort().join('_');
    const keyB = [String(user.id), String(b.id)].sort().join('_');

    const threadA = chats[keyA] || [];
    const threadB = chats[keyB] || [];

    const lastA = threadA[threadA.length - 1];
    const lastB = threadB[threadB.length - 1];

    const getTime = (msg) => {
      if (!msg) return 0;
      if (msg.createdAt) {
        const t = new Date(msg.createdAt).getTime();
        if (!isNaN(t)) return t;
      }
      if (typeof msg.id === 'number') return msg.id;
      return 0;
    };

    const timeA = getTime(lastA);
    const timeB = getTime(lastB);

    if (timeA !== timeB) {
      return timeB - timeA;
    }
    return String(a.name || '').localeCompare(String(b.name || ''));
  });

  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  const currentPartner = activePartnerId ? profiles.find((p) => String(p.id) === String(activePartnerId)) : null;
  const convoKey = (user && currentPartner) ? [String(user.id), String(currentPartner.id)].sort().join('_') : null;
  const activeThread = (convoKey && chats[convoKey]) ? chats[convoKey] : [];

  // Redirect if not authenticated via useEffect (ensuring hooks execute unconditionally)
  useEffect(() => {
    if (!isAuthenticated) {
      triggerPrivacyAlert?.();
      onNavigate?.('/login');
    }
  }, [isAuthenticated, onNavigate, triggerPrivacyAlert]);

  // Mark active chat as read in real-time when opened
  useEffect(() => {
    if (currentPartner && currentPartner.id) {
      markChatAsRead(currentPartner.id);
    }
  }, [currentPartner?.id, activeThread.length, markChatAsRead]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (currentPartner) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeThread, activePartnerId, currentPartner]);

  // Early returns placed AFTER all hooks are defined
  if (!isAuthenticated) {
    return null;
  }

  // If no unlocked or active conversations exist
  if (conversationProfiles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-rose/20 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-brand-kesari" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-serif text-2xl font-bold text-brand-plum">
              {t('messagesTitle')}
            </h2>
            <p className="text-xs text-brand-gray leading-relaxed">
              You do not have any active conversations yet. Unlock a candidate profile with 1 credit to immediately start messaging, view contact numbers, and access full biodata.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('/search')}
              className="px-6 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all"
            >
              Explore Profiles
            </button>
            <button
              onClick={() => onNavigate('/interests')}
              className="px-6 py-3 bg-brand-rose/20 text-brand-plum font-bold text-xs rounded-xl border border-brand-rose/40 hover:bg-brand-rose/30 transition-all"
            >
              View Interests
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentPartner) return;
    sendMessage(currentPartner.id, messageInput.trim());
    setMessageInput('');

    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
          {t('messagesTitle')}
        </h1>
        <p className="text-xs text-brand-gray mt-1">
          {t('messagesSubtext')}
        </p>
      </div>

      {/* Mobile Back Button */}
      {mobileView === 'chat' && (
        <button
          onClick={() => {
            setMobileView('list');
            setActivePartnerId(null);
          }}
          className="md:hidden mb-3 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-rose/30 text-brand-plum text-xs font-bold shadow-sm hover:bg-brand-rose/10 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-plum stroke-[2.5]" />
          <span>Back to Conversations</span>
        </button>
      )}

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px] sm:min-h-[600px] h-[calc(100vh-210px)] sm:h-[72vh]">
        
        {/* Left Conversation List Sidebar */}
        <aside className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} md:col-span-4 lg:col-span-4 border-r border-gray-100 flex-col bg-brand-lightBg/30`}>
          <div className="p-4 border-b border-gray-100 font-serif font-bold text-sm text-brand-plum flex items-center justify-between">
            <span>Conversations ({sortedProfiles.length})</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {sortedProfiles.map((p) => {
              const pConvoKey = (user && p) ? [String(user.id), String(p.id)].sort().join('_') : null;
              const thread = (pConvoKey && chats[pConvoKey]) ? chats[pConvoKey] : [];
              const lastMsg = thread[thread.length - 1];
              const isSelected = currentPartner && String(p.id) === String(currentPartner.id);
              const unreadInThread = thread.filter((m) => String(m.senderId) !== String(user?.id) && m.status !== 'read').length;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActivePartnerId(p.id);
                    markChatAsRead(p.id);
                    setMobileView('chat');
                  }}
                  className={`p-3.5 sm:p-4 cursor-pointer transition-colors flex items-center space-x-3 ${
                    isSelected ? 'bg-white shadow-sm border-l-4 border-brand-plum' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative shrink-0 rounded-full overflow-hidden w-11 h-11 sm:w-12 sm:h-12">
                    <img
                      src={p.avatar || p.photos?.[0] || '/default-avatar.png'}
                      alt={p.name}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-brand-gold/60"
                    />
                    <WatermarkOverlay size="small" />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full z-20" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-serif font-bold text-xs sm:text-sm truncate ${
                        unreadInThread > 0 ? 'text-brand-plum font-extrabold' : 'text-brand-plum'
                      }`}>{p.name}</h4>
                      {lastMsg && (
                        <span className={`text-[10px] shrink-0 ml-1.5 ${
                          unreadInThread > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'
                        }`}>
                          {formatMessageTime(lastMsg.timestamp, lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className={`text-xs truncate ${
                        unreadInThread > 0 ? 'text-slate-900 font-bold' : 'text-brand-gray'
                      }`}>
                        {lastMsg ? lastMsg.text : 'Start conversation...'}
                      </p>

                      {/* WhatsApp-style Circular Unread Count Badge */}
                      {unreadInThread > 0 && (
                        <span className="min-w-[20px] h-[20px] px-1 bg-emerald-500 text-white font-extrabold text-[11px] rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white ml-2">
                          {unreadInThread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Active Chat Window */}
        <main className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} md:col-span-8 lg:col-span-8 flex-col h-full min-h-0 bg-white relative justify-between overflow-hidden`}>
          
          {!currentPartner ? (
            /* Default Welcome Empty State (When No Chat Selected) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-white via-brand-ivory/30 to-white min-h-0 space-y-4">
              <div className="w-20 h-20 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center shadow-inner border border-brand-rose/20 animate-pulse">
                <MessageSquare className="w-10 h-10 text-brand-plum" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-serif font-bold text-xl text-brand-plum">
                  Select a Conversation
                </h3>
                <p className="text-xs text-brand-gray leading-relaxed">
                  Choose an accepted matrimonial connection from the list on the left to view messages and chat in real-time.
                </p>
              </div>
            </div>
          ) : (
            /* Active Partner Chat View */
            <>
              {/* Active Partner Header */}
              <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-brand-ivory shrink-0">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div 
                    onClick={() => onNavigate(`/profile/${currentPartner.id}`)}
                    className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
                  >
                    <div className="relative rounded-full overflow-hidden w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                      <img
                        src={currentPartner.avatar || currentPartner.photos?.[0] || '/default-avatar.png'}
                        alt={currentPartner.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-brand-gold"
                      />
                      <WatermarkOverlay size="small" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-serif font-bold text-xs sm:text-sm text-brand-plum">{currentPartner.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-brand-gray">{currentPartner.district}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`/profile/${currentPartner.id}`)}
                  className="text-[11px] sm:text-xs font-bold text-brand-plum hover:underline"
                >
                  Profile Details
                </button>
              </div>

              {/* Chat Messages Body */}
              <div ref={chatContainerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-white via-brand-ivory/40 to-white min-h-0">
                
                {/* Accepted Connection Banner inside Chat */}
                <div className="text-center my-4">
                  <span className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-brand-rose fill-brand-rose" />
                    <span>Sambodhi Sarang Connection Accepted</span>
                  </span>
                </div>

                {activeThread.map((msg) => {
                  const isUser = user && (String(msg.senderId) === String(user.id));
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? 'bg-brand-plum text-white rounded-br-none border border-brand-gold/30'
                            : 'bg-brand-lightBg text-brand-charcoal rounded-bl-none border border-brand-rose/20'
                        }`}
                      >
                        <p>{msg.text}</p>
                      </div>
                      <div className="flex items-center space-x-1 mt-1 px-1">
                        <span className="text-[10px] text-gray-400">
                          {formatMessageTime(msg.timestamp, msg.createdAt)}
                        </span>
                        {isUser && (
                          <span className="inline-flex items-center">
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-sky-400 stroke-[2.5]" title="Read (✓✓)" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-gray-400 stroke-[2.2]" title="Delivered (✓✓)" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-gray-400 stroke-[2]" title="Sent (✓)" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Box */}
              <form onSubmit={handleSend} className="p-3.5 sm:p-4 border-t border-gray-100 flex items-center gap-2 bg-white shrink-0 z-10">
                <input
                  ref={messageInputRef}
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={t('typeMessagePlaceholder') || 'Type your message...'}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-plum/20"
                />
                <button
                  type="submit"
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  className="p-3.5 bg-brand-plum text-white rounded-2xl shadow-md hover:bg-brand-plumDark hover:scale-105 transition-all flex items-center justify-center shrink-0"
                  title="Send message"
                >
                  <Send className="w-4 h-4 text-white stroke-[2.5]" />
                </button>
              </form>
            </>
          )}
        </main>
      </div>

    </div>
  );
};
