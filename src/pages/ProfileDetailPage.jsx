import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { PhotoGallery } from '../components/profile/PhotoGallery';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { BiodataPdfSection } from '../components/profile/BiodataPdfSection';
import { 
  Heart, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  MessageSquare, 
  Bookmark, 
  Check, 
  ArrowLeft,
  User,
  Home,
  Utensils,
  Sparkles
} from 'lucide-react';

export const ProfileDetailPage = ({ profileId, onNavigate }) => {
  const { user, isAuthenticated, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, sendInterest, acceptInterest, declineInterest, toggleShortlist, recordProfileView } = useProfiles();

  const profile = profiles.find((p) => String(p.id) === String(profileId)) || profiles[0];

  React.useEffect(() => {
    if (profile && user && String(profile.id) !== String(user.id) && (user.email ? profile.email !== user.email : true)) {
      recordProfileView(profile, user);
    }
  }, [profileId, user]);

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-brand-plum">Profile Not Found</h2>
        <p className="text-xs text-brand-gray">The requested matrimonial profile is not available.</p>
        <button
          onClick={() => onNavigate('/discover')}
          className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
        >
          Back to Discover
        </button>
      </div>
    );
  }

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

  const handleAction = () => {
    if (!isAuthenticated) {
      if (triggerPrivacyAlert) triggerPrivacyAlert();
      return;
    }

    if (isAccepted) {
      onNavigate('/messages');
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

  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const hasBasicInfo = hasValue(profile.age) || hasValue(profile.gender) || hasValue(profile.height) || hasValue(profile.maritalStatus) || hasValue(profile.motherTongue) || hasValue(profile.religion) || hasValue(profile.caste) || hasValue(profile.district) || hasValue(profile.nativePlace);
  const hasCareer = hasValue(profile.education) || hasValue(profile.college) || hasValue(profile.occupation) || hasValue(profile.company) || hasValue(profile.income);
  const hasFamily = hasValue(profile.fatherOccupation) || hasValue(profile.motherOccupation) || hasValue(profile.siblings) || hasValue(profile.familyType);
  const hasLifestyle = hasValue(profile.diet) || hasValue(profile.smoking) || hasValue(profile.drinking) || hasValue(profile.hobbies);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 pb-24 md:pb-10">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('/discover')}
        className="inline-flex items-center space-x-2 text-xs font-bold text-brand-plum hover:text-brand-kesari transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover Matches</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Photo Gallery Column */}
        <div className="lg:col-span-5 p-6 sm:p-8 bg-brand-lightBg/30 flex items-center justify-center">
          <div className="w-full">
            <PhotoGallery photos={profile.photos} avatar={profile.avatar} name={profile.name} />
          </div>
        </div>

        {/* Profile Header Details Column */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            
            {/* Name, Verified & Bookmark */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2.5">
                  <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum leading-tight">
                    {profile.name}
                  </h1>
                  {profile.verified && <VerificationBadge size="small" />}
                </div>
                
                {/* Age, Height, Location Tagline */}
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm font-semibold text-brand-gray">
                  {hasValue(profile.age) && <span className="text-brand-plum font-bold">{profile.age} Years</span>}
                  {hasValue(profile.age) && hasValue(profile.height) && <span>•</span>}
                  {hasValue(profile.height) && <span>{profile.height}</span>}
                  {(hasValue(profile.age) || hasValue(profile.height)) && hasValue(profile.district) && <span>•</span>}
                  {hasValue(profile.district) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-kesari shrink-0" />
                      {profile.district}{hasValue(profile.nativePlace) ? `, ${profile.nativePlace}` : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Bookmark (Shortlist) Button */}
              <button
                onClick={() => toggleShortlist(profile.id)}
                className={`p-3 rounded-2xl border transition-all shrink-0 ${
                  isShortlisted
                    ? 'bg-brand-plum text-brand-gold border-brand-gold shadow'
                    : 'bg-white text-brand-charcoal border-gray-200 hover:bg-brand-lightBg'
                }`}
                title={t('shortlist')}
              >
                <Bookmark className={`w-5 h-5 ${isShortlisted ? 'fill-brand-gold' : ''}`} />
              </button>
            </div>

            {/* Spec Pills (Only fields that exist!) */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {hasValue(profile.caste) && (
                <span className="px-3.5 py-1.5 rounded-xl bg-brand-rose/10 border border-brand-rose/20 text-brand-plum text-xs font-bold">
                  {profile.caste}
                </span>
              )}
              {hasValue(profile.education) && (
                <span className="px-3.5 py-1.5 rounded-xl bg-brand-plum/10 border border-brand-plum/20 text-brand-plum text-xs font-bold">
                  {profile.education}
                </span>
              )}
              {hasValue(profile.occupation) && (
                <span className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                  {profile.occupation}
                </span>
              )}
              {hasValue(profile.maritalStatus) && (
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                  {profile.maritalStatus}
                </span>
              )}
            </div>

          </div>

          {/* Action Button Bar */}
          <div className="pt-4 border-t border-gray-100">
            {isAccepted ? (
              <button
                onClick={handleAction}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>{t('sendMessage')} (Chat Active)</span>
              </button>
            ) : isReceived ? (
              <div className="flex gap-3">
                <button
                  onClick={() => acceptInterest(profile.id)}
                  className="flex-1 py-3.5 px-6 bg-brand-plum text-white font-bold text-sm rounded-2xl shadow-md hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
                >
                  <Check className="w-4 h-4 text-brand-gold" />
                  <span>{t('acceptInterest')}</span>
                </button>
                <button
                  onClick={() => declineInterest(profile.id)}
                  className="py-3.5 px-5 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-rose-50 hover:text-rose-700 transition-all"
                >
                  {t('declineInterest')}
                </button>
              </div>
            ) : isSent ? (
              <div className="w-full py-3 px-6 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xl font-bold text-xs text-center">
                {t('interestSent')}
              </div>
            ) : (
              <button
                onClick={handleAction}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
              >
                <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
                <span>{t('sendInterest')}</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* About Me Section */}
      {hasValue(profile.aboutMe) && (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-3">
          <h3 className="font-serif text-lg font-bold text-brand-plum flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-kesari" />
            <span>{t('aboutMe')}</span>
          </h3>
          <div className="p-4 sm:p-5 rounded-2xl bg-brand-ivory/60 border-l-4 border-brand-plum text-sm text-brand-charcoal leading-relaxed">
            {profile.aboutMe}
          </div>
        </div>
      )}

      {/* Basic & Personal Information */}
      {hasBasicInfo && (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-5">
          <h3 className="font-serif text-lg font-bold text-brand-plum flex items-center gap-2 border-b border-gray-100 pb-3">
            <User className="w-4 h-4 text-brand-plum" />
            <span>Basic & Personal Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6 text-xs">
            {hasValue(profile.age) && (
              <div>
                <span className="text-brand-gray font-medium block">Age</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.age} Years</p>
              </div>
            )}
            {hasValue(profile.gender) && (
              <div>
                <span className="text-brand-gray font-medium block">Gender</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5 capitalize">{profile.gender}</p>
              </div>
            )}
            {hasValue(profile.height) && (
              <div>
                <span className="text-brand-gray font-medium block">Height</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.height}</p>
              </div>
            )}
            {hasValue(profile.maritalStatus) && (
              <div>
                <span className="text-brand-gray font-medium block">Marital Status</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.maritalStatus}</p>
              </div>
            )}
            {hasValue(profile.motherTongue) && (
              <div>
                <span className="text-brand-gray font-medium block">Mother Tongue</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.motherTongue}</p>
              </div>
            )}
            {hasValue(profile.religion) && (
              <div>
                <span className="text-brand-gray font-medium block">Religion</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.religion}</p>
              </div>
            )}
            {hasValue(profile.caste) && (
              <div>
                <span className="text-brand-gray font-medium block">Caste / Community</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.caste}</p>
              </div>
            )}
            {hasValue(profile.district) && (
              <div>
                <span className="text-brand-gray font-medium block">Current Location</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.district}</p>
              </div>
            )}
            {hasValue(profile.nativePlace) && (
              <div>
                <span className="text-brand-gray font-medium block">Native Place (मूळ गाव)</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.nativePlace}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education & Career */}
      {hasCareer && (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-5">
          <h3 className="font-serif text-lg font-bold text-brand-plum flex items-center gap-2 border-b border-gray-100 pb-3">
            <GraduationCap className="w-4 h-4 text-brand-plum" />
            <span>Education & Career</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6 text-xs">
            {hasValue(profile.education) && (
              <div>
                <span className="text-brand-gray font-medium block">Education Level</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.education}</p>
              </div>
            )}
            {hasValue(profile.college) && (
              <div>
                <span className="text-brand-gray font-medium block">College / University</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.college}</p>
              </div>
            )}
            {hasValue(profile.occupation) && (
              <div>
                <span className="text-brand-gray font-medium block">Occupation</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.occupation}</p>
              </div>
            )}
            {hasValue(profile.company) && (
              <div>
                <span className="text-brand-gray font-medium block">Organization / Company</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.company}</p>
              </div>
            )}
            {hasValue(profile.income) && (
              <div>
                <span className="text-brand-gray font-medium block">Annual Income</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.income}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Family Background */}
      {hasFamily && (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-5">
          <h3 className="font-serif text-lg font-bold text-brand-plum flex items-center gap-2 border-b border-gray-100 pb-3">
            <Home className="w-4 h-4 text-brand-plum" />
            <span>Family Background</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6 text-xs">
            {hasValue(profile.fatherOccupation) && (
              <div>
                <span className="text-brand-gray font-medium block">Father's Occupation</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.fatherOccupation}</p>
              </div>
            )}
            {hasValue(profile.motherOccupation) && (
              <div>
                <span className="text-brand-gray font-medium block">Mother's Occupation</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.motherOccupation}</p>
              </div>
            )}
            {hasValue(profile.familyType) && (
              <div>
                <span className="text-brand-gray font-medium block">Family Type</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.familyType}</p>
              </div>
            )}
            {hasValue(profile.siblings) && (
              <div>
                <span className="text-brand-gray font-medium block">Siblings</span>
                <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.siblings}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lifestyle & Interests */}
      {hasLifestyle && (
        <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-5">
          <h3 className="font-serif text-lg font-bold text-brand-plum flex items-center gap-2 border-b border-gray-100 pb-3">
            <Utensils className="w-4 h-4 text-brand-plum" />
            <span>Lifestyle & Interests</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {hasValue(profile.diet) && (
                <div className="p-3.5 rounded-2xl bg-brand-lightBg/50">
                  <span className="text-brand-gray font-medium block">Diet</span>
                  <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.diet}</p>
                </div>
              )}
              {hasValue(profile.smoking) && (
                <div className="p-3.5 rounded-2xl bg-brand-lightBg/50">
                  <span className="text-brand-gray font-medium block">Smoking</span>
                  <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.smoking}</p>
                </div>
              )}
              {hasValue(profile.drinking) && (
                <div className="p-3.5 rounded-2xl bg-brand-lightBg/50">
                  <span className="text-brand-gray font-medium block">Drinking</span>
                  <p className="font-bold text-brand-plum text-sm mt-0.5">{profile.drinking}</p>
                </div>
              )}
            </div>

            {hasValue(profile.hobbies) && (
              <div className="pt-2">
                <span className="text-brand-gray font-medium block mb-2">Hobbies & Interests</span>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(profile.hobbies) ? profile.hobbies : String(profile.hobbies).split(',')).map((h, i) => (
                    <span key={i} className="bg-brand-rose/15 text-brand-plum font-bold px-3.5 py-1.5 rounded-full text-xs">
                      {typeof h === 'string' ? h.trim() : h}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Maharashtrian Biodata PDF / Image Document Section */}
      <BiodataPdfSection user={profile} isEditable={false} />

      {/* Mobile Floating Sticky Action Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-brand-rose/20 shadow-2xl z-40">
        {isAccepted ? (
          <button
            onClick={handleAction}
            className="w-full py-3 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4 text-brand-gold" />
            <span>{t('sendMessage')}</span>
          </button>
        ) : isReceived ? (
          <div className="flex gap-2">
            <button
              onClick={() => acceptInterest(profile.id)}
              className="flex-1 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1"
            >
              <Check className="w-4 h-4 text-brand-gold" />
              <span>{t('acceptInterest')}</span>
            </button>
            <button
              onClick={() => declineInterest(profile.id)}
              className="py-3 px-4 bg-gray-100 text-gray-700 font-semibold text-xs rounded-xl"
            >
              {t('declineInterest')}
            </button>
          </div>
        ) : isSent ? (
          <div className="w-full py-2.5 bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs text-center rounded-xl">
            {t('interestSent')}
          </div>
        ) : (
          <button
            onClick={handleAction}
            className="w-full py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-2"
          >
            <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
            <span>{t('sendInterest')}</span>
          </button>
        )}
      </div>

    </div>
  );
};
