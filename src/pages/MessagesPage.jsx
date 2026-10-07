import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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

// Fast timestamp formatting cache to eliminate repetitive regex & Date instantiations
const timeFormatCache = new Map();

const formatMessageTime = (raw, createdAt) => {
  const cacheKey = raw ? String(raw) : (createdAt ? String(createdAt) : '');
  if (!cacheKey) return '';
  const cached = timeFormatCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let result = '';

  // 1. Try ISO createdAt first
  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      result = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      timeFormatCache.set(cacheKey, result);
      return result;
    }
  }

  // 2. Parse string timestamp
  if (typeof raw === 'string' && raw.trim()) {
    const trimmed = raw.trim();

    // 12-hour format: "3:24 PM" or "03:24 pm"
    const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)$/i);
    if (match12) {
      const h = parseInt(match12[1], 10);
      const min = match12[2];
      const ampm = match12[3].toUpperCase();
      result = `${String(h).padStart(2, '0')}:${min} ${ampm}`;
      timeFormatCache.set(cacheKey, result);
      return result;
    }

    // 24-hour format: "15:13" or "09:05"
    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (match24) {
      const h = parseInt(match24[1], 10);
      const min = match24[2];
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      result = `${String(h12).padStart(2, '0')}:${min} ${ampm}`;
      timeFormatCache.set(cacheKey, result);
      return result;
    }

    // Try parsing as full date string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      result = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      timeFormatCache.set(cacheKey, result);
      return result;
    }

    result = trimmed;
  }

  timeFormatCache.set(cacheKey, result);
  return result;
};

// High-performance Conversation Item with strict memoization & stable onSelect callback
const ConversationItem = React.memo(({ profile, lastMsg, unreadCount, isSelected, onSelect }) => {
  const formattedTime = lastMsg ? formatMessageTime(lastMsg.timestamp, lastMsg.createdAt) : '';

  const handleClick = useCallback(() => {
    onSelect(profile.id);
  }, [onSelect, profile.id]);

  return (
    <div
      onClick={handleClick}
      className={`p-3 sm:p-3.5 cursor-pointer transition-colors flex items-center space-x-3 select-none ${
        isSelected ? 'bg-white shadow-2xs border-l-4 border-brand-plum' : 'hover:bg-white/60 active:bg-white/80'
      }`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '64px' }}
    >
      <div className="relative shrink-0 rounded-full w-11 h-11 sm:w-12 sm:h-12">
        <img
          src={profile.avatar || profile.photos?.[0] || '/default-avatar.png'}
          alt={profile.name}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-brand-gold/60"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-10" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className={`font-serif font-bold text-xs sm:text-sm truncate ${
            unreadCount > 0 ? 'text-brand-plum font-extrabold' : 'text-brand-plum'
          }`}>{profile.name}</h4>
          {lastMsg && (
            <span className={`text-[10px] shrink-0 ml-1.5 ${
              unreadCount > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'
            }`}>
              {formattedTime}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={`text-xs truncate ${
            unreadCount > 0 ? 'text-slate-900 font-bold' : 'text-brand-gray'
          }`}>
            {lastMsg ? lastMsg.text : 'Start conversation...'}
          </p>

          {/* WhatsApp-style Circular Unread Count Badge */}
          {unreadCount > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shrink-0 shadow-2xs border border-white ml-1.5">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

// Lightweight Message Bubble optimized for GPU rendering in WebView
const MessageBubble = React.memo(({ msg, isUser }) => {
  const formattedTime = formatMessageTime(msg.timestamp, msg.createdAt);

  return (
    <div
      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '48px' }}
    >
      <div
        className={`max-w-[82%] sm:max-w-[70%] p-3 sm:p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
          isUser
            ? 'bg-brand-plum text-white rounded-br-none border border-brand-gold/30'
            : 'bg-white text-brand-charcoal rounded-bl-none border border-brand-rose/20'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
      </div>
      <div className="flex items-center space-x-1 mt-1 px-1">
        <span className="text-[10px] text-gray-400">
          {formattedTime}
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
});

// Isolated Chat Input component so typing text never re-renders the conversation list or message history
const ChatInput = React.memo(({ onSend, placeholder }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 sm:p-3.5 border-t border-gray-100 flex items-center gap-2 bg-white shrink-0 z-10"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 sm:py-3 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-plum/20 focus:outline-hidden bg-slate-50/60 focus:bg-white transition-colors"
      />
      <button
        type="submit"
        disabled={!text.trim()}
        className="p-3 sm:p-3.5 bg-brand-plum disabled:opacity-40 text-white rounded-2xl shadow-2xs hover:bg-brand-plumDark transition-all flex items-center justify-center shrink-0 active:scale-95"
        title="Send message"
      >
        <Send className="w-4 h-4 text-white stroke-[2.5]" />
      </button>
    </form>
  );
});

export const MessagesPage = ({ onNavigate }) => {
  const { user, isAuthenticated, triggerPrivacyAlert, canViewProfile } = useAuth();
  const { t } = useLanguage();
  const { profiles, chats, interests, sendMessage, markChatAsRead } = useProfiles();

  // Check if navigating directly to a specific chat via profile/interest page
  const [activePartnerId, setActivePartnerId] = useState(() => {
    return sessionStorage.getItem('reshimgath_target_chat') || null;
  });
  const [mobileView, setMobileView] = useState(() => {
    return sessionStorage.getItem('reshimgath_target_chat') ? 'chat' : 'list';
  });

  // Clear target chat from session storage after reading
  useEffect(() => {
    if (sessionStorage.getItem('reshimgath_target_chat')) {
      sessionStorage.removeItem('reshimgath_target_chat');
    }
  }, []);

  // Precompute set of unlocked profile IDs in-memory for instant O(1) checks
  const unlockedSet = useMemo(() => {
    const set = new Set();
    if (!user) return set;
    const myId = String(user.id).toLowerCase();

    (user.subscription?.unlockedProfiles || []).forEach((id) => set.add(String(id).toLowerCase()));
    (user.unlockedProfiles || []).forEach((id) => set.add(String(id).toLowerCase()));

    const conns = interests?.unlockedConnections || [];
    conns.forEach((c) => {
      if (!c) return;
      const u1 = String(c.user1 || '').toLowerCase();
      const u2 = String(c.user2 || '').toLowerCase();
      if (u1 === myId && u2) set.add(u2);
      if (u2 === myId && u1) set.add(u1);
    });

    return set;
  }, [user, interests?.unlockedConnections]);

  // Track existing threads signature so conversationProfiles does NOT recompute on every single message
  const existingThreadsSignature = useMemo(() => {
    if (!chats) return '';
    return Object.keys(chats).filter((k) => chats[k] && chats[k].length > 0).sort().join(',');
  }, [chats]);

  // Filter profiles that current user can message (Stable: doesn't re-run when typing or sending messages)
  const conversationProfiles = useMemo(() => {
    if (!user) return [];
    const myId = String(user.id).toLowerCase();
    const myEmail = user.email ? user.email.toLowerCase() : null;
    const myName = user.name ? user.name.toLowerCase() : null;
    const isMeAdmin = user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1';

    return profiles.filter((p) => {
      const pId = String(p.id).toLowerCase();

      // 1. Exclude self
      if (
        pId === myId ||
        (myEmail && p.email && p.email.toLowerCase() === myEmail) ||
        (myName && p.name && p.name.toLowerCase() === myName)
      ) {
        return false;
      }

      // 2. Exclude Admin accounts
      if (p.isAdmin || p.role === 'admin' || p.id === 'admin_1' || (p.email && p.email.includes('admin'))) {
        return false;
      }

      // 3. Exclude Blocked candidate profiles
      if (!isMeAdmin && p.blocked) return false;

      // 4. Must be unlocked by current user OR have an existing chat thread OR be the active target
      if (unlockedSet.has(pId)) return true;
      if (activePartnerId && String(activePartnerId).toLowerCase() === pId) return true;

      const convoKey = [String(user.id), String(p.id)].sort().join('_');
      if (chats[convoKey] && chats[convoKey].length > 0) return true;

      if (canViewProfile) {
        return canViewProfile(p.id).alreadyUnlocked;
      }
      return false;
    });
  }, [profiles, existingThreadsSignature, user, activePartnerId, unlockedSet, canViewProfile]);

  // Precompute conversation metadata (last message, unread count, timestamp) in a single O(N) pass
  const conversationMetaMap = useMemo(() => {
    if (!user) return new Map();
    const myId = String(user.id);
    const map = new Map();

    conversationProfiles.forEach((p) => {
      const pConvoKey = [myId, String(p.id)].sort().join('_');
      const thread = chats[pConvoKey] || [];
      const lastMsg = thread.length > 0 ? thread[thread.length - 1] : null;

      let unreadCount = 0;
      for (let i = 0; i < thread.length; i++) {
        if (String(thread[i].senderId) !== myId && thread[i].status !== 'read') {
          unreadCount++;
        }
      }

      let latestTime = 0;
      if (lastMsg) {
        if (lastMsg.createdAt) {
          const t = new Date(lastMsg.createdAt).getTime();
          if (!isNaN(t)) latestTime = t;
        } else if (typeof lastMsg.id === 'number') {
          latestTime = lastMsg.id;
        }
      }

      map.set(p.id, { lastMsg, unreadCount, latestTime });
    });

    return map;
  }, [conversationProfiles, chats, user]);

  // Sort conversation list dynamically by most recent message timestamp
  const sortedProfiles = useMemo(() => {
    if (!user || conversationProfiles.length === 0) return [];
    return [...conversationProfiles].sort((a, b) => {
      const timeA = conversationMetaMap.get(a.id)?.latestTime || 0;
      const timeB = conversationMetaMap.get(b.id)?.latestTime || 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [conversationProfiles, conversationMetaMap, user]);

  const chatContainerRef = useRef(null);
  const prevThreadLengthRef = useRef(0);
  const prevPartnerIdRef = useRef(null);

  const currentPartner = useMemo(() => {
    return activePartnerId ? profiles.find((p) => String(p.id) === String(activePartnerId)) : null;
  }, [activePartnerId, profiles]);

  const convoKey = useMemo(() => {
    return (user && currentPartner) ? [String(user.id), String(currentPartner.id)].sort().join('_') : null;
  }, [user, currentPartner]);

  const activeThread = useMemo(() => {
    return (convoKey && chats[convoKey]) ? chats[convoKey] : [];
  }, [convoKey, chats]);

  // Redirect if not authenticated via useEffect
  useEffect(() => {
    if (!isAuthenticated) {
      triggerPrivacyAlert?.();
      onNavigate?.('/login');
    }
  }, [isAuthenticated, onNavigate, triggerPrivacyAlert]);

  // Mark active chat as read ONLY when there are actual unread messages from the partner
  useEffect(() => {
    if (!currentPartner?.id || !activeThread || activeThread.length === 0) return;
    const hasUnreadFromPartner = activeThread.some(
      (m) => String(m.senderId) !== String(user?.id) && m.status !== 'read'
    );
    if (hasUnreadFromPartner) {
      markChatAsRead(currentPartner.id);
    }
  }, [currentPartner?.id, activeThread, user?.id, markChatAsRead]);

  // Auto-scroll to bottom using requestAnimationFrame for 60fps rendering without layout trashing
  useEffect(() => {
    if (!currentPartner) return;
    const threadLen = activeThread.length;
    if (prevPartnerIdRef.current !== currentPartner.id || threadLen !== prevThreadLengthRef.current) {
      prevPartnerIdRef.current = currentPartner.id;
      prevThreadLengthRef.current = threadLen;
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      });
    }
  }, [currentPartner?.id, activeThread.length]);

  const handleSendMessage = useCallback((text) => {
    if (!currentPartner) return;
    sendMessage(currentPartner.id, text);
  }, [currentPartner, sendMessage]);

  const handleSelectConversation = useCallback((partnerId) => {
    setActivePartnerId(partnerId);
    markChatAsRead(partnerId);
    setMobileView('chat');
  }, [markChatAsRead]);

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
              className="px-6 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-xs hover:bg-brand-plumDark transition-all"
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

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
      
      {/* Header (Hidden on mobile when actively in chat to save maximum vertical space for the keyboard) */}
      <div className={`mb-3 sm:mb-6 ${mobileView === 'chat' ? 'hidden md:block' : 'block'}`}>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
          {t('messagesTitle')}
        </h1>
        <p className="text-xs text-brand-gray mt-1">
          {t('messagesSubtext')}
        </p>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-brand-rose/20 shadow-md md:shadow-luxury overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[420px] sm:min-h-[550px] h-[calc(100dvh-140px)] md:h-[72vh]">
        
        {/* Left Conversation List Sidebar */}
        <aside className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} md:col-span-4 lg:col-span-4 border-r border-gray-100 flex-col bg-brand-lightBg/30 min-h-0`}>
          <div className="p-3.5 sm:p-4 border-b border-gray-100 font-serif font-bold text-xs sm:text-sm text-brand-plum flex items-center justify-between bg-white shrink-0">
            <span>Conversations ({sortedProfiles.length})</span>
          </div>

          <div 
            className="flex-1 overflow-y-auto divide-y divide-gray-50 min-h-0"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain'
            }}
          >
            {sortedProfiles.map((p) => {
              const meta = conversationMetaMap.get(p.id);
              const isSelected = Boolean(currentPartner && String(p.id) === String(currentPartner.id));

              return (
                <ConversationItem
                  key={p.id}
                  profile={p}
                  lastMsg={meta?.lastMsg}
                  unreadCount={meta?.unreadCount || 0}
                  isSelected={isSelected}
                  onSelect={handleSelectConversation}
                />
              );
            })}
          </div>
        </aside>

        {/* Right Active Chat Window */}
        <main className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} md:col-span-8 lg:col-span-8 flex-col h-full min-h-0 bg-white relative justify-between overflow-hidden`}>
          
          {!currentPartner ? (
            /* Default Welcome Empty State (When No Chat Selected) */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F2] min-h-0 space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center shadow-inner border border-brand-rose/20">
                <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-brand-plum" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-brand-plum">
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
              <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0 shadow-2xs">
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                  {/* Mobile Back Button right inside active chat header */}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileView('list');
                      setActivePartnerId(null);
                    }}
                    className="md:hidden p-1.5 -ml-1 text-brand-plum hover:bg-brand-plum/10 rounded-full transition-colors shrink-0"
                    title="Back to Conversations"
                  >
                    <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <div 
                    onClick={() => onNavigate(`/profile/${currentPartner.id}`)}
                    className="flex items-center space-x-2 sm:space-x-3 cursor-pointer min-w-0"
                  >
                    <div className="relative rounded-full w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                      <img
                        src={currentPartner.avatar || currentPartner.photos?.[0] || '/default-avatar.png'}
                        alt={currentPartner.name}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-brand-gold"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <h3 className="font-serif font-bold text-xs sm:text-sm text-brand-plum truncate">{currentPartner.name}</h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-brand-gray truncate">{currentPartner.district || 'Maharashtra'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`/profile/${currentPartner.id}`)}
                  className="text-[11px] sm:text-xs font-bold text-brand-plum hover:underline shrink-0 ml-2"
                >
                  Profile Details
                </button>
              </div>

              {/* Chat Messages Body - Solid background and hardware-accelerated touch scroll */}
              <div 
                ref={chatContainerRef} 
                className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-3.5 bg-[#FAF7F2] min-h-0"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehaviorY: 'contain',
                  willChange: 'scroll-position'
                }}
              >
                {/* Accepted Connection Banner inside Chat */}
                <div className="text-center my-3">
                  <span className="bg-emerald-50 text-emerald-800 text-[10px] sm:text-[11px] font-semibold px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1 shadow-2xs">
                    <Heart className="w-3.5 h-3.5 text-brand-rose fill-brand-rose" />
                    <span>Sambodhi Sarang Connection Accepted</span>
                  </span>
                </div>

                {activeThread.map((msg) => {
                  const isUser = Boolean(user && (String(msg.senderId) === String(user.id)));
                  return (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isUser={isUser}
                    />
                  );
                })}
              </div>

              {/* Input Box */}
              <ChatInput
                onSend={handleSendMessage}
                placeholder={t('typeMessagePlaceholder') || 'Type your message...'}
              />
            </>
          )}
        </main>
      </div>

    </div>
  );
};
