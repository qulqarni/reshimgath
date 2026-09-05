import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { ProfileCard } from '../components/discovery/ProfileCard';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES } from '../data/maharashtraData';
import { Search, Filter, ShieldCheck, X, Sparkles, Lock, ArrowRight } from 'lucide-react';

export const DiscoverPage = ({ onNavigate }) => {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const { t } = useLanguage();
  const { profiles } = useProfiles();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedCaste, setSelectedCaste] = useState('All');
  const [genderFilter, setGenderFilter] = useState(() => {
    if (user && user.gender === 'male') return 'female';
    if (user && user.gender === 'female') return 'male';
    return 'all';
  });
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      // 1. Exclude logged-in user's own profile
      if (user && (String(p.id) === String(user.id) || (user.email && p.email === user.email))) {
        return false;
      }

      // 2. Exclude Admin profiles
      if (p.isAdmin || p.role === 'admin' || p.id === 'admin_1' || (p.email && p.email.includes('admin'))) {
        return false;
      }

      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      if (selectedDistrict !== 'All' && p.district !== selectedDistrict) return false;
      if (selectedCaste !== 'All' && !p.caste.includes(selectedCaste)) return false;
      if (verifiedOnly && !p.verified) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.district?.toLowerCase().includes(q) ||
          p.education?.toLowerCase().includes(q) ||
          p.occupation?.toLowerCase().includes(q) ||
          (p.regId && p.regId.toLowerCase().includes(q)) ||
          (p.registrationId && String(p.registrationId).includes(q))
        );
      }
      return true;
    });
  }, [profiles, user, genderFilter, selectedDistrict, selectedCaste, verifiedOnly, searchQuery]);

  const handleReset = () => {
    setSelectedDistrict('All');
    setSelectedCaste('All');
    setGenderFilter('female');
    setVerifiedOnly(false);
    setSearchQuery('');
  };

  // Privacy Protection Enforcement for Non-Logged-In Users
  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-rose/20 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-brand-plum" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
              {t('privacyAlertTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
              {t('privacyAlertDesc')}
            </p>
          </div>

          <div className="flex justify-center pt-4 max-w-xs mx-auto">
            <button
              onClick={() => onNavigate('/login')}
              className="w-full py-3.5 px-6 bg-brand-plum text-white font-bold text-sm rounded-2xl shadow-xl hover:bg-brand-plumDark transition-all"
            >
              Login / Register to Discover Profiles
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Search & Header Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            {t('discoverTitle')}
          </h1>
          <p className="text-xs text-brand-gray mt-1">
            {t('discoverSubtitle')}
          </p>
        </div>

        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by candidate name, education, occupation..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-rose/20 bg-white text-xs shadow-sm focus:ring-2 focus:ring-brand-plum/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Pill Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-brand-plum text-white rounded-xl shadow shrink-0"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters</span>
        </button>

        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full border transition-all shrink-0 ${
            verifiedOnly
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
              : 'bg-white text-brand-charcoal border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Verified</span>
        </button>

        {(selectedDistrict !== 'All' || selectedCaste !== 'All' || verifiedOnly || searchQuery) && (
          <button
            onClick={handleReset}
            className="text-brand-plum underline hover:text-brand-kesari text-xs px-2 shrink-0"
          >
            {t('resetFilters')}
          </button>
        )}
      </div>

      {/* Main Grid Layout with Desktop Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury h-fit">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-serif font-bold text-base text-brand-plum">{t('filterTitle')}</h3>
            <button onClick={handleReset} className="text-xs text-brand-kesari font-semibold hover:underline">
              Reset
            </button>
          </div>

          <div className="space-y-4">
            {/* Gender Filter */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Looking For</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
              >
                <option value="female">Brides (वधू)</option>
                <option value="male">Grooms (वर)</option>
                <option value="all">All Profiles</option>
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">{t('filterDistrict')}</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
              >
                <option value="All">All Maharashtra Districts</option>
                {MAHARASHTRA_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Caste Filter */}
            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">{t('filterCaste')}</label>
              <select
                value={selectedCaste}
                onChange={(e) => setSelectedCaste(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
              >
                <option value="All">All Communities</option>
                {MAHARASHTRA_COMMUNITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Verified Only Checkbox */}
            <div className="pt-2 border-t border-gray-100">
              <label className="flex items-center space-x-2 text-xs font-semibold text-brand-charcoal cursor-pointer">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  className="rounded text-brand-plum focus:ring-brand-plum"
                />
                <span>{t('verifiedOnly')}</span>
              </label>
            </div>

          </div>
        </aside>

        {/* Profile Grid Cards Display */}
        <main className="lg:col-span-9 space-y-6">
          
          {filteredProfiles.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center space-y-4">
              <p className="text-sm font-semibold text-brand-gray">{t('noMatchesFound')}</p>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
              >
                {t('resetFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
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
          )}

        </main>
      </div>

      {/* Mobile Filter Modal Sheet */}
      {showMobileFilters && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-brand-plum">{t('filterTitle')}</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full text-gray-400 hover:text-brand-plum"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Looking For</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="female">Brides (वधू)</option>
                  <option value="male">Grooms (वर)</option>
                  <option value="all">All Profiles</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">{t('filterDistrict')}</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Maharashtra Districts</option>
                  {MAHARASHTRA_DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">{t('filterCaste')}</label>
                <select
                  value={selectedCaste}
                  onChange={(e) => setSelectedCaste(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Communities</option>
                  {MAHARASHTRA_COMMUNITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center space-x-2.5 text-xs font-semibold text-brand-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-brand-plum focus:ring-brand-plum w-4 h-4"
                  />
                  <span>{t('verifiedOnly')}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-gray-100 text-brand-charcoal font-bold text-xs rounded-xl"
              >
                Reset
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 py-3 bg-brand-plum text-white font-bold text-xs rounded-xl shadow"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
