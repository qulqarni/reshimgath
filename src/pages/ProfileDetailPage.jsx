import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { PhotoGallery } from '../components/profile/PhotoGallery';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { BiodataPdfSection } from '../components/profile/BiodataPdfSection';
import { SubscriptionModal } from '../components/subscription/SubscriptionModal';
import { UnlockConfirmationModal } from '../components/subscription/UnlockConfirmationModal';
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
  CheckCircle2,
  Ban,
  Lock,
  Crown,
  UserCheck,
  Phone,
  Mail,
  MessageCircle
} from 'lucide-react';

const HeroHeaderCard = ({ profile, hasValue }) => (
  <div className="bg-white p-5 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5 w-full max-w-full overflow-hidden">
    {/* Candidate Name & Tagline */}
    <div className="space-y-1 min-w-0">
      <div className="flex items-center space-x-2.5 flex-wrap gap-2 min-w-0">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-brand-plum leading-tight break-words min-w-0">
          {profile.name}
        </h1>
        {profile.verified && <VerificationBadge size="small" />}
        <span className="px-3 py-1 bg-brand-plum text-white font-bold text-xs rounded-full shadow-sm border border-brand-gold/40 shrink-0 whitespace-nowrap">
          Reg ID: {profile.regId || `SS-${profile.registrationId || 1001}`}
        </span>
      </div>

      <p className="text-xs sm:text-sm font-semibold text-brand-gray leading-relaxed">
        {hasValue(profile.age) && <span className="text-brand-plum font-bold">{profile.age} Years</span>}
        {hasValue(profile.age) && hasValue(profile.height) && <span> • </span>}
        {hasValue(profile.height) && <span>{profile.height}</span>}
        {(hasValue(profile.age) || hasValue(profile.height)) && hasValue(profile.district) && <span> • </span>}
        {hasValue(profile.district) && <span>{profile.district}, Maharashtra</span>}
      </p>
    </div>

    {/* About Me Box (If present) */}
    {hasValue(profile.aboutMe) && (
      <div className="bg-rose-50/50 border border-rose-100/80 p-4 sm:p-5 rounded-2xl space-y-1.5 min-w-0">
        <h4 className="font-serif font-bold text-xs text-brand-plum uppercase tracking-wider">
          About Me
        </h4>
        <p className="text-xs text-brand-charcoal leading-relaxed break-words">
          {profile.aboutMe}
        </p>
      </div>
    )}

    {/* Key Spec Bar (Age, Height, Location) */}
    <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-amber-50/50 border border-amber-100 p-3 sm:p-3.5 rounded-2xl text-center min-w-0">
      {hasValue(profile.age) && (
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] text-amber-900/70 font-semibold block uppercase truncate">Age</span>
          <p className="font-bold text-xs text-brand-plum truncate">{profile.age} Yrs</p>
        </div>
      )}
      {hasValue(profile.height) && (
        <div className="space-y-0.5 border-x border-amber-200/60 px-1 sm:px-2 min-w-0">
          <span className="text-[10px] text-amber-900/70 font-semibold block uppercase truncate">Height</span>
          <p className="font-bold text-xs text-brand-plum truncate">{profile.height}</p>
        </div>
      )}
      {hasValue(profile.district) && (
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] text-amber-900/70 font-semibold block uppercase truncate">Location</span>
          <p className="font-bold text-xs text-brand-plum truncate">{profile.district}, MH</p>
        </div>
      )}
    </div>
  </div>
);

export const ProfileDetailPage = ({ profileId, onNavigate }) => {
  const { user, isAuthenticated, canViewProfile, unlockProfileForUser, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, sendInterest, acceptInterest, declineInterest, toggleShortlist, recordProfileView } = useProfiles();

  const [showSubModal, setShowSubModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const profile = profiles.find((p) => {
    if (!profileId) return true;
    const target = String(profileId).toLowerCase().trim();
    if (String(p.id).toLowerCase() === target) return true;
    if (p.regId && String(p.regId).toLowerCase() === target) return true;
    if (p.registrationId && String(p.registrationId).toLowerCase() === target) return true;
    if (p.registrationId && String(`SS-${p.registrationId}`).toLowerCase() === target) return true;
    return false;
  }) || profiles[0];

  const accessStatus = canViewProfile(profile?.id);

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

  if (profile.blocked && (!user || !(user.isAdmin || user.role === 'admin' || user.id === 'admin_1'))) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <Ban className="w-8 h-8 text-rose-600" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-brand-plum">Profile Account Blocked</h2>
        <p className="text-xs text-brand-gray">This matrimonial profile has been suspended or blocked by bureau administration.</p>
        <button
          onClick={() => onNavigate('/discover')}
          className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  // Access Control Enforcement for Candidate Profile Detail Viewing
  if (!accessStatus.canView) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 space-y-6 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-brand-rose/30 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto border-2 border-amber-300 shadow">
            <Lock className="w-8 h-8 text-amber-700" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-brand-plum">
              {profile.name} — Profile Access Locked
            </h2>
            <p className="text-xs text-brand-gray leading-relaxed">
              Reg ID: {profile.regId || `SS-${profile.registrationId}`} • {profile.district || 'Maharashtra'}
            </p>
            <p className="text-xs sm:text-sm text-brand-charcoal pt-2 font-medium leading-relaxed">
              {accessStatus.hasActivePlan && accessStatus.remainingVisits > 0
                ? `You have ${accessStatus.remainingVisits} profile unlock credits remaining out of ${accessStatus.totalVisits}. Unlock to view complete contact details, family background, and biodata.`
                : 'A matrimonial membership plan is required to view complete candidate profile details and contact numbers.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3 max-w-xs mx-auto">
            {accessStatus.hasActivePlan && accessStatus.remainingVisits > 0 ? (
              <button
                onClick={() => setShowUnlockModal(true)}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
              >
                <UserCheck className="w-4 h-4 text-brand-gold" />
                <span>Unlock Profile (1 Credit Count)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowSubModal(true)}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
              >
                <Crown className="w-4 h-4 text-brand-gold fill-brand-gold" />
                <span>Activate Membership Plan</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('/discover')}
              className="w-full py-2.5 px-4 bg-gray-100 text-brand-charcoal font-bold text-xs rounded-2xl hover:bg-gray-200"
            >
              Back to Discover
            </button>
          </div>
        </div>

        <SubscriptionModal
          isOpen={showSubModal}
          onClose={() => setShowSubModal(false)}
          targetProfileName={profile.name}
        />

        <UnlockConfirmationModal
          isOpen={showUnlockModal}
          onClose={() => setShowUnlockModal(false)}
          onConfirm={() => {
            unlockProfileForUser(profile.id);
            setShowUnlockModal(false);
          }}
          profile={profile}
          remainingVisits={accessStatus.remainingVisits}
          totalVisits={accessStatus.totalVisits}
        />
      </div>
    );
  }

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full max-w-full">
        
        {/* LEFT SIDEBAR COLUMN */}
        <aside className="w-full lg:col-span-5 space-y-6">
          
          {/* Photo Gallery Card */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-rose/20 shadow-luxury w-full max-w-full overflow-hidden">
            <PhotoGallery photos={profile.photos} avatar={profile.avatar} name={profile.name} />
          </div>

          {/* Hero Header Card (Mobile Only: Rendered right after Photo Gallery) */}
          <div className="block lg:hidden w-full max-w-full overflow-hidden">
            <HeroHeaderCard profile={profile} hasValue={hasValue} />
          </div>

          {/* Interest Status Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4 w-full max-w-full overflow-hidden">
            <div className="text-[10px] font-bold tracking-wider text-brand-gray uppercase border-b border-gray-100 pb-2">
              Interest Status
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              </div>
              <div className="min-w-0">
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

          {/* Candidate Maharashtrian Biodata Document Section */}
          <BiodataPdfSection user={profile} isEditable={false} />
        </aside>

        {/* RIGHT MAIN CONTENT COLUMN */}
        <main className="w-full lg:col-span-7 space-y-6">
          
          {/* Hero Header Card (Desktop Only: Rendered at top of main column) */}
          <div className="hidden lg:block w-full max-w-full overflow-hidden">
            <HeroHeaderCard profile={profile} hasValue={hasValue} />
          </div>

          {/* Contact Details (संपर्क माहिती) Card */}
          <div className="bg-gradient-to-br from-white via-slate-50/50 to-amber-50/20 p-6 sm:p-8 rounded-3xl border border-brand-gold/30 shadow-luxury space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-plum text-brand-gold flex items-center justify-center shrink-0 shadow-sm">
                  <Phone className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                    Contact Details (संपर्क माहिती)
                  </h3>
                  <p className="text-[10px] text-brand-gray">Direct phone number, WhatsApp & address details</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Verified Contact</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Phone / Mobile No. */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-gray font-medium block">Phone / Mobile No.</span>
                    <p className="font-bold text-brand-plum text-xs mt-0.5 font-mono">
                      {profile.phone || profile.mobile || '+91 98230 00000'}
                    </p>
                  </div>
                </div>
                {(profile.phone || profile.mobile) && (
                  <a
                    href={`tel:${String(profile.phone || profile.mobile).replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl transition-all flex items-center space-x-1 shadow-sm shrink-0"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                )}
              </div>

              {/* WhatsApp Chat Link */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-brand-gray font-medium block">WhatsApp Chat</span>
                    <p className="font-bold text-brand-plum text-xs mt-0.5 font-mono">
                      {profile.phone || profile.mobile || '+91 98230 00000'}
                    </p>
                  </div>
                </div>
                {(profile.phone || profile.mobile) && (
                  <a
                    href={`https://wa.me/${String(profile.phone || profile.mobile).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-xl transition-all flex items-center space-x-1 shadow-sm shrink-0"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Email Address */}
              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-brand-gray font-medium block">Email Address</span>
                  <p className="font-bold text-brand-plum text-xs mt-0.5 truncate">
                    {profile.email || 'Contact bureau for email'}
                  </p>
                </div>
              </div>

              {/* Location & Address */}
              <div className="flex items-center space-x-3 p-3.5 rounded-2xl bg-white border border-gray-100 shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-kesari" />
                </div>
                <div>
                  <span className="text-[10px] text-brand-gray font-medium block">Location & Address</span>
                  <p className="font-bold text-brand-plum text-xs mt-0.5">
                    {[profile.city, profile.district, profile.nativePlace].filter(Boolean).join(', ') || 'Maharashtra, India'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Section Card */}
          {hasPersonalInfo && (
            <div className="order-5 bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
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
            <div className="order-6 bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
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
            <div className="order-7 bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
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
            <div className="order-8 bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-5">
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
