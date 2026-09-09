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

export const InterestsPage = ({ onNavigate }) => {
  const { user, isAuthenticated, canViewProfile, unlockProfileForUser, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, acceptInterest, declineInterest, withdrawInterest } = useProfiles();

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

                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-transparent to-black/30" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          {p.verified && <VerificationBadge size="small" />}
                          <span className="px-2.5 py-0.5 bg-brand-plum text-white font-bold text-[10px] rounded-full shadow border border-brand-gold/30">
                            Profile No. {profileSlug}
                          </span>
                        </div>

                        <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-brand-plum text-[10px] font-bold rounded-full shadow flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-brand-kesari" />
                          <span>{p.time}</span>
                        </span>
                      </div>

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
                      </div>

                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => handleOpenProfileClick(p)}
                          className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark hover:from-brand-plumDark hover:to-brand-plum text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 border border-brand-gold/30"
                        >
                          <Eye className="w-4 h-4 text-brand-gold" />
                          <span>Open Profile {isUnlocked ? '(Free / Unlocked)' : '(1 Credit)'}</span>
                        </button>

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

        {activeTab === 'sent' && (
          sentList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center text-xs text-brand-gray space-y-2">
              <UserCheck className="w-10 h-10 text-brand-kesari/40 mx-auto" />
              <p className="font-semibold">{t('noSentInterests')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sentList.map((p) => {
                const profileSlug = p.regId || (p.registrationId ? `SS-${p.registrationId}` : p.id);
                const photo = p.avatar || (Array.isArray(p.photos) && p.photos[0]) || null;

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
                  >
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

                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-transparent to-black/30" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          {p.verified && <VerificationBadge size="small" />}
                          <span className="px-2.5 py-0.5 bg-brand-plum text-white font-bold text-[10px] rounded-full shadow border border-brand-gold/30">
                            Profile No. {profileSlug}
                          </span>
                        </div>

                        <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 text-[10px] font-bold rounded-full shadow flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      </div>

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
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenProfileClick(p)}
                          className="flex-1 py-2 px-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Open Profile</span>
                        </button>

                        <button
                          onClick={() => withdrawInterest(p.id)}
                          className="py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1 border border-rose-200"
                          title="Withdraw Interest Request"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Withdraw</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
              {connectedList.map((p) => {
                const profileSlug = p.regId || (p.registrationId ? `SS-${p.registrationId}` : p.id);
                const photo = p.avatar || (Array.isArray(p.photos) && p.photos[0]) || null;

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-emerald-200/80 p-4 sm:p-5 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Left: Profile Photo & Basic Info */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="relative shrink-0">
                        {photo ? (
                          <img
                            src={photo}
                            alt={p.name}
                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/30 shadow-sm"
                          />
                        ) : (
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-emerald-50 border-2 border-emerald-200 flex flex-col items-center justify-center text-emerald-700">
                            <User className="w-8 h-8 opacity-60" />
                            <span className="text-[10px] font-bold mt-1 opacity-70">No Photo</span>
                          </div>
                        )}
                        <span className="absolute -top-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-sm" title="Connected">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum truncate">
                            {p.name}
                          </h3>
                          {p.verified && <VerificationBadge size="small" />}
                          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px] rounded-full">
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
                              <span className="truncate max-w-[200px]">{p.education}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <button
                        onClick={() => onNavigate('/messages')}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-3 sm:px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
                        <span className="whitespace-nowrap">{t('sendMessage')}</span>
                      </button>

                      <button
                        onClick={() => onNavigate(`/profile/${p.id}`)}
                        className="flex-1 sm:flex-none w-full sm:w-auto py-2.5 px-3 sm:px-5 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-[11px] sm:text-xs rounded-xl shadow-sm transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/30 whitespace-nowrap"
                      >
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-gold shrink-0" />
                        <span className="whitespace-nowrap">Open Profile</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shortlistedList.map((p) => {
                const profileSlug = p.regId || (p.registrationId ? `SS-${p.registrationId}` : p.id);
                const photo = p.avatar || (Array.isArray(p.photos) && p.photos[0]) || null;

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-3xl overflow-hidden border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 flex flex-col justify-between"
                  >
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

                      <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/85 via-transparent to-black/30" />

                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                          {p.verified && <VerificationBadge size="small" />}
                          <span className="px-2.5 py-0.5 bg-brand-plum text-white font-bold text-[10px] rounded-full shadow border border-brand-gold/30">
                            Profile No. {profileSlug}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-full shadow flex items-center space-x-1">
                          <Bookmark className="w-3 h-3 text-amber-100 fill-amber-100" />
                          <span>Saved</span>
                        </span>
                      </div>

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
                      </div>

                      <button
                        onClick={() => handleOpenProfileClick(p)}
                        className="w-full py-2.5 px-4 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center space-x-2 border border-brand-gold/30"
                      >
                        <Eye className="w-4 h-4 text-brand-gold" />
                        <span>Open Profile</span>
                      </button>
                    </div>
                  </div>
                );
              })}
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
