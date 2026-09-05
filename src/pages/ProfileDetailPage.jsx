import React, { useState } from 'react';
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
  Sparkles,
  ShieldCheck,
  Share2,
  Calendar,
  Ruler,
  Users,
  Eye,
  Building2,
  CheckCircle2
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name} - Sambodhi Sarang Matrimony`,
        text: `View matrimonial profile of ${profile.name} on Sambodhi Sarang`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  const hasValue = (val) => {
    if (val === null || val === undefined) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  };

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Candidate';

  const hasPersonalInfo = hasValue(profile.maritalStatus) || hasValue(profile.dob) || hasValue(profile.motherTongue) || hasValue(profile.religion) || hasValue(profile.caste) || hasValue(profile.nativePlace);
  const hasCareer = hasValue(profile.education) || hasValue(profile.college) || hasValue(profile.occupation) || hasValue(profile.company) || hasValue(profile.income) || hasValue(profile.district);
  const hasFamily = hasValue(profile.fatherOccupation) || hasValue(profile.motherOccupation) || hasValue(profile.familyType) || hasValue(profile.siblings);
  const hasLifestyle = hasValue(profile.diet) || hasValue(profile.smoking) || hasValue(profile.drinking) || hasValue(profile.hobbies);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28 md:pb-12">
      
      {/* Top Header Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/discover')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-plum hover:text-brand-kesari transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover</span>
        </button>

        <div className="flex items-center space-x-3 text-xs font-semibold text-brand-gray">
          <button
            onClick={() => toggleShortlist(profile.id)}
            className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full border transition-all ${
              isShortlisted
                ? 'bg-brand-plum text-brand-gold border-brand-gold font-bold shadow-sm'
                : 'bg-white text-brand-charcoal border-gray-200 hover:bg-brand-lightBg'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-brand-gold' : ''}`} />
            <span>{isShortlisted ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-brand-charcoal hover:bg-brand-lightBg transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-brand-plum" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Structural Grid (Left Sidebar + Right Content Column) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT SIDEBAR COLUMN */}
        <aside className="lg:col-span-5 space-y-6">
          
          {/* Photo Gallery Card */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-rose/20 shadow-luxury">
            <PhotoGallery photos={profile.photos} avatar={profile.avatar} name={profile.name} />
          </div>

          {/* Interest Status Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            <div className="text-[10px] font-bold tracking-wider text-brand-gray uppercase border-b border-gray-100 pb-2">
              Interest Status
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-brand-plum">
                  {isAccepted 
                    ? "Connection Unlocked!" 
                    : isReceived 
                    ? `${firstName} sent you an interest!` 
                    : isSent 
                    ? "Interest Request Sent" 
                    : "No interest sent yet"}
                </h4>
                <p className="text-[11px] text-brand-gray mt-0.5 leading-relaxed">
                  {isAccepted 
                    ? "You are connected! You can now send direct private messages." 
                    : isReceived 
                    ? `Accept ${firstName}'s interest to unlock private messaging.` 
                    : isSent 
                    ? `Waiting for ${firstName} to accept your interest request.` 
                    : `Send interest to connect with ${firstName}.`}
                </p>
              </div>
            </div>

            {/* Primary Action Button */}
            {isAccepted ? (
              <button
                onClick={handleAction}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-200" />
                <span>Message</span>
              </button>
            ) : isReceived ? (
              <div className="flex gap-2">
                <button
                  onClick={() => acceptInterest(profile.id)}
                  className="flex-1 py-3.5 bg-brand-plum text-white font-bold text-xs rounded-2xl shadow-md hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-1.5 border border-brand-gold/40"
                >
                  <Check className="w-4 h-4 text-brand-gold" />
                  <span>{t('acceptInterest')}</span>
                </button>
                <button
                  onClick={() => declineInterest(profile.id)}
                  className="py-3.5 px-4 bg-gray-100 text-gray-700 font-bold text-xs rounded-2xl hover:bg-rose-50 hover:text-rose-700 transition-all"
                >
                  {t('declineInterest')}
                </button>
              </div>
            ) : isSent ? (
              <div className="w-full py-3 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xl font-bold text-xs text-center">
                {t('interestSent')}
              </div>
            ) : (
              <button
                onClick={handleAction}
                className="w-full py-3.5 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
              >
                <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
                <span>{t('sendInterest')}</span>
              </button>
            )}

            {!isAccepted && (
              <p className="text-[10px] text-center text-brand-gray italic">
                You can message once interest is accepted
              </p>
            )}
          </div>

          {/* About Candidate Profile Overview Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3.5">
            <div className="text-[10px] font-bold tracking-wider text-brand-gray uppercase border-b border-gray-100 pb-2">
              About {firstName}'s Profile
            </div>

            <div className="space-y-2.5 text-xs text-brand-charcoal font-medium">
              <div className="flex items-center space-x-2.5">
                <Eye className="w-4 h-4 text-brand-plum shrink-0" />
                <span>Profile viewed recently</span>
              </div>
              {profile.verified && (
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-800">Profile Verified ✓</span>
                </div>
              )}
              {hasValue(profile.district) && (
                <div className="flex items-center space-x-2.5">
                  <MapPin className="w-4 h-4 text-brand-kesari shrink-0" />
                  <span>Based in {profile.district}, Maharashtra</span>
                </div>
              )}
              {hasValue(profile.education) && (
                <div className="flex items-center space-x-2.5">
                  <GraduationCap className="w-4 h-4 text-brand-plum shrink-0" />
                  <span className="truncate">{profile.education}</span>
                </div>
              )}
              {hasValue(profile.occupation) && (
                <div className="flex items-center space-x-2.5">
                  <Briefcase className="w-4 h-4 text-brand-plum shrink-0" />
                  <span className="truncate">{profile.occupation}</span>
                </div>
              )}
            </div>
          </div>

        </aside>

        {/* RIGHT MAIN CONTENT COLUMN */}
        <main className="lg:col-span-7 space-y-6">
          
          {/* Hero Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
            
            {/* Candidate Name & Tagline */}
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum leading-tight">
                  {profile.name}
                </h1>
                {profile.verified && <VerificationBadge size="small" />}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-brand-gray">
                {hasValue(profile.age) && <span className="text-brand-plum font-bold">{profile.age} Years</span>}
                {hasValue(profile.age) && hasValue(profile.height) && <span> • </span>}
                {hasValue(profile.height) && <span>{profile.height}</span>}
                {(hasValue(profile.age) || hasValue(profile.height)) && hasValue(profile.district) && <span> • </span>}
                {hasValue(profile.district) && <span>{profile.district}, Maharashtra</span>}
              </p>
            </div>

            {/* About Me Box (If present) */}
            {hasValue(profile.aboutMe) && (
              <div className="bg-rose-50/50 border border-rose-100/80 p-5 rounded-2xl space-y-1.5">
                <h4 className="font-serif font-bold text-xs text-brand-plum uppercase tracking-wider">
                  About Me
                </h4>
                <p className="text-xs text-brand-charcoal leading-relaxed">
                  {profile.aboutMe}
                </p>
              </div>
            )}

            {/* Key Spec Bar (Age, Height, Location) */}
            <div className="grid grid-cols-3 gap-3 bg-amber-50/50 border border-amber-100 p-3.5 rounded-2xl text-center">
              {hasValue(profile.age) && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-amber-900/70 font-semibold block uppercase">Age</span>
                  <p className="font-bold text-xs text-brand-plum">{profile.age} Years</p>
                </div>
              )}
              {hasValue(profile.height) && (
                <div className="space-y-0.5 border-x border-amber-200/60 px-2">
                  <span className="text-[10px] text-amber-900/70 font-semibold block uppercase">Height</span>
                  <p className="font-bold text-xs text-brand-plum">{profile.height}</p>
                </div>
              )}
              {hasValue(profile.district) && (
                <div className="space-y-0.5">
                  <span className="text-[10px] text-amber-900/70 font-semibold block uppercase">Location</span>
                  <p className="font-bold text-xs text-brand-plum truncate">{profile.district}, MH</p>
                </div>
              )}
            </div>

          </div>

          {/* Personal Information Section Card */}
          {hasPersonalInfo && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {hasValue(profile.maritalStatus) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Heart className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Marital Status</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.maritalStatus}</p>
                    </div>
                  </div>
                )}

                {(hasValue(profile.dob) || hasValue(profile.age)) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Date of Birth / Age</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">
                        {profile.dob ? profile.dob : `${profile.age} Years`}
                      </p>
                    </div>
                  </div>
                )}

                {hasValue(profile.motherTongue) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Mother Tongue</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.motherTongue}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.religion) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-brand-kesari" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Religion</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.religion}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.caste) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Community / Caste</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.caste}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.nativePlace) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-kesari" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Native Place (मूळ गाव)</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.nativePlace}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education & Career Section Card */}
          {hasCareer && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                  Education & Career
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {hasValue(profile.education) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Education Degree</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.education}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.college) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">College / University</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.college}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.occupation) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Occupation</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.occupation}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.company) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Company / Workplace</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.company}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.income) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-brand-kesari" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Annual Income</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.income}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.district) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-brand-kesari" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Work Location</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.district}, Maharashtra</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Family Background Section Card */}
          {hasFamily && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                  Family Background
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {hasValue(profile.fatherOccupation) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Father's Occupation</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.fatherOccupation}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.motherOccupation) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Mother's Occupation</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.motherOccupation}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.familyType) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Family Type</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.familyType}</p>
                    </div>
                  </div>
                )}

                {hasValue(profile.siblings) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-rose-100/60 text-brand-plum flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Siblings</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.siblings}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lifestyle Section Card */}
          {hasLifestyle && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-3.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                  Lifestyle & Habits
                </h3>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {hasValue(profile.diet) && (
                    <div className="p-3 rounded-2xl bg-brand-lightBg/50">
                      <span className="text-[10px] text-brand-gray font-medium block">Diet</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.diet}</p>
                    </div>
                  )}
                  {hasValue(profile.smoking) && (
                    <div className="p-3 rounded-2xl bg-brand-lightBg/50">
                      <span className="text-[10px] text-brand-gray font-medium block">Smoking</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.smoking}</p>
                    </div>
                  )}
                  {hasValue(profile.drinking) && (
                    <div className="p-3 rounded-2xl bg-brand-lightBg/50">
                      <span className="text-[10px] text-brand-gray font-medium block">Drinking</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.drinking}</p>
                    </div>
                  )}
                </div>

                {hasValue(profile.hobbies) && (
                  <div className="pt-1">
                    <span className="text-[10px] text-brand-gray font-semibold uppercase block mb-2">
                      Hobbies & Interests
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(profile.hobbies) ? profile.hobbies : String(profile.hobbies).split(',')).map((h, i) => (
                        <span key={i} className="bg-rose-50 text-brand-plum border border-rose-200/60 font-bold px-3.5 py-1.5 rounded-full text-xs">
                          {typeof h === 'string' ? h.trim() : h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Candidate Maharashtrian Biodata Document Section */}
          <BiodataPdfSection user={profile} isEditable={false} />

        </main>

      </div>

      {/* Safety Banner Footer (matching reference bottom banner) */}
      <div className="bg-gradient-to-r from-rose-50/80 via-brand-ivory to-rose-50/80 border border-rose-100 p-4 sm:p-5 rounded-3xl flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-brand-plum flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-brand-plum" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-brand-plum">We care about your safety</h4>
            <p className="text-[11px] text-brand-gray mt-0.5">
              All profiles on Sambodhi Sarang are manually verified to ensure genuine Maharashtrian matrimonial connections.
            </p>
          </div>
        </div>
      </div>

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

export default ProfileDetailPage;
