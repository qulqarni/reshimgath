import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../context/ProfileContext';
import { useLanguage } from '../../context/LanguageContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { Heart, MapPin, GraduationCap, Briefcase, Bookmark, MessageSquare, Check, Sparkles, UserCheck, User, RotateCcw } from 'lucide-react';

export const ProfileCard = ({ profile, onSelect }) => {
  const { isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { interests, sendInterest, acceptInterest, declineInterest, withdrawInterest, toggleShortlist } = useProfiles();
  const { t } = useLanguage();

  const { user } = useAuth();

  const myId = user?.id ? String(user.id).toLowerCase() : '';
  const targetId = profile?.id ? String(profile.id).toLowerCase() : '';

  const isSent = Boolean(myId && targetId) && (interests.sent || []).some(s => {
    if (typeof s !== 'object' || !s) return false;
    const sender = String(s.senderId || s.user1 || '').toLowerCase();
    const target = String(s.profileId || s.targetUserId || s.user2 || '').toLowerCase();
    return sender === myId && target === targetId;
  });

  const isReceived = Boolean(myId && targetId) && (interests.received || []).some(r => {
    if (typeof r !== 'object' || !r) return false;
    const sender = String(r.senderId || r.user1 || '').toLowerCase();
    const target = String(r.targetUserId || r.profileId || r.user2 || '').toLowerCase();
    return sender === targetId && target === myId;
  });

  const isAccepted = Boolean(myId && targetId) && (interests.accepted || []).some(a => {
    if (typeof a !== 'object' || !a) return false;
    const u1 = String(a.user1 || a.senderId || '').toLowerCase();
    const u2 = String(a.user2 || a.targetUserId || a.profileId || '').toLowerCase();
    return (u1 === myId && u2 === targetId) || (u1 === targetId && u2 === myId);
  });

  const isDeclined = Boolean(myId && targetId) && (interests.declined || []).some(d => {
    if (typeof d !== 'object' || !d) return false;
    const u1 = String(d.user1 || d.senderId || '').toLowerCase();
    const u2 = String(d.user2 || d.targetUserId || d.profileId || '').toLowerCase();
    return (u1 === myId && u2 === targetId) || (u1 === targetId && u2 === myId);
  });

  const isShortlisted = (interests.shortlisted || []).includes(profile.id);

  const handleAction = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      triggerPrivacyAlert();
      return;
    }

    if (isAccepted) {
      onSelect(profile.id, 'chat');
      return;
    }

    if (isReceived) {
      acceptInterest(profile.id);
      return;
    }

    if (!isSent && !isDeclined) {
      sendInterest(profile.id);
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      triggerPrivacyAlert();
      return;
    }
    toggleShortlist(profile.id);
  };

  const profileSlug = profile.regId || (profile.registrationId ? `SS-${profile.registrationId}` : profile.id);

  return (
    <div
      onClick={() => onSelect(profileSlug)}
      className="group bg-white rounded-3xl overflow-hidden border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Image Container */}
      <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-brand-lightBg">
        {profile.avatar || (Array.isArray(profile.photos) && profile.photos[0]) ? (
          <img
            src={profile.avatar || profile.photos[0]}
            alt={profile.name}
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
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            {profile.verified && <VerificationBadge size="small" />}
          </div>

          {/* Shortlist Bookmark Button */}
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full backdrop-blur-md transition-all ${
              isShortlisted
                ? 'bg-brand-plum text-brand-gold shadow-md'
                : 'bg-white/80 text-brand-charcoal hover:bg-white hover:text-brand-plum'
            }`}
            title={t('shortlist')}
          >
            <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-brand-gold' : ''}`} />
          </button>
        </div>

        {/* Bottom Details Overlay on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="flex items-baseline space-x-2">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white tracking-wide drop-shadow-md">
              {profile.name ? profile.name.trim().split(' ')[0] : ''}
            </h3>
            <span className="text-sm font-semibold text-brand-rose drop-shadow-sm">
              {profile.age} yrs
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-gray-200 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-kesari" />
              {profile.district}, {profile.nativePlace || 'MH'}
            </span>
            <span>•</span>
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md text-[11px] font-semibold text-white">
              {profile.caste}
            </span>
          </div>
        </div>
      </div>

      {/* Card Info Body (White Box Below Photo) */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2 text-xs text-brand-charcoal">
          
          {/* Profile Number Below Photo in White Box */}
          <div className="flex items-center justify-between pb-2 border-b border-brand-rose/10">
            <span className="text-[11px] font-bold text-brand-plum uppercase tracking-wider">Profile No.</span>
            <span className="px-2.5 py-0.5 bg-brand-plum text-white font-bold text-xs rounded-full shadow-sm border border-brand-gold/30">
              {profileSlug}
            </span>
          </div>
          
          <div className="flex items-center space-x-2.5 text-brand-gray">
            <GraduationCap className="w-4 h-4 text-brand-plum shrink-0" />
            <span className="truncate font-medium">{profile.education}</span>
          </div>

          <div className="flex items-center space-x-2.5 text-brand-gray">
            <Briefcase className="w-4 h-4 text-brand-kesari shrink-0" />
            <span className="truncate font-medium">{profile.occupation}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-brand-rose/10 text-brand-gray">
            <span>Native: <strong className="text-brand-plum">{profile.nativePlace || 'Maharashtra'}</strong></span>
            <span>Caste: <strong className="text-brand-plum">{profile.caste || 'Maharashtrian'}</strong></span>
          </div>

        </div>

        {/* Action Button Section */}
        <div className="pt-2">
          {isAccepted ? (
            <button
              onClick={handleAction}
              className="w-full py-2.5 px-4 rounded-2xl bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:bg-emerald-800 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t('sendMessage')}</span>
            </button>
          ) : isReceived ? (
            <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); acceptInterest(profile.id); }}
                className="flex-1 py-2 px-3 rounded-xl bg-brand-plum text-white font-bold text-xs flex items-center justify-center space-x-1 shadow hover:bg-brand-plumDark transition-all"
              >
                <Check className="w-3.5 h-3.5 text-brand-gold" />
                <span>{t('acceptInterest')}</span>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); declineInterest(profile.id); }}
                className="py-2 px-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-xs hover:bg-rose-50 hover:text-rose-700 transition-all"
              >
                {t('declineInterest')}
              </button>
            </div>
          ) : isSent ? (
            <div className="flex gap-2">
              <span className="flex-1 py-2 px-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs flex items-center justify-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{t('interestSent')}</span>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); withdrawInterest(profile.id); }}
                className="py-2 px-3 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 transition-all border border-rose-200 flex items-center space-x-1 shrink-0"
                title="Withdraw Interest Request"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Withdraw</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleAction}
              className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all group-hover:from-brand-plumDark group-hover:to-brand-plum border border-brand-gold/30"
            >
              <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
              <span>{t('sendInterest')}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
