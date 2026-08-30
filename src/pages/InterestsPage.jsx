import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { Heart, Check, X, MessageSquare, Clock, ShieldCheck, UserCheck } from 'lucide-react';

export const InterestsPage = ({ onNavigate }) => {
  const { isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, acceptInterest, declineInterest } = useProfiles();

  const [activeTab, setActiveTab] = useState('received');

  if (!isAuthenticated) {
    triggerPrivacyAlert();
    onNavigate('/login');
    return null;
  }

  // Received profiles
  const receivedList = interests.received.map(r => {
    const p = profiles.find(item => item.id === r.profileId);
    return { ...p, time: r.timestamp };
  }).filter(Boolean);

  // Sent profiles
  const sentList = interests.sent.map(id => {
    const p = profiles.find(item => item.id === id);
    const isAccepted = interests.accepted.includes(id);
    const isDeclined = interests.declined.includes(id);
    return {
      ...p,
      status: isAccepted ? 'Accepted' : isDeclined ? 'Declined' : 'Pending'
    };
  }).filter(Boolean);

  // Shortlisted profiles
  const shortlistedList = interests.shortlisted.map(id => {
    return profiles.find(item => item.id === id);
  }).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
          {t('interestsTitle')}
        </h1>
        <p className="text-xs text-brand-gray mt-1">
          Manage your incoming partner requests, sent interests, and saved profiles.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center space-x-2 border-b border-brand-rose/20 pb-4 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'received'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
          <span>{t('receivedTab')} ({receivedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'sent'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <UserCheck className="w-4 h-4 text-brand-kesari" />
          <span>{t('sentTab')} ({sentList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shortlisted')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'shortlisted'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{t('shortlistedTab')} ({shortlistedList.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        
        {/* RECEIVED TAB */}
        {activeTab === 'received' && (
          receivedList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <Heart className="w-10 h-10 text-brand-rose/40 mx-auto" />
              <p className="font-semibold">{t('noReceivedInterests')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {receivedList.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div 
                    onClick={() => onNavigate(`/profile/${p.id}`)}
                    className="flex items-center space-x-4 cursor-pointer"
                  >
                    <img
                      src={p.avatar || p.photos?.[0]}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-brand-plum">{p.name}</h3>
                      <p className="text-xs text-brand-gray">{p.age} yrs • {p.district} • {p.caste}</p>
                      <span className="text-[10px] text-gray-400 font-medium">Received {p.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => acceptInterest(p.id)}
                      className="flex-1 sm:flex-initial py-2.5 px-4 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Check className="w-4 h-4 text-brand-gold" />
                      <span>{t('acceptInterest')}</span>
                    </button>
                    <button
                      onClick={() => declineInterest(p.id)}
                      className="py-2.5 px-3 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl hover:bg-rose-50 hover:text-rose-700"
                    >
                      {t('declineInterest')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* SENT TAB */}
        {activeTab === 'sent' && (
          sentList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <UserCheck className="w-10 h-10 text-brand-kesari/40 mx-auto" />
              <p className="font-semibold">{t('noSentInterests')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sentList.map((p) => (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury flex items-center justify-between gap-4"
                >
                  <div 
                    onClick={() => onNavigate(`/profile/${p.id}`)}
                    className="flex items-center space-x-4 cursor-pointer"
                  >
                    <img
                      src={p.avatar || p.photos?.[0]}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-brand-plum">{p.name}</h3>
                      <p className="text-xs text-brand-gray">{p.age} yrs • {p.district}</p>
                    </div>
                  </div>

                  <div>
                    {p.status === 'Accepted' ? (
                      <button
                        onClick={() => onNavigate('/messages')}
                        className="py-2 px-3 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{t('sendMessage')}</span>
                      </button>
                    ) : p.status === 'Declined' ? (
                      <span className="text-xs text-rose-600 font-semibold bg-rose-50 px-2.5 py-1 rounded-full">
                        {t('requestDeclined')}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        {t('pendingStatus')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* SHORTLISTED TAB */}
        {activeTab === 'shortlisted' && (
          shortlistedList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <Heart className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="font-semibold">{t('noShortlisted')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shortlistedList.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onNavigate(`/profile/${p.id}`)}
                  className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={p.avatar || p.photos?.[0]}
                      alt={p.name}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="font-serif font-bold text-base text-brand-plum">{p.name}</h3>
                      <p className="text-xs text-brand-gray">{p.age} yrs • {p.district} • {p.caste}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-plum underline">View Profile</span>
                </div>
              ))}
            </div>
          )
        )}

      </div>

    </div>
  );
};
