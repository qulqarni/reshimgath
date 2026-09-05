import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { ProfileCard } from '../components/discovery/ProfileCard';
import { 
  Heart, 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  UserCheck,
  ShieldCheck,
  Camera,
  Edit3,
  Eye,
  Clock,
  User
} from 'lucide-react';

export const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, profileViews } = useProfiles();

  const receivedCount = interests.received.length;
  const sentCount = interests.sent.length;
  const acceptedCount = interests.accepted.length;
  const visitsCount = profileViews.length;

  const recommendedMatches = profiles.filter(p => p.id !== user?.id).slice(0, 3);

  const visitorsRef = React.useRef(null);

  const scrollToVisitors = () => {
    if (visitorsRef.current) {
      visitorsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-plum via-brand-plumDark to-brand-plum text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-brand-gold/30 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 bg-brand-gold/20 text-brand-gold px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maharashtrian Matrimony Hub</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold">
            {t('dashboardTitle')}{user?.name || 'Member'}!
          </h1>
          <p className="text-xs sm:text-sm text-brand-rose max-w-lg">
            Your profile is active and visible to verified Maharashtrian families.
          </p>
        </div>

        {/* Profile Completion Widget */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center space-y-2 shrink-0 z-10 w-full md:w-64">
          <div className="flex items-center justify-between text-xs font-bold">
            <span>{t('profileCompletion')}</span>
            <span className="text-brand-gold">85%</span>
          </div>
          <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
            <div className="bg-brand-gold h-full w-[85%]" />
          </div>
          <button
            onClick={() => onNavigate('/edit-profile')}
            className="text-[11px] font-bold text-white hover:text-brand-gold underline flex items-center justify-center space-x-1 mx-auto"
          >
            <Edit3 className="w-3 h-3" />
            <span>{t('completeProfileCTA')}</span>
          </button>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          onClick={() => onNavigate('/interests')}
          className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-rose/20 text-brand-rose flex items-center justify-center">
            <Heart className="w-5 h-5 fill-brand-rose" />
          </div>
          <div className="text-2xl font-bold font-serif text-brand-plum">{receivedCount}</div>
          <div className="text-xs text-brand-gray font-semibold">{t('statInterestsReceived')}</div>
        </div>

        <div 
          onClick={() => onNavigate('/interests')}
          className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-brand-kesari flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold font-serif text-brand-plum">{sentCount}</div>
          <div className="text-xs text-brand-gray font-semibold">{t('statInterestsSent')}</div>
        </div>

        <div 
          onClick={() => onNavigate('/messages')}
          className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold font-serif text-brand-plum">{acceptedCount}</div>
          <div className="text-xs text-brand-gray font-semibold">{t('statAcceptedConnections')}</div>
        </div>

        <div 
          onClick={scrollToVisitors}
          className="bg-white p-5 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold font-serif text-brand-plum">{visitsCount}</div>
          <div className="text-xs text-brand-gray font-semibold">{t('statProfileViews')}</div>
        </div>

      </div>

      {/* Recent Profile Visitors Section */}
      <div ref={visitorsRef} className="space-y-4 bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury">
        <div className="flex items-center justify-between border-b border-brand-rose/10 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-brand-plum">
                {t('recentVisitorsTitle')}
              </h2>
              <p className="text-xs text-brand-gray">
                {t('recentVisitorsSubtitle')}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {profileViews.length} Visitors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {profileViews.map((visitor) => {
            const visitorProfile = (profiles || []).find(
              (p) =>
                String(p.id) === String(visitor.visitorId) ||
                String(p.regId) === String(visitor.visitorId) ||
                (p.registrationId && `SS-${p.registrationId}` === String(visitor.visitorId)) ||
                (p.email && visitor.visitorId === p.email)
            );

            const displayAvatar = visitorProfile?.avatar || (Array.isArray(visitorProfile?.photos) && visitorProfile.photos[0]) || visitor.avatar;
            const displayName = visitorProfile?.name || visitor.visitorName;
            const displayOccupation = visitorProfile?.occupation || visitor.occupation || 'Professional';
            const displayLocation = visitorProfile?.district || visitor.location || 'Maharashtra';
            const targetProfileId = visitorProfile?.regId || visitorProfile?.id || visitor.visitorId;

            return (
              <div
                key={visitor.id}
                onClick={() => onNavigate(`/profile/${targetProfileId}`)}
                className="bg-brand-lightBg/60 p-4 rounded-2xl border border-brand-rose/15 hover:border-brand-plum/40 hover:shadow-md transition-all cursor-pointer flex items-center space-x-3 group"
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow shrink-0 group-hover:scale-105 transition-transform bg-white"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-brand-plum/10 border-2 border-white shadow shrink-0 flex items-center justify-center text-brand-plum group-hover:scale-105 transition-transform">
                    <User className="w-7 h-7 text-brand-plum/60" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-sm text-brand-plum group-hover:text-brand-kesari transition-colors truncate">
                    {displayName}
                  </h4>
                  <p className="text-xs text-brand-gray truncate">{displayOccupation} • {displayLocation}</p>
                  <div className="flex items-center space-x-1 text-[10px] text-indigo-700 font-semibold mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Viewed {visitor.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-plum">
              {t('recommendedMatches')}
            </h2>
            <p className="text-xs text-brand-gray">
              Based on your Pune/Maharashtrian education & caste preferences
            </p>
          </div>

          <button
            onClick={() => onNavigate('/discover')}
            className="text-xs font-bold text-brand-plum hover:text-brand-kesari flex items-center space-x-1"
          >
            <span>{t('viewAllMatches')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedMatches.map((profile) => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              onSelect={(id, action) => {
                if (action === 'chat') {
                  onNavigate('/messages');
                } else {
                  onNavigate(`/profile/${id}`);
                }
              }}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
