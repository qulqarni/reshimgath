import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  Heart, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Trash2, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  User 
} from 'lucide-react';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
import { UnlockConfirmationModal } from '../components/subscription/UnlockConfirmationModal';

export const InterestsPage = ({ onNavigate }) => {
  const { user, isAuthenticated, canViewProfile, unlockProfileForUser, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, acceptInterest, declineInterest } = useProfiles();

  const [activeTab, setActiveTab] = useState('received');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [selectedProfileForUnlock, setSelectedProfileForUnlock] = useState(null);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedProfileForSub, setSelectedProfileForSub] = useState(null);

  if (!isAuthenticated) {
    triggerPrivacyAlert();
    onNavigate('/login');
    return null;
  }

  const isMeAdmin = user && (user.isAdmin === true || user.role === 'admin' || user.id === 'admin_1');

  const handleOpenProfileClick = (targetProfile) => {
    if (!targetProfile || !targetProfile.id) return;

    const { canView, alreadyUnlocked, remainingVisits, hasActivePlan } = canViewProfile(targetProfile.id);

    if (alreadyUnlocked || canView) {
      onNavigate(`/profile/${targetProfile.id}`);
      return;
    }

    if (!hasActivePlan || remainingVisits <= 0) {
      setSelectedProfileForSub(targetProfile);
      setShowSubModal(true);
      return;
    }

    setSelectedProfileForUnlock(targetProfile);
    setShowUnlockModal(true);
  };

  const handleConfirmUnlock = () => {
    if (!selectedProfileForUnlock) return;
    const targetId = selectedProfileForUnlock.id;
    const success = unlockProfileForUser(targetId);
    setShowUnlockModal(false);
    setSelectedProfileForUnlock(null);

    if (success) {
      onNavigate(`/profile/${targetId}`);
    } else {
      setShowSubModal(true);
    }
  };

  // Received profiles for current logged-in user
  const receivedList = (interests.received || [])
    .filter((r) => {
      if (!user) return true;
      const targetIdStr = String(r.targetUserId || '').toLowerCase();
      const userIdStr = String(user.id || '').toLowerCase();
      const userEmailStr = String(user.email || '').toLowerCase();
      const userNameStr = String(user.name || '').toLowerCase();

      if (r.targetUserId) {
        return (
          targetIdStr === userIdStr ||
          (userEmailStr && targetIdStr === userEmailStr) ||
          (userNameStr && targetIdStr === userNameStr)
        );
      }
      return String(r.profileId).toLowerCase() !== userIdStr;
    })
    .map((r) => {
      const senderProfileId = r.profileId || r.senderId;
      const p = profiles.find((item) => 
        String(item.id).toLowerCase() === String(senderProfileId).toLowerCase() ||
        (item.email && r.senderEmail && item.email.toLowerCase() === r.senderEmail.toLowerCase()) ||
        (item.name && r.senderName && item.name.toLowerCase() === r.senderName.toLowerCase())
      );
      if (p) return { ...p, time: r.timestamp || 'Recently' };
      
      // Fallback for newly created profiles before profiles array update
      return {
        id: senderProfileId || 'user_' + Date.now(),
        name: r.senderName || 'Verified Candidate',
        gender: r.senderGender || 'female',
        district: r.senderDistrict || 'Maharashtra',
        caste: r.senderCaste || 'Maratha',
        avatar: r.senderPhoto || null,
        photos: r.senderPhoto ? [r.senderPhoto] : [],
        verified: true,
        time: r.timestamp || 'Recently'
      };
    })
    .filter(Boolean)
    .filter(p => isMeAdmin || !p.blocked);

  // Sent profiles by current logged-in user
  const sentList = (interests.sent || [])
    .filter((s) => {
      if (!user) return true;
      if (typeof s === 'object' && s.senderId) {
        return String(s.senderId) === String(user.id) || s.senderId === user.email;
      }
      return true;
    })
    .map((s) => {
      const targetId = typeof s === 'object' ? s.profileId : s;
      const p = profiles.find((item) => String(item.id) === String(targetId));
      if (!p) return null;

      const myId = user?.id ? String(user.id).toLowerCase() : '';
      const tId = String(targetId).toLowerCase();

      const isAccepted = (interests.accepted || []).some((a) => {
        if (typeof a !== 'object' || !a) return false;
        const u1 = String(a.user1 || a.senderId || '').toLowerCase();
        const u2 = String(a.user2 || a.targetUserId || a.profileId || '').toLowerCase();
        return (u1 === myId && u2 === tId) || (u1 === tId && u2 === myId);
      });
      const isDeclined = (interests.declined || []).some((d) => {
        if (typeof d !== 'object' || !d) return false;
        const u1 = String(d.user1 || d.senderId || '').toLowerCase();
        const u2 = String(d.user2 || d.targetUserId || d.profileId || '').toLowerCase();
        return (u1 === myId && u2 === tId) || (u1 === tId && u2 === myId);
      });

      return {
        ...p,
        status: isAccepted ? 'Accepted' : isDeclined ? 'Declined' : 'Pending'
      };
    })
    .filter(Boolean)
    .filter(p => isMeAdmin || !p.blocked);

  // Shortlisted profiles
  const shortlistedList = (interests.shortlisted || [])
    .map((id) => profiles.find((item) => String(item.id) === String(id)))
    .filter(Boolean)
    .filter(p => isMeAdmin || !p.blocked);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
          {t('interestsTitle')}
        </h1>
        <p className="text-xs text-brand-gray mt-1">
          {t('interestsSubtitle')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {receivedList.map((p) => {
                const profileSlug = p.regId || (p.registrationId ? `SS-${p.registrationId}` : p.id);
                const photo = p.avatar || (Array.isArray(p.photos) && p.photos[0]) || null;
                const viewStatus = canViewProfile(p.id);
                const isUnlocked = viewStatus.alreadyUnlocked || viewStatus.canView;

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Candidate Image Container */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-brand-lightBg">
                      {photo ? (
                        <img
                          src={photo}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-brand-lightBg text-brand-plum/40 p-4">
                          <div className="w-16 h-16 rounded-full bg-brand-plum/10 border border-brand-plum/20 flex items-center justify-center mb-2">
                            <User className="w-8 h-8 text-brand-plum/50" />
                          </div>
                          <span className="text-xs font-semibold text-brand-plum/60">No Profile Picture</span>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          {p.verified && <VerificationBadge size="small" />}
                          <span className="px-2.5 py-0.5 bg-brand-plum text-white font-bold text-[10px] rounded-full shadow border border-brand-gold/30">
                            Reg ID: {profileSlug}
                          </span>
                        </div>

                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-brand-plum text-[10px] font-bold rounded-full shadow flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-brand-kesari" />
                          <span>{p.time}</span>
                        </span>
                      </div>

                      {/* Overlay Candidate Name & Key Details */}
                      <div className="absolute bottom-3 left-4 right-4 text-white space-y-1">
                        <h3 className="font-serif text-lg font-bold text-white drop-shadow-sm truncate">
                          {p.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-[11px] font-medium text-white/90 flex-wrap gap-y-1">
                          {p.age && <span>{p.age} Yrs</span>}
                          {p.height && <span>• {p.height}</span>}
                          {p.district && (
                            <span className="flex items-center space-x-0.5">
                              <span>•</span>
                              <MapPin className="w-3 h-3 text-brand-gold inline" />
                              <span>{p.district}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Basic Profile Details Section */}
                    <div className="p-4 space-y-3 text-xs bg-white flex-1 flex flex-col justify-between">
                      <div className="space-y-2 border-b border-gray-100 pb-3">
                        {p.caste && (
                          <div className="flex items-center space-x-2 text-brand-charcoal font-medium">
                            <User className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                            <span className="truncate">Caste: <strong>{p.caste}</strong></span>
                          </div>
                        )}
                        {p.education && (
                          <div className="flex items-center space-x-2 text-brand-charcoal font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                            <span className="truncate">{p.education}</span>
                          </div>
                        )}
                        {p.occupation && (
                          <div className="flex items-center space-x-2 text-brand-charcoal font-medium">
                            <Briefcase className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                            <span className="truncate">{p.occupation}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-1">
                        {/* Primary Open Profile Button */}
                        <button
                          onClick={() => handleOpenProfileClick(p)}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 border border-brand-gold/30"
                        >
                          <Eye className="w-4 h-4 text-brand-gold" />
                          <span>Open Profile {isUnlocked ? '(Unlocked)' : '(1 Credit)'}</span>
                        </button>

                        {/* Accept & Remove / Delete Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => acceptInterest(p.id)}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-1.5"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>{t('acceptInterest')}</span>
                          </button>

                          <button
                            onClick={() => declineInterest(p.id)}
                            className="py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 border border-rose-200"
                            title="Delete / Remove Interest Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Subscription Modal Popup */}
      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        targetProfileName={selectedProfileForSub?.name}
      />

      {/* Profile Unlock Confirmation Warning Modal */}
      <UnlockConfirmationModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        onConfirm={handleConfirmUnlock}
        profile={selectedProfileForUnlock}
        remainingVisits={user?.subscription?.creditsRemaining || 0}
        totalVisits={user?.subscription?.creditsTotal || 25}
      />

    </div>
  );
};
