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
  Building2, 
  Users, 
  Sparkles, 
  MessageSquare, 
  Bookmark, 
  Check, 
  ArrowLeft,
  Calendar,
  Award,
  ShieldCheck,
  Compass,
  Star
} from 'lucide-react';

export const ProfileDetailPage = ({ profileId, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { profiles, interests, sendInterest, acceptInterest, declineInterest, toggleShortlist, recordProfileView } = useProfiles();

  const [activeTab, setActiveTab] = useState('about');

  const profile = profiles.find((p) => String(p.id) === String(profileId)) || profiles[0];

  React.useEffect(() => {
    if (profile) {
      recordProfileView(profile, user);
    }
  }, [profileId]);

  const isSent = interests.sent.includes(profile.id);
  const isAccepted = interests.accepted.includes(profile.id);
  const isDeclined = interests.declined.includes(profile.id);
  const isReceived = interests.received.some(r => r.profileId === profile.id);
  const isShortlisted = interests.shortlisted.includes(profile.id);

  const handleAction = () => {
    if (!isAuthenticated) {
      triggerPrivacyAlert();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back Button */}
      <button
        onClick={() => onNavigate('/discover')}
        className="flex items-center space-x-2 text-xs font-bold text-brand-plum hover:text-brand-kesari transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Discover Matches</span>
      </button>

      {/* Hero Header & Gallery Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Photo Gallery */}
        <div className="lg:col-span-5">
          <PhotoGallery photos={profile.photos} name={profile.name} />
        </div>

        {/* Right Column: Profile Summary & Action Box */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-6">
            
            {/* Header Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <h1 className="font-serif text-3xl font-bold text-brand-plum">{profile.name}</h1>
                  {profile.verified && <VerificationBadge size="small" />}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-brand-gray font-medium">
                  <span className="text-brand-plum font-bold">{profile.age} Years</span>
                  <span>•</span>
                  <span>{profile.height}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-kesari" />
                    {profile.district}, {profile.nativePlace || 'MH'}
                  </span>
                </div>
              </div>

              {/* Bookmark Button */}
              <button
                onClick={() => toggleShortlist(profile.id)}
                className={`p-3 rounded-2xl border transition-all ${
                  isShortlisted
                    ? 'bg-brand-plum text-brand-gold border-brand-gold shadow'
                    : 'bg-white text-brand-charcoal border-gray-200 hover:bg-brand-lightBg'
                }`}
                title={t('shortlist')}
              >
                <Bookmark className={`w-5 h-5 ${isShortlisted ? 'fill-brand-gold' : ''}`} />
              </button>
            </div>

            {/* Match Meter Box */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-kesari text-white flex items-center justify-center font-bold text-sm">
                  92%
                </div>
                <div>
                  <h4 className="font-serif font-bold text-xs text-amber-900">{t('matchCompatibility')}</h4>
                  <p className="text-[11px] text-amber-800">Matches your Pune location, Maratha/Brahmin preference & IT background</p>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-brand-kesari shrink-0" />
            </div>

            {/* Quick Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-brand-lightBg p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Caste / Community</span>
                <p className="font-bold text-brand-plum mt-0.5">{profile.caste}</p>
              </div>

              <div className="bg-brand-lightBg p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Education</span>
                <p className="font-bold text-brand-plum mt-0.5 truncate">{profile.education}</p>
              </div>

              <div className="bg-brand-lightBg p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Occupation</span>
                <p className="font-bold text-brand-plum mt-0.5 truncate">{profile.occupation}</p>
              </div>

              <div className="bg-brand-lightBg p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Native Place</span>
                <p className="font-bold text-brand-plum mt-0.5">{profile.nativePlace || 'Maharashtra'}</p>
              </div>

              <div className="bg-brand-lightBg p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Family Location</span>
                <p className="font-bold text-brand-plum mt-0.5">{profile.familyLocation || profile.district}</p>
              </div>

              <div className="bg-brand-lightBg p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray uppercase font-semibold">Income</span>
                <p className="font-bold text-brand-plum mt-0.5">{profile.income || 'Confidential'}</p>
              </div>
            </div>

            {/* Dynamic Relationship Action Bar */}
            <div className="pt-2">
              {isAccepted ? (
                <button
                  onClick={handleAction}
                  className="w-full py-4 bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5 text-brand-gold" />
                  <span>{t('sendMessage')} (Chat Active)</span>
                </button>
              ) : isReceived ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => acceptInterest(profile.id)}
                    className="flex-1 py-4 bg-brand-plum text-white font-bold text-sm rounded-2xl shadow-lg hover:bg-brand-plumDark transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
                  >
                    <Check className="w-5 h-5 text-brand-gold" />
                    <span>{t('acceptInterest')}</span>
                  </button>
                  <button
                    onClick={() => declineInterest(profile.id)}
                    className="py-4 px-6 bg-gray-100 text-gray-700 font-bold text-sm rounded-2xl hover:bg-rose-50 hover:text-rose-700 transition-all"
                  >
                    {t('declineInterest')}
                  </button>
                </div>
              ) : isSent ? (
                <div className="w-full py-3.5 bg-amber-50 text-amber-900 border border-amber-300 rounded-2xl font-bold text-xs text-center">
                  {t('interestSent')}
                </div>
              ) : (
                <button
                  onClick={handleAction}
                  className="w-full py-4 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
                >
                  <Heart className="w-5 h-5 text-brand-rose fill-brand-rose" />
                  <span>{t('sendInterest')}</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Tabs Navigation & Details Sections */}
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury overflow-hidden">
        
        {/* Navigation Bar */}
        <div className="flex items-center space-x-2 border-b border-gray-100 overflow-x-auto p-4 scrollbar-none bg-brand-lightBg/50">
          {[
            { id: 'about', label: t('aboutMe') },
            { id: 'education', label: t('educationCareer') },
            { id: 'family', label: t('familyDetails') },
            { id: 'lifestyle', label: t('lifestyleHabits') },
            { id: 'partner', label: t('partnerPreferences') }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-brand-plum text-white shadow-sm'
                  : 'text-brand-charcoal hover:bg-white hover:text-brand-plum'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-brand-plum">{t('aboutMe')}</h3>
                <p className="text-sm text-brand-gray leading-relaxed bg-brand-ivory p-4 rounded-2xl border border-brand-rose/10">
                  {profile.aboutMe}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray font-medium">Marital Status</span>
                  <span className="font-bold text-brand-plum">{profile.maritalStatus}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray font-medium">Mother Tongue</span>
                  <span className="font-bold text-brand-plum">{profile.motherTongue}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray font-medium">Native Place</span>
                  <span className="font-bold text-brand-plum">{profile.nativePlace || 'Satara'}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray font-medium">Blood Group</span>
                  <span className="font-bold text-brand-plum">{profile.bloodGroup || 'O+'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-brand-lightBg space-y-2">
                <div className="flex items-center space-x-2 text-brand-plum font-bold text-sm">
                  <GraduationCap className="w-5 h-5 text-brand-kesari" />
                  <span>{profile.education}</span>
                </div>
                <p className="text-brand-gray pl-7">College/University: <strong>{profile.college || 'COEP / Pune University'}</strong></p>
              </div>

              <div className="p-4 rounded-2xl bg-brand-lightBg space-y-2">
                <div className="flex items-center space-x-2 text-brand-plum font-bold text-sm">
                  <Briefcase className="w-5 h-5 text-brand-plum" />
                  <span>{profile.occupation}</span>
                </div>
                <p className="text-brand-gray pl-7">Employer: <strong>{profile.company}</strong></p>
                <p className="text-brand-gray pl-7">Annual Income: <strong>{profile.income}</strong></p>
              </div>
            </div>
          )}

          {activeTab === 'family' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                <span className="text-brand-gray">Father's Occupation</span>
                <p className="font-bold text-brand-plum text-sm">{profile.fatherOccupation}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                <span className="text-brand-gray">Mother's Occupation</span>
                <p className="font-bold text-brand-plum text-sm">{profile.motherOccupation}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                <span className="text-brand-gray">Siblings</span>
                <p className="font-bold text-brand-plum text-sm">{profile.siblings}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-50 space-y-1">
                <span className="text-brand-gray">Family Type</span>
                <p className="font-bold text-brand-plum text-sm">{profile.familyType}</p>
              </div>
            </div>
          )}

          {activeTab === 'lifestyle' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray">Diet</span>
                  <p className="font-bold text-brand-plum mt-0.5">{profile.diet}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray">Smoking</span>
                  <p className="font-bold text-brand-plum mt-0.5">{profile.smoking}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <span className="text-brand-gray">Drinking</span>
                  <p className="font-bold text-brand-plum mt-0.5">{profile.drinking}</p>
                </div>
              </div>

              <div>
                <h4 className="font-serif font-bold text-sm text-brand-plum mb-2">Hobbies & Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies?.map((h) => (
                    <span key={h} className="bg-brand-rose/20 text-brand-plum font-semibold px-3 py-1 rounded-full text-xs">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'partner' && (
            <div className="space-y-3 text-xs bg-amber-50/50 p-5 rounded-2xl border border-amber-200/60">
              <h4 className="font-serif font-bold text-sm text-amber-900 mb-2">Expected Partner Preferences</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>Age Preferred: <strong>{profile.partnerPref?.ageRange}</strong></div>
                <div>Height Preferred: <strong>{profile.partnerPref?.heightRange}</strong></div>
                <div>Districts: <strong>{profile.partnerPref?.districts?.join(', ')}</strong></div>
                <div>Community: <strong>{profile.partnerPref?.caste}</strong></div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Candidate Maharashtrian Biodata PDF Section */}
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
