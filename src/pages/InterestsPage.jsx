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
  User,
  RotateCcw,
  Bookmark
} from 'lucide-react';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
import { UnlockConfirmationModal } from '../components/subscription/UnlockConfirmationModal';
import { WatermarkOverlay } from '../components/common/WatermarkOverlay';

const HorizontalProfileItem = ({ profile: p, badge, borderClass = 'border-brand-rose/20', actions, onOpenProfile }) => {
  const profileSlug = p.regId || (p.registrationId ? `SS-${p.registrationId}` : p.id);
  const photo = p.avatar || (Array.isArray(p.photos) && p.photos[0]) || '/default-avatar.png';

  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border ${borderClass} p-4 sm:p-5 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
    >
      {/* Left: Profile Photo & Basic Info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0 w-full sm:w-auto">
        <div className="relative shrink-0 cursor-pointer rounded-2xl overflow-hidden w-20 h-20 sm:w-24 sm:h-24" onClick={() => onOpenProfile(p)}>
          {photo ? (
            <img
              src={photo}
              alt={p.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-brand-rose/20 shadow-sm hover:opacity-90 transition-opacity"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-lightBg border-2 border-brand-rose/20 flex flex-col items-center justify-center text-brand-plum/50">
              <User className="w-8 h-8 opacity-60" />
              <span className="text-[10px] font-semibold mt-1 opacity-70">No Photo</span>
            </div>
          )}
          <WatermarkOverlay size="small" />
          {badge}
        </div>

        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <h3
              onClick={() => onOpenProfile(p)}
              className="font-serif text-base sm:text-lg font-bold text-brand-plum truncate cursor-pointer hover:text-brand-kesari transition-colors"
            >
              {p.name}
            </h3>
            {p.verified && <VerificationBadge size="small" />}
            <span className="px-2.5 py-0.5 bg-brand-plum text-white font-bold text-[10px] rounded-full shadow-sm border border-brand-gold/30">
              Profile No. {profileSlug}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-brand-charcoal font-medium">
            {p.age && <span>{p.age} Yrs</span>}
            {p.height && <span>• {p.height}</span>}
            {p.district && (
              <span className="flex items-center space-x-1 text-brand-gray">
                <span>•</span>
                <MapPin className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span>{p.district}</span>
              </span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-brand-gray pt-0.5">
            {p.caste && (
              <span className="flex items-center space-x-1">
                <User className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                <span>Caste: <strong className="text-brand-charcoal font-semibold">{p.caste}</strong></span>
              </span>
            )}
            {p.education && (
              <span className="flex items-center space-x-1">
                <GraduationCap className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{p.education}</span>
              </span>
            )}
            {p.occupation && (
              <span className="flex items-center space-x-1">
                <Briefcase className="w-3.5 h-3.5 text-brand-plum shrink-0" />
                <span className="truncate max-w-[180px] sm:max-w-[220px]">{p.occupation}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        {actions}
      </div>
    </div>
  );
};

export const InterestsPage = ({ onNavigate }) => {
  const { user, isAuthenticated, canViewProfile, unlockProfileForUser, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, acceptInterest, declineInterest, withdrawInterest, toggleShortlist } = useProfiles();

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
  const myId = user?.id ? String(user.id).toLowerCase() : '';

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

  // Helper check if a candidate (targetId) has accepted or declined connection with current user
  const checkStatusWithTarget = (targetId) => {
    if (!myId || !targetId) return { isAccepted: false, isDeclined: false };
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

    return { isAccepted, isDeclined };
  };

  // 1. Pending Received profiles for current logged-in user (Excludes Accepted and Declined)
  const receivedList = (interests.received || [])
    .filter((r) => {
      if (!user) return false;
      const targetIdStr = String(r.targetUserId || '').toLowerCase();
      const userIdStr = String(user.id || '').toLowerCase();
      const userEmailStr = String(user.email || '').toLowerCase();
      const userNameStr = String(user.name || '').toLowerCase();

      let isMeTarget = false;
      if (r.targetUserId) {
        isMeTarget = (
          targetIdStr === userIdStr ||
          (userEmailStr && targetIdStr === userEmailStr) ||
          (userNameStr && targetIdStr === userNameStr)
        );
      } else {
        isMeTarget = String(r.profileId).toLowerCase() !== userIdStr;
      }
      if (!isMeTarget) return false;

      const senderProfileId = r.profileId || r.senderId;
      const { isAccepted, isDeclined } = checkStatusWithTarget(senderProfileId);
      return !isAccepted && !isDeclined;
    })
    .map((r) => {
      const senderProfileId = r.profileId || r.senderId;
      const p = profiles.find((item) => 
        String(item.id).toLowerCase() === String(senderProfileId).toLowerCase() ||
        (item.email && r.senderEmail && item.email.toLowerCase() === r.senderEmail.toLowerCase()) ||
        (item.name && r.senderName && item.name.toLowerCase() === r.senderName.toLowerCase())
      );
      if (p) return { ...p, time: r.timestamp || 'Recently' };
      
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

  // 2. Pending Sent profiles by current logged-in user (Excludes Accepted and Declined)
  const sentList = (interests.sent || [])
    .filter((s) => {
      if (!user) return false;
      if (typeof s === 'object' && s.senderId) {
        const sSender = String(s.senderId).toLowerCase();
        const uId = String(user.id).toLowerCase();
        const uEmail = String(user.email || '').toLowerCase();
        if (sSender !== uId && sSender !== uEmail) return false;
      }
      const targetId = typeof s === 'object' ? (s.profileId || s.targetUserId || s.user2) : s;
      const { isAccepted, isDeclined } = checkStatusWithTarget(targetId);
      return !isAccepted && !isDeclined;
    })
    .map((s) => {
      const targetId = typeof s === 'object' ? (s.profileId || s.targetUserId || s.user2) : s;
      const p = profiles.find((item) => String(item.id).toLowerCase() === String(targetId).toLowerCase());
      if (!p) return null;
      return { ...p, status: 'Pending' };
    })
    .filter(Boolean)
    .filter(p => isMeAdmin || !p.blocked);

  // 3. Connected profiles (Accepted requests between user & candidate)
  const connectedList = profiles.filter((p) => {
    if (!user) return false;
    if (
      String(p.id).toLowerCase() === String(user.id).toLowerCase() ||
      (user.email && p.email && p.email.toLowerCase() === user.email.toLowerCase()) ||
      (user.name && p.name && p.name.toLowerCase() === user.name.toLowerCase())
    ) {
      return false;
    }
    if (p.isAdmin || p.role === 'admin' || p.id === 'admin_1' || (p.email && p.email.includes('admin'))) return false;
    if (!isMeAdmin && p.blocked) return false;

    const { isAccepted } = checkStatusWithTarget(p.id);
    return isAccepted;
  });

  // 4. Saved profiles (Renamed from Shortlisted)
  const shortlistedList = (interests.shortlisted || [])
    .map((id) => profiles.find((item) => String(item.id).toLowerCase() === String(id).toLowerCase()))
    .filter(Boolean)
    .filter(p => isMeAdmin || !p.blocked);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
          {t('interestsTitle')}
        </h1>
        <p className="text-xs text-brand-gray mt-1">
          {t('interestsSubtitle')}
        </p>
      </div>

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
          onClick={() => setActiveTab('connected')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'connected'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-emerald-300 fill-emerald-300" />
          <span>{t('connectedTab')} ({connectedList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shortlisted')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center space-x-2 ${
            activeTab === 'shortlisted'
              ? 'bg-brand-plum text-white shadow-md'
              : 'bg-white text-brand-charcoal hover:bg-brand-lightBg'
          }`}
        >
          <Bookmark className="w-4 h-4 text-brand-gold fill-brand-gold" />
          <span>{t('shortlistedTab')} ({shortlistedList.length})</span>
        </button>
      </div>

      <div className="space-y-4">
        
        {activeTab === 'received' && (
          receivedList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <Heart className="w-10 h-10 text-brand-rose/40 mx-auto" />
              <p className="font-semibold">{t('noReceivedInterests')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {receivedList.map((p) => {
                const viewStatus = canViewProfile(p.id);
                const isUnlocked = viewStatus.alreadyUnlocked || viewStatus.canView;

                return (
                  <HorizontalProfileItem
                    key={p.id}
                    profile={p}
                    onOpenProfile={handleOpenProfileClick}
                    badge={
                      <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-white/95 backdrop-blur-sm text-brand-plum border border-brand-rose/30 text-[9px] font-bold rounded-full shadow-sm flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5 text-brand-kesari" />
                        <span>{p.time}</span>
                      </span>
                    }
                    actions={
                      <>
                        <button
                          onClick={() => handleOpenProfileClick(p)}
                          className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30 whitespace-nowrap"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                          <span>Open Profile {isUnlocked ? '(Free)' : '(1 Credit)'}</span>
                        </button>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => acceptInterest(p.id)}
                            className="flex-1 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>{t('acceptInterest')}</span>
                          </button>
                          <button
                            onClick={() => declineInterest(p.id)}
                            className="py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 border border-rose-200 whitespace-nowrap"
                            title="Delete / Remove Interest Request"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </>
                    }
                  />
                );
              })}
            </div>
          )
        )}

        {activeTab === 'sent' && (
          sentList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <UserCheck className="w-10 h-10 text-brand-kesari/40 mx-auto" />
              <p className="font-semibold">{t('noSentInterests')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sentList.map((p) => (
                <HorizontalProfileItem
                  key={p.id}
                  profile={p}
                  onOpenProfile={handleOpenProfileClick}
                  badge={
                    <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 text-[9px] font-bold rounded-full shadow-sm flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                      <span>Pending</span>
                    </span>
                  }
                  actions={
                    <>
                      <button
                        onClick={() => handleOpenProfileClick(p)}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-4 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>Open Profile</span>
                      </button>
                      <button
                        onClick={() => withdrawInterest(p.id)}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2 px-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 border border-rose-200 whitespace-nowrap"
                        title="Withdraw Interest Request"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Withdraw</span>
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'connected' && (
          connectedList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <MessageSquare className="w-10 h-10 text-emerald-400/50 mx-auto" />
              <p className="font-semibold">{t('noConnected')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedList.map((p) => (
                <HorizontalProfileItem
                  key={p.id}
                  profile={p}
                  borderClass="border-emerald-200/80"
                  onOpenProfile={() => onNavigate(`/profile/${p.id}`)}
                  badge={
                    <span className="absolute -top-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-sm" title="Connected">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  }
                  actions={
                    <>
                      <button
                        onClick={() => onNavigate('/messages')}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
                        <span>{t('sendMessage')}</span>
                      </button>
                      <button
                        onClick={() => onNavigate(`/profile/${p.id}`)}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-4 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>Open Profile</span>
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'shortlisted' && (
          shortlistedList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <Bookmark className="w-10 h-10 text-brand-gold/40 mx-auto" />
              <p className="font-semibold">{t('noShortlisted')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shortlistedList.map((p) => (
                <HorizontalProfileItem
                  key={p.id}
                  profile={p}
                  onOpenProfile={handleOpenProfileClick}
                  badge={
                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-sm" title="Saved">
                      <Bookmark className="w-3.5 h-3.5 fill-white" />
                    </span>
                  }
                  actions={
                    <>
                      <button
                        onClick={() => handleOpenProfileClick(p)}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-4 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                        <span>Open Profile</span>
                      </button>
                      <button
                        onClick={() => toggleShortlist(p.id)}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2 px-3.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 border border-rose-200 whitespace-nowrap"
                        title="Remove from Saved Profiles"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )
        )}

      </div>

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        targetProfileName={selectedProfileForSub?.name}
      />

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
