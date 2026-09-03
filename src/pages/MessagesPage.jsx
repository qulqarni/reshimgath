import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  CheckCheck, 
  User, 
  Heart, 
  Search,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';

export const MessagesPage = ({ onNavigate }) => {
  const { user, isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, chats, sendMessage } = useProfiles();

  // Get all accepted connection profiles for current logged-in user
  const acceptedProfiles = profiles.filter((p) => {
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

    // 3. Must be explicitly accepted for this user
    return (interests.accepted || []).some((a) => {
      if (typeof a === 'string') {
        return String(a).toLowerCase() === String(p.id).toLowerCase();
      }
      if (typeof a === 'object' && a !== null) {
        const u1 = String(a.user1 || '').toLowerCase();
        const u2 = String(a.user2 || '').toLowerCase();
        const pid = String(a.profileId || '').toLowerCase();
        const targetId = String(a.targetUserId || '').toLowerCase();
        const senderId = String(a.senderId || '').toLowerCase();

        const me = String(user.id || '').toLowerCase();
        const meEmail = String(user.email || '').toLowerCase();
        const meName = String(user.name || '').toLowerCase();

        const other = String(p.id || '').toLowerCase();
        const otherEmail = String(p.email || '').toLowerCase();
        const otherName = String(p.name || '').toLowerCase();

        const isMeInEntry = (
          u1 === me || (meEmail && u1 === meEmail) || (meName && u1 === meName) ||
          u2 === me || (meEmail && u2 === meEmail) || (meName && u2 === meName) ||
          pid === me || (meEmail && pid === meEmail) || (meName && pid === meName) ||
          targetId === me || (meEmail && targetId === meEmail) || (meName && targetId === meName) ||
          senderId === me || (meEmail && senderId === meEmail) || (meName && senderId === meName)
        );

        const isOtherInEntry = (
          u1 === other || (otherEmail && u1 === otherEmail) || (otherName && u1 === otherName) ||
          u2 === other || (otherEmail && u2 === otherEmail) || (otherName && u2 === otherName) ||
          pid === other || (otherEmail && pid === otherEmail) || (otherName && pid === otherName) ||
          targetId === other || (otherEmail && targetId === otherEmail) || (otherName && targetId === otherName) ||
          senderId === other || (otherEmail && senderId === otherEmail) || (otherName && senderId === otherName)
        );

        return isMeInEntry && isOtherInEntry;
      }
      return false;
    });
  });

  const [activePartnerId, setActivePartnerId] = useState(() => {
    return acceptedProfiles.length > 0 ? acceptedProfiles[0].id : null;
  });

  const [messageInput, setMessageInput] = useState('');

  if (!isAuthenticated) {
    triggerPrivacyAlert();
    onNavigate('/login');
    return null;
  }

  // If no accepted connections exist
  if (acceptedProfiles.length === 0) {
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
              {t('messagingBlockedNotice')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('/interests')}
            className="px-6 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all"
          >
            Go to Received Interests & Accept Requests
          </button>
        </div>
      </div>
    );
  }

  const [mobileView, setMobileView] = useState('list'); // 'list' or 'chat'
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);

  const currentPartner = profiles.find((p) => String(p.id) === String(activePartnerId)) || acceptedProfiles[0];
  const convoKey = (user && currentPartner) ? [String(user.id), String(currentPartner.id)].sort().join('_') : null;
  const activeThread = (convoKey && chats[convoKey]) ? chats[convoKey] : [];

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timer);
  }, [activeThread, activePartnerId]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentPartner) return;
    sendMessage(currentPartner.id, messageInput.trim());
    setMessageInput('');

    // Keep mobile keyboard open
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

      {/* Mobile Back Button (Outside Message Box Container) */}
      {mobileView === 'chat' && (
        <button
          onClick={() => setMobileView('list')}
          className="md:hidden mb-3 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white border border-brand-rose/30 text-brand-plum text-xs font-bold shadow-sm hover:bg-brand-rose/10 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-brand-plum stroke-[2.5]" />
          <span>Back to Connections</span>
        </button>
      )}

      {/* Main Chat Container */}
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px] sm:min-h-[600px] h-[72vh]">
        
        {/* Left Conversation List Sidebar */}
        <aside className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} md:col-span-4 lg:col-span-4 border-r border-gray-100 flex-col bg-brand-lightBg/30`}>
          <div className="p-4 border-b border-gray-100 font-serif font-bold text-sm text-brand-plum">
            Accepted Connections ({acceptedProfiles.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {acceptedProfiles.map((p) => {
              const pConvoKey = (user && p) ? [String(user.id), String(p.id)].sort().join('_') : null;
              const thread = (pConvoKey && chats[pConvoKey]) ? chats[pConvoKey] : [];
              const lastMsg = thread[thread.length - 1];
              const isSelected = currentPartner && String(p.id) === String(currentPartner.id);

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setActivePartnerId(p.id);
                    setMobileView('chat');
                  }}
                  className={`p-4 cursor-pointer transition-colors flex items-center space-x-3 ${
                    isSelected ? 'bg-white shadow-sm border-l-4 border-brand-plum' : 'hover:bg-white/60'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={p.avatar || p.photos?.[0]}
                      alt={p.name}
                      className="w-12 h-12 rounded-full object-cover border border-brand-gold/60"
                    />
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-xs text-brand-plum truncate">{p.name}</h4>
                      {lastMsg && <span className="text-[10px] text-gray-400">{lastMsg.timestamp}</span>}
                    </div>
                    <p className="text-xs text-brand-gray truncate mt-0.5">
                      {lastMsg ? lastMsg.text : 'Start conversation...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Active Chat Window */}
        <main className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} md:col-span-8 lg:col-span-8 flex-col h-full min-h-0 bg-white relative justify-between overflow-hidden`}>
          
          {/* Active Partner Header */}
          <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-brand-ivory shrink-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div 
                onClick={() => onNavigate(`/profile/${currentPartner.id}`)}
                className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
              >
                <img
                  src={currentPartner.avatar || currentPartner.photos?.[0]}
                  alt={currentPartner.name}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-brand-gold"
                />
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
                <span>Sambodhi Sarang Connection Accepted on {new Date().toLocaleDateString()}</span>
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
                  <span className="text-[10px] text-gray-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
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
              placeholder={t('typeMessagePlaceholder')}
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

        </main>

      </div>

    </div>
  );
};
