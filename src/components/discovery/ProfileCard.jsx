import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../context/ProfileContext';
import { useLanguage } from '../../context/LanguageContext';
import { VerificationBadge } from '../common/VerificationBadge';
import { Heart, MapPin, GraduationCap, Briefcase, Bookmark, MessageSquare, Check, Sparkles, UserCheck } from 'lucide-react';

export const ProfileCard = ({ profile, onSelect }) => {
  const { isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { interests, sendInterest, acceptInterest, declineInterest, toggleShortlist } = useProfiles();
  const { t } = useLanguage();

  const { user } = useAuth();

  const isSent = (interests.sent || []).some(s => 
    typeof s === 'string' 
      ? s === profile.id 
      : (String(s.profileId) === String(profile.id) && String(s.senderId) === String(user?.id))
  );

  const isReceived = (interests.received || []).some(r => 
    typeof r === 'string'
      ? r === profile.id
      : (String(r.profileId) === String(profile.id) && String(r.targetUserId) === String(user?.id))
  );

  const isAccepted = (interests.accepted || []).some(a => 
    typeof a === 'string' 
      ? a === profile.id 
      : (String(a.profileId) === String(profile.id) || String(a.user1) === String(profile.id) || String(a.user2) === String(profile.id))
  );

  const isDeclined = (interests.declined || []).some(d => 
    typeof d === 'string' 
      ? d === profile.id 
      : (String(d.profileId) === String(profile.id) || String(d.user1) === String(profile.id) || String(d.user2) === String(profile.id))
  );

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
        <img
          src={profile.avatar || profile.photos?.[0]}
          alt={profile.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-charcoal/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            {profile.verified && <VerificationBadge size="small" />}
            <span className="px-2.5 py-0.5 bg-brand-plum/90 text-brand-gold font-bold text-[10px] rounded-full shadow border border-brand-gold/30">
              Reg ID: {profileSlug}
            </span>
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
              {profile.name}
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

      {/* Card Info Body */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2 text-xs text-brand-charcoal">
          
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
            <button
              disabled
              className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 text-amber-800 border border-amber-300/80 font-bold text-xs flex items-center justify-center space-x-2 cursor-default"
            >
              <UserCheck className="w-4 h-4 text-amber-600" />
              <span>{t('interestSent')}</span>
            </button>
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
