import React, { useState } from 'react';
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
  ShieldCheck
} from 'lucide-react';

export const MessagesPage = ({ onNavigate }) => {
  const { user, isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, chats, sendMessage } = useProfiles();

  // Get all accepted connection profiles for current logged-in user
  const acceptedProfiles = profiles.filter((p) => {
    if (!user) return false;
    if (String(p.id) === String(user.id) || (user.email && p.email === user.email)) return false;

    return (interests.accepted || []).some((a) => {
      if (typeof a === 'string') {
        return String(a) === String(p.id);
      }
      if (typeof a === 'object' && a !== null) {
        const u1 = String(a.user1);
        const u2 = String(a.user2);
        const pid = String(a.profileId);
        const me = String(user.id);
        const other = String(p.id);

        return (
          (u1 === me && u2 === other) ||
          (u2 === me && u1 === other) ||
          (pid === other) ||
          (pid === me)
        );
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

  const currentPartner = profiles.find((p) => String(p.id) === String(activePartnerId)) || acceptedProfiles[0];
  const convoKey = (user && currentPartner) ? [String(user.id), String(currentPartner.id)].sort().join('_') : null;
  const activeThread = (convoKey && chats[convoKey]) || (currentPartner ? chats[currentPartner.id] : []) || [];

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentPartner) return;
    sendMessage(currentPartner.id, messageInput.trim());
    setMessageInput('');
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
              const thread = (pConvoKey && chats[pConvoKey]) || chats[p.id] || [];
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
        <main className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} md:col-span-8 lg:col-span-8 flex-col h-full bg-white`}>
          
          {/* Active Partner Header */}
          <div className="p-3.5 sm:p-4 border-b border-gray-100 flex items-center justify-between bg-brand-ivory">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden text-xs font-bold text-brand-plum hover:underline pr-1"
              >
                ← Back
              </button>
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
                  <p className="text-[10px] sm:text-[11px] text-brand-gray">{currentPartner.district} • {currentPartner.caste}</p>
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
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-white via-brand-ivory/40 to-white">
            
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
          <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex items-center gap-2 bg-white">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={t('typeMessagePlaceholder')}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-plum/20"
            />
            <button
              type="submit"
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
