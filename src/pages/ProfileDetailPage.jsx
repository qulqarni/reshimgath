import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { PhotoGallery } from '../components/profile/PhotoGallery';
import { VerificationBadge } from '../components/common/VerificationBadge';
import { BiodataPdfSection, BiodataViewerModal } from '../components/profile/BiodataPdfSection';
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
  MessageCircle,
  RotateCcw,
  HeartHandshake,
  X,
  Copy
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
          Profile No. {profile.registrationId || (profile.regId ? String(profile.regId).replace(/^SS-?/i, '') : '1001')}
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

const ActionButtonsStack = ({
  profile,
  firstName,
  isContactUnlocked,
  hasCreditsToUnlock,
  isAuthenticated,
  isSubscribed,
  isAccepted,
  isReceived,
  isSent,
  handleAction,
  handleUnlockContactClick,
  onOpenBiodata,
  onOpenContact,
  acceptInterest,
  declineInterest,
  withdrawInterest,
  t
}) => (
  <div className="space-y-3 w-full">
    {/* 1. Send Interest Button */}
    {isAccepted ? (
      <button
        type="button"
        onClick={handleAction}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:from-emerald-700 hover:to-emerald-900 transition-all flex items-center justify-center space-x-2 border border-emerald-400/40"
      >
        <MessageSquare className="w-4 h-4 text-emerald-200" />
        <span>{t('sendMessage') || 'Message Candidate'}</span>
      </button>
    ) : isReceived ? (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => acceptInterest(profile.id)}
          className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center space-x-1.5 border border-emerald-400/40"
        >
          <Check className="w-4 h-4 text-white" />
          <span>{t('acceptInterest')} (Free)</span>
        </button>
        <button
          type="button"
          onClick={() => declineInterest(profile.id)}
          className="py-3.5 px-4 bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm rounded-2xl hover:bg-rose-50 hover:text-rose-700 transition-all"
        >
          {t('declineInterest')}
        </button>
      </div>
    ) : isSent ? (
      <div className="space-y-2">
        <div className="w-full py-3 px-4 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xl font-bold text-xs sm:text-sm text-center flex items-center justify-center space-x-2">
          <UserCheck className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{t('interestSent')}</span>
        </div>
        <button
          type="button"
          onClick={() => withdrawInterest(profile.id)}
          className="w-full py-2 px-3 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl border border-rose-200 transition-all flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Withdraw / Cancel Request</span>
        </button>
      </div>
    ) : (
      <button
        type="button"
        onClick={handleAction}
        className={`w-full py-3.5 px-4 font-bold text-xs sm:text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border ${
          isAuthenticated && (!isSubscribed || (!isContactUnlocked && !hasCreditsToUnlock))
            ? 'bg-gradient-to-r from-amber-600 via-brand-plum to-brand-plumDark text-white border-amber-400/40 hover:from-brand-plum hover:to-amber-600'
            : 'bg-gradient-to-r from-brand-plum to-brand-plumDark text-white border-brand-gold/40'
        }`}
      >
        {isAuthenticated && (!isSubscribed || (!isContactUnlocked && !hasCreditsToUnlock)) ? (
          <>
            <Crown className="w-4 h-4 text-amber-300" />
            <span>{t('sendInterest')} (Subscribe)</span>
          </>
        ) : isAuthenticated && !isContactUnlocked && hasCreditsToUnlock ? (
          <>
            <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
            <span>{t('sendInterest')} (1 Credit - Unlocks Contact & Biodata)</span>
          </>
        ) : (
          <>
            <Heart className="w-4 h-4 text-brand-rose fill-brand-rose" />
            <span>{t('sendInterest')}</span>
          </>
        )}
      </button>
    )}

    {/* 2. View Biodata Button */}
    <button
      type="button"
      onClick={() => {
        if (!isContactUnlocked) {
          handleUnlockContactClick();
        } else {
          onOpenBiodata();
        }
      }}
      className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-plum via-purple-900 to-brand-plumDark text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:brightness-110 transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
    >
      <Eye className="w-4 h-4 text-brand-gold shrink-0" />
      <span>
        {isContactUnlocked ? 'View Biodata / बायोडेटा पहा' : (
          !isAuthenticated
            ? 'View Biodata (Sign Up to View)'
            : hasCreditsToUnlock
            ? 'View Biodata (1 Credit Count)'
            : 'View Biodata (Subscribe to View)'
        )}
      </span>
      {!isContactUnlocked && <Lock className="w-3.5 h-3.5 text-brand-gold ml-1 shrink-0" />}
    </button>

    {/* 3. View Contact Button */}
    <button
      type="button"
      onClick={() => {
        if (!isContactUnlocked) {
          handleUnlockContactClick();
        } else {
          onOpenContact();
        }
      }}
      className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:from-emerald-700 hover:to-emerald-900 transition-all flex items-center justify-center space-x-2 border border-emerald-400/40"
    >
      <Phone className="w-4 h-4 text-brand-gold shrink-0" />
      <span>
        {isContactUnlocked ? 'View Contact Details / संपर्क माहिती पहा' : (
          !isAuthenticated
            ? 'View Contact Details (Sign Up to Unlock)'
            : hasCreditsToUnlock
            ? 'View Contact Details (1 Credit Count)'
            : 'View Contact Details (Subscribe to Unlock)'
        )}
      </span>
      {isContactUnlocked ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-300 ml-1 shrink-0" />
      ) : (
        <Lock className="w-3.5 h-3.5 text-brand-gold ml-1 shrink-0" />
      )}
    </button>

    {/* If Contact Unlocked: Instant Inline Verified Contact Card */}
    {isContactUnlocked && (
      <div className="pt-2 space-y-2 text-xs animate-in fade-in duration-300">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200">
          <div className="flex items-center space-x-2.5 min-w-0">
            <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-gray-500 font-medium block">Verified Phone / Mobile</span>
              <span className="font-bold text-brand-plum font-mono text-xs sm:text-sm">{profile.phone || profile.mobile || '+91 98230 00000'}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 shrink-0">
            {(profile.phone || profile.mobile) && (
              <a
                href={`tel:${String(profile.phone || profile.mobile).replace(/[^0-9+]/g, '')}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1 shadow-sm transition-all"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2.5 p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
          <Mail className="w-4 h-4 text-blue-700 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 font-medium block">Email Address</span>
            <span className="font-bold text-brand-plum text-xs truncate block">{profile.email || 'Contact bureau for email'}</span>
          </div>
        </div>
      </div>
    )}
  </div>
);

const ContactDetailsModal = ({ isOpen, onClose, profile, onCopy, copiedField }) => {
  if (!isOpen || !profile) return null;

  const phoneNum = profile.phone || profile.mobile || '+91 98230 00000';
  const cleanPhone = String(phoneNum).replace(/[^0-9+]/g, '');
  const emailAddr = profile.email || 'contact@sambodhisarang.com';
  const candidatePhoto = (profile.photos && profile.photos.length > 0) ? profile.photos[0] : (profile.avatar || null);

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/85 backdrop-blur-md p-4 flex items-center justify-center">
      <div className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl relative border border-brand-rose/20 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-brand-plum text-white p-5 flex items-center justify-between border-b border-brand-gold/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-gold text-brand-plum flex items-center justify-center font-bold shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">Contact Details</h3>
              <p className="text-[11px] text-brand-rose/80">संपर्क माहिती • Verified Direct Details</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-brand-rose hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Candidate mini card */}
          <div className="flex items-center space-x-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
            {candidatePhoto ? (
              <img src={candidatePhoto} alt={profile.name} className="w-12 h-12 rounded-xl object-cover border border-brand-plum/20 shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-lg shrink-0">
                {profile.name ? profile.name[0] : 'C'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-serif font-bold text-sm text-brand-plum truncate">{profile.name}</h4>
              <p className="text-[11px] text-brand-gray">
                Profile No. {profile.registrationId || (profile.regId ? String(profile.regId).replace(/^SS-?/i, '') : '1001')}
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center space-x-1 shrink-0">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Verified</span>
            </span>
          </div>

          {/* Phone section */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-brand-gray uppercase tracking-wider block">
              Phone / Mobile Number
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Phone className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="font-bold text-brand-plum font-mono text-base">{phoneNum}</span>
              </div>
              <button
                type="button"
                onClick={() => onCopy(phoneNum, 'Phone number')}
                className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-200 transition-all flex items-center space-x-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedField === 'Phone number' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={`tel:${cleanPhone}`}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Email section */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-brand-gray uppercase tracking-wider block">
              Email Address
            </label>
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center space-x-2.5 min-w-0">
                <Mail className="w-5 h-5 text-blue-700 shrink-0" />
                <span className="font-bold text-brand-plum text-xs sm:text-sm truncate">{emailAddr}</span>
              </div>
              <button
                type="button"
                onClick={() => onCopy(emailAddr, 'Email')}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 font-bold text-xs rounded-lg border border-blue-200 transition-all flex items-center space-x-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedField === 'Email' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <a
              href={`mailto:${emailAddr}`}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Email</span>
            </a>
          </div>

          {/* Security note */}
          <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/70 flex items-start space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-kesari shrink-0 mt-0.5" />
            <p className="text-[10px] text-brand-charcoal leading-relaxed">
              These contact details are confidential and shared solely for matrimonial communication under Sambodhi Sarang privacy guidelines.
            </p>
          </div>

        </div>

      </div>
    </div>,
    document.body
  );
};

export const ProfileDetailPage = ({ profileId, onNavigate }) => {
  const { user, isAuthenticated, canViewProfile, unlockProfileForUser, hasActiveSubscription, triggerPrivacyAlert } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, sendInterest, acceptInterest, declineInterest, withdrawInterest, toggleShortlist, recordProfileView, addToast } = useProfiles();

  const [showSubModal, setShowSubModal] = useState(false);
  const [subModalReason, setSubModalReason] = useState(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
  const [unlockActionPending, setUnlockActionPending] = useState(null);
  const [showBiodataViewerModal, setShowBiodataViewerModal] = useState(false);
  const [showContactDetailsModal, setShowContactDetailsModal] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
      if (addToast) {
        addToast(`${fieldName || 'Details'} copied to clipboard!`, 'success');
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {}
  };

  const profile = profiles.find((p) => {
    if (!profileId) return true;
    const target = String(profileId).toLowerCase().trim();
    if (String(p.id).toLowerCase() === target) return true;
    if (p.regId && String(p.regId).toLowerCase() === target) return true;
    if (p.registrationId && String(p.registrationId).toLowerCase() === target) return true;
    if (p.registrationId && String(`SS-${p.registrationId}`).toLowerCase() === target) return true;
    return false;
  }) || profiles[0];

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Candidate';
  const accessStatus = canViewProfile(profile?.id);
  const isContactUnlocked = accessStatus.canView || accessStatus.alreadyUnlocked;
  const isMeAdmin = user?.isAdmin === true || user?.role === 'admin' || user?.id === 'admin_1';
  const remainingCredits = user?.subscription?.creditsRemaining || 0;
  const hasCreditsToUnlock = isMeAdmin || remainingCredits > 0;

  const isSubscribed = isAuthenticated && (hasActiveSubscription ? hasActiveSubscription() : Boolean(
    isMeAdmin || (user?.subscription?.planId && user?.subscription?.planId !== 'none' && user?.subscription?.planId !== 'free')
  ));

  const saveRedirectForGuest = () => {
    const targetSlug = profile?.regId || (profile?.registrationId ? `SS-${profile.registrationId}` : profile?.id);
    if (targetSlug) {
      try {
        sessionStorage.setItem('reshimgath_redirect_after_auth', `/profile/${targetSlug}`);
      } catch (e) {}
    }
  };

  const handleUnlockContactClick = () => {
    if (!isAuthenticated) {
      saveRedirectForGuest();
      setShowGuestAuthModal(true);
    } else if (isReceived && !isAccepted) {
      if (addToast) addToast(`Accept ${firstName}'s interest above to view their contact details & biodata for free!`, 'info');
    } else if (accessStatus.hasActivePlan && accessStatus.remainingVisits > 0) {
      setUnlockActionPending(null);
      setShowUnlockModal(true);
    } else {
      setSubModalReason('view_contact');
      setShowSubModal(true);
    }
  };

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
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
        >
          Back to Home
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
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
        >
          Back to Home
        </button>
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
      saveRedirectForGuest();
      if (triggerPrivacyAlert) triggerPrivacyAlert();
      setShowGuestAuthModal(true);
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
      if (!isSubscribed || (!isContactUnlocked && !hasCreditsToUnlock)) {
        setSubModalReason('send_interest');
        setShowSubModal(true);
        return;
      }
      if (!isContactUnlocked && hasCreditsToUnlock) {
        setUnlockActionPending('send_interest');
        setShowUnlockModal(true);
        return;
      }
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

  const hasPersonalInfo = hasValue(profile.maritalStatus) || hasValue(profile.dob) || hasValue(profile.motherTongue) || hasValue(profile.religion) || hasValue(profile.caste) || hasValue(profile.nativePlace);
  const hasCareer = hasValue(profile.education) || hasValue(profile.college) || hasValue(profile.occupation) || hasValue(profile.company) || hasValue(profile.income) || hasValue(profile.district);
  const hasFamily = hasValue(profile.fatherOccupation) || hasValue(profile.motherOccupation) || hasValue(profile.familyType) || hasValue(profile.siblings);
  const hasLifestyle = hasValue(profile.diet) || hasValue(profile.smoking) || hasValue(profile.drinking) || hasValue(profile.hobbies);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">
      
      {/* Top Header Navigation Row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-plum hover:text-brand-kesari transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
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

      {/* MOBILE VIEW ONLY (lg:hidden): Traditional Digital Matrimonial Biodata Format */}
      <div className="block lg:hidden space-y-6">
        
        {/* Photo Gallery Card */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-rose/20 shadow-luxury w-full max-w-full overflow-hidden">
          <PhotoGallery photos={profile.photos} avatar={profile.avatar} name={profile.name} />
        </div>

        {/* DIGITAL MAHARASHTRIAN BIODATA DOCUMENT (Mobile View Main Card) */}
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-amber-300 shadow-luxury space-y-6">

          {/* 1. वैयक्तिक माहिती (PERSONAL DETAILS) */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
              <User className="w-4 h-4 text-brand-rose shrink-0" />
              <span>१. वैयक्तिक माहिती (PERSONAL DETAILS)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">संपूर्ण नाव:</span>
                <span className="font-bold text-brand-plum text-right break-words">{profile.name || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">वय (Age):</span>
                <span className="font-bold text-brand-plum text-right truncate">
                  {profile.age ? `${profile.age} वर्षे (${profile.age} Yrs)` : '-'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">जन्मतारीख:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.dob || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">उंची:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.height || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">वैवाहिक स्थिती:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.maritalStatus || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">धर्म / जात:</span>
                <span className="font-bold text-brand-plum text-right truncate">
                  {profile.religion || ''}{profile.caste ? ` - ${profile.caste}` : ''}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">मातृभाषा:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.motherTongue || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">मूळ गाव (Native Place):</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.nativePlace || '-'}</span>
              </div>
            </div>
          </div>

          {/* 2. शैक्षणिक व नोकरीची माहिती (EDUCATION & CAREER) */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
              <GraduationCap className="w-4 h-4 text-brand-plum shrink-0" />
              <span>२. शैक्षणिक व नोकरीची माहिती (EDUCATION & CAREER)</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">शिक्षण पदवी:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.education || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">नोकरी / व्यवसाय:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.occupation || '-'}</span>
              </div>
              {hasValue(profile.company) && (
                <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                  <span className="text-brand-gray font-medium shrink-0">कंपनी / ठिकाण:</span>
                  <span className="font-bold text-brand-plum text-right truncate">{profile.company}</span>
                </div>
              )}
              {hasValue(profile.income) && (
                <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                  <span className="text-brand-gray font-medium shrink-0">वार्षिक उत्पन्न:</span>
                  <span className="font-bold text-brand-plum text-right truncate">{profile.income}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                <span className="text-brand-gray font-medium shrink-0">नोकरीचे शहर / जिल्हा:</span>
                <span className="font-bold text-brand-plum text-right truncate">{profile.district ? `${profile.district}, महाराष्ट्र` : 'महाराष्ट्र'}</span>
              </div>
            </div>
          </div>

          {/* 3. कौटुंबिक माहिती (FAMILY BACKGROUND) */}
          {hasFamily && (
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
                <Home className="w-4 h-4 text-amber-600 shrink-0" />
                <span>३. कौटुंबिक माहिती (FAMILY BACKGROUND)</span>
              </h4>

              <div className="space-y-2 text-xs">
                {hasValue(profile.fatherOccupation) && (
                  <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                    <span className="text-brand-gray font-medium shrink-0">वडिलांचा व्यवसाय:</span>
                    <span className="font-bold text-brand-plum text-right truncate">{profile.fatherOccupation}</span>
                  </div>
                )}
                {hasValue(profile.motherOccupation) && (
                  <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                    <span className="text-brand-gray font-medium shrink-0">आईचा व्यवसाय:</span>
                    <span className="font-bold text-brand-plum text-right truncate">{profile.motherOccupation}</span>
                  </div>
                )}
                {hasValue(profile.familyType) && (
                  <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                    <span className="text-brand-gray font-medium shrink-0">कुटुंब प्रकार:</span>
                    <span className="font-bold text-brand-plum text-right truncate">{profile.familyType}</span>
                  </div>
                )}
                {hasValue(profile.siblings) && (
                  <div className="flex justify-between py-1 border-b border-gray-100 gap-2">
                    <span className="text-brand-gray font-medium shrink-0">भावंडे:</span>
                    <span className="font-bold text-brand-plum text-right truncate">{profile.siblings}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ४. भागीदाराकडून अपेक्षा (PARTNER EXPECTATIONS) - Always Above Action Buttons */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
              <HeartHandshake className="w-4 h-4 text-brand-kesari shrink-0" />
              <span>४. भागीदाराकडून अपेक्षा (PARTNER EXPECTATIONS)</span>
            </h4>
            <p className="text-xs text-brand-charcoal leading-relaxed whitespace-pre-line bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 font-medium">
              {hasValue(profile.expectations) 
                ? profile.expectations 
                : 'अनुरूप, सुशिक्षित व सुसंस्कृत स्थळ अपेक्षित. (Suitable, educated and cultured partner expectations.)'}
            </p>
          </div>

          {/* ५. कृती व संपर्क (ACTIONS & CONTACT) - Stacked vertically below Partner Expectations */}
          <div className="space-y-3 pt-2">
            <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum border-b border-rose-100 pb-1 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-brand-kesari shrink-0" />
              <span>५. कृती व संपर्क (ACTIONS & CONTACT)</span>
            </h4>

            <ActionButtonsStack
              profile={profile}
              firstName={firstName}
              isContactUnlocked={isContactUnlocked}
              hasCreditsToUnlock={hasCreditsToUnlock}
              isAuthenticated={isAuthenticated}
              isSubscribed={isSubscribed}
              isAccepted={isAccepted}
              isReceived={isReceived}
              isSent={isSent}
              handleAction={handleAction}
              handleUnlockContactClick={handleUnlockContactClick}
              onOpenBiodata={() => setShowBiodataViewerModal(true)}
              onOpenContact={() => setShowContactDetailsModal(true)}
              acceptInterest={acceptInterest}
              declineInterest={declineInterest}
              withdrawInterest={withdrawInterest}
              t={t}
            />
          </div>

          {/* Footer Branding */}
          <div className="text-center pt-3 border-t border-amber-200/60 space-y-0.5">
            <p className="font-bold text-xs text-brand-plum">
              संबोधी सारंग विवाह संस्था • इचलकरंजी, महाराष्ट्र
            </p>
            <p className="text-[10px] text-gray-400 italic">
              Certified Profile Document • Generated on Sambodhi Sarang Matrimony
            </p>
          </div>

        </div>
      </div>

      {/* DESKTOP VIEW ONLY (hidden lg:grid): Unchanged 2-Column Desktop Grid Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-6 items-start w-full max-w-full">
        
        {/* LEFT SIDEBAR COLUMN */}
        <aside className="w-full lg:col-span-5 space-y-6">
          
          {/* Photo Gallery Card */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-rose/20 shadow-luxury w-full max-w-full overflow-hidden">
            <PhotoGallery photos={profile.photos} avatar={profile.avatar} name={profile.name} />
          </div>

          {/* Candidate Verification & Trust Badges Card */}
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4 w-full max-w-full overflow-hidden">
            <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-brand-plum" />
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-plum">
                Verified Matrimonial Profile
              </h4>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60">
                <span className="text-brand-gray font-medium">Profile ID:</span>
                <span className="font-bold text-brand-plum font-mono">
                  SS-{profile.registrationId || (profile.regId ? String(profile.regId).replace(/^SS-?/i, '') : '1001')}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-brand-gray font-medium">Verification Status:</span>
                <span className="font-bold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>100% Phone & ID Verified</span>
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-lightBg/50 border border-gray-100">
                <span className="text-brand-gray font-medium">Native Location:</span>
                <span className="font-bold text-brand-plum truncate">
                  {profile.nativePlace || profile.district || 'Maharashtra'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/50 rounded-2xl border border-amber-200/50 text-center">
              <p className="text-[11px] text-brand-charcoal leading-relaxed font-medium">
                संबोधी सारंग विवाह संस्था, इचलकरंजी
              </p>
              <p className="text-[10px] text-brand-gray mt-0.5">
                Trusted Maharashtrian Matrimonial Bureau
              </p>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT COLUMN */}
        <main className="w-full lg:col-span-7 space-y-6">
          
          {/* Hero Header Card (Desktop Only: Rendered at top of main column) */}
          <div className="hidden lg:block w-full max-w-full overflow-hidden">
            <HeroHeaderCard profile={profile} hasValue={hasValue} />
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

                {hasValue(profile.isGovtEmployee) && (
                  <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-brand-lightBg/40">
                    <div className="w-8 h-8 rounded-xl bg-amber-100/60 text-amber-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-gray font-medium block">Government Employee (शासकीय कर्मचारी)</span>
                      <p className="font-bold text-brand-plum text-xs mt-0.5">{profile.isGovtEmployee}</p>
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

          {/* Partner Expectations Section Card - Above Action Buttons */}
          <div className="order-9 bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-4">
            <div className="flex items-center space-x-2.5 border-b border-gray-100 pb-3.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4 text-brand-kesari" />
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                Partner Expectations (भागीदाराकडून अपेक्षा)
              </h3>
            </div>
            <p className="text-xs text-brand-charcoal leading-relaxed whitespace-pre-line bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 font-medium">
              {hasValue(profile.expectations) 
                ? profile.expectations 
                : 'अनुरूप, सुशिक्षित व सुसंस्कृत स्थळ अपेक्षित. (Suitable, educated and cultured partner expectations.)'}
            </p>
          </div>

          {/* Connect & View Documents (Actions & Contact Details Card) - Directly Below Partner Expectations */}
          <div className="order-10 bg-white p-6 sm:p-8 rounded-3xl border border-brand-gold/30 shadow-luxury space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-plum text-brand-gold flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-brand-plum">
                    Connect & View Documents (कृती व संपर्क)
                  </h3>
                  <p className="text-[11px] text-brand-gray">
                    Send interest, view candidate biodata, and access verified contact details
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border flex items-center space-x-1 ${
                isContactUnlocked 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {isContactUnlocked ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <Lock className="w-3 h-3 text-amber-600" />}
                <span>{isContactUnlocked ? 'Contact Unlocked' : 'Locked Contact'}</span>
              </span>
            </div>

            <ActionButtonsStack
              profile={profile}
              firstName={firstName}
              isContactUnlocked={isContactUnlocked}
              hasCreditsToUnlock={hasCreditsToUnlock}
              isAuthenticated={isAuthenticated}
              isSubscribed={isSubscribed}
              isAccepted={isAccepted}
              isReceived={isReceived}
              isSent={isSent}
              handleAction={handleAction}
              handleUnlockContactClick={handleUnlockContactClick}
              onOpenBiodata={() => setShowBiodataViewerModal(true)}
              onOpenContact={() => setShowContactDetailsModal(true)}
              acceptInterest={acceptInterest}
              declineInterest={declineInterest}
              withdrawInterest={withdrawInterest}
              t={t}
            />
          </div>

        </main>

      </div>

      {/* Safety Banner Footer */}
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

      <SubscriptionModal
        isOpen={showSubModal}
        onClose={() => setShowSubModal(false)}
        targetProfileName={profile.name}
        reason={subModalReason}
      />

      <UnlockConfirmationModal
        isOpen={showUnlockModal}
        onClose={() => {
          setShowUnlockModal(false);
          setUnlockActionPending(null);
        }}
        onConfirm={() => {
          const success = unlockProfileForUser(profile.id);
          setShowUnlockModal(false);
          if (success && unlockActionPending === 'send_interest') {
            sendInterest(profile.id);
          }
          setUnlockActionPending(null);
        }}
        onOpenPlans={() => {
          setShowUnlockModal(false);
          setUnlockActionPending(null);
          setSubModalReason(unlockActionPending === 'send_interest' ? 'send_interest' : 'view_contact');
          setShowSubModal(true);
        }}
        profile={profile}
        remainingVisits={accessStatus.remainingVisits}
        totalVisits={accessStatus.totalVisits}
      />

      {/* Guest Authentication Modal for Non-Logged-In Users */}
      {showGuestAuthModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-center border border-brand-rose/20 animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setShowGuestAuthModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-brand-plum p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-brand-plum text-brand-gold flex items-center justify-center mx-auto shadow-md border border-brand-gold/30">
              <Crown className="w-8 h-8 text-brand-gold" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-2xl text-brand-plum">
                Sign Up & Choose a Plan
              </h3>
              <p className="text-xs text-brand-kesari font-semibold">
                खाते तयार करा आणि योजना निवडा
              </p>
              <p className="text-xs text-brand-gray leading-relaxed px-2 pt-1">
                To send interest, view verified contact numbers, and access candidate biodata, please create an account and choose a membership plan.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  saveRedirectForGuest();
                  setShowGuestAuthModal(false);
                  onNavigate('/signup');
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all border border-brand-gold/30 flex items-center justify-center space-x-2"
              >
                <span>Sign Up / Create Account & Choose Plan</span>
              </button>

              <button
                onClick={() => {
                  saveRedirectForGuest();
                  setShowGuestAuthModal(false);
                  onNavigate('/login');
                }}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-brand-lightBg text-brand-plum font-bold text-xs rounded-xl border border-brand-rose/30 transition-all flex items-center justify-center space-x-2"
              >
                <span>Log In to Existing Account</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              Sambodhi Sarang Marriage Bureau • Verified Maharashtrian Matrimony
            </p>
          </div>
        </div>,
        document.body
      )}

      {/* Fullscreen Maharashtrian Biodata Viewer Modal */}
      <BiodataViewerModal
        isOpen={showBiodataViewerModal}
        onClose={() => setShowBiodataViewerModal(false)}
        user={profile}
      />

      {/* Unlocked Contact Details Modal */}
      <ContactDetailsModal
        isOpen={showContactDetailsModal}
        onClose={() => setShowContactDetailsModal(false)}
        profile={profile}
        onCopy={handleCopyText}
        copiedField={copiedField}
      />

    </div>
  );
};

export default ProfileDetailPage;
