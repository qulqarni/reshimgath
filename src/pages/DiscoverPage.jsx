import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { ProfileCard } from '../components/discovery/ProfileCard';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, RELIGIONS } from '../data/maharashtraData';
import { Search, Filter, ShieldCheck, X, Lock, RotateCcw, SlidersHorizontal } from 'lucide-react';

const AGE_OPTIONS = Array.from({ length: 53 }, (_, i) => 18 + i);

export const DiscoverPage = ({ onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { profiles } = useProfiles();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedReligion, setSelectedReligion] = useState('All');
  const [selectedCaste, setSelectedCaste] = useState('All');
  const [minAge, setMinAge] = useState('18');
  const [maxAge, setMaxAge] = useState('60');
  const [genderFilter, setGenderFilter] = useState(() => {
    if (user && user.gender === 'male') return 'female';
    if (user && user.gender === 'female') return 'male';
    return 'all';
  });
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const defaultGender = useMemo(() => {
    if (user && user.gender === 'male') return 'female';
    if (user && user.gender === 'female') return 'male';
    return 'all';
  }, [user]);

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

      // 3. Exclude Blocked profiles
      if (p.blocked) {
        return false;
      }

      // 4. Gender Filter
      if (genderFilter !== 'all') {
        const g = (p.gender || '').toLowerCase().trim();
        const targetG = genderFilter.toLowerCase().trim();
        if (g !== targetG) return false;
      }

      // 5. District Filter
      if (selectedDistrict !== 'All') {
        const d = (p.district || '').toLowerCase().trim();
        const targetD = selectedDistrict.toLowerCase().trim();
        if (d !== targetD && !d.includes(targetD) && !targetD.includes(d)) return false;
      }

      // 6. Religion Filter
      if (selectedReligion !== 'All') {
        const r = (p.religion || '').toLowerCase().trim();
        const targetR = selectedReligion.toLowerCase().trim();
        if (targetR === 'buddhism' || targetR === 'bauddha') {
          if (!r.includes('buddh') && !r.includes('bauddha')) return false;
        } else if (!r.includes(targetR) && !targetR.includes(r)) {
          return false;
        }
      }

      // 7. Caste / Community Filter
      if (selectedCaste !== 'All') {
        const c = (p.caste || '').toLowerCase().trim();
        const targetC = selectedCaste.toLowerCase().trim();
        const baseTarget = targetC.split(' ')[0].replace(/[^a-z]/g, '');
        if (!c.includes(targetC) && !c.includes(baseTarget)) return false;
      }

      // 8. Age Range Filter
      const ageNum = parseInt(p.age, 10);
      if (!isNaN(ageNum)) {
        const minA = parseInt(minAge, 10);
        const maxA = parseInt(maxAge, 10);
        if (!isNaN(minA) && ageNum < minA) return false;
        if (!isNaN(maxA) && ageNum > maxA) return false;
      }

      // 9. Verified Only Filter
      if (verifiedOnly && !p.verified) return false;

      // 10. Search Query Text
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const name = (p.name || '').toLowerCase();
        const dist = (p.district || '').toLowerCase();
        const edu = (p.education || '').toLowerCase();
        const occ = (p.occupation || '').toLowerCase();
        const caste = (p.caste || '').toLowerCase();
        const rel = (p.religion || '').toLowerCase();
        const regId = (p.regId || '').toLowerCase();
        const registrationId = String(p.registrationId || '').toLowerCase();

        const matchesQ =
          name.includes(q) ||
          dist.includes(q) ||
          edu.includes(q) ||
          occ.includes(q) ||
          caste.includes(q) ||
          rel.includes(q) ||
          regId.includes(q) ||
          registrationId.includes(q);

        if (!matchesQ) return false;
      }

      return true;
    });
  }, [profiles, user, genderFilter, selectedDistrict, selectedReligion, selectedCaste, minAge, maxAge, verifiedOnly, searchQuery]);

  const handleReset = () => {
    setSelectedDistrict('All');
    setSelectedReligion('All');
    setSelectedCaste('All');
    setMinAge('18');
    setMaxAge('60');
    setGenderFilter(defaultGender);
    setVerifiedOnly(false);
    setSearchQuery('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== defaultGender && genderFilter !== 'all') count++;
    if (selectedDistrict !== 'All') count++;
    if (selectedReligion !== 'All') count++;
    if (selectedCaste !== 'All') count++;
    if (minAge !== '18' || maxAge !== '60') count++;
    if (verifiedOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [genderFilter, defaultGender, selectedDistrict, selectedReligion, selectedCaste, minAge, maxAge, verifiedOnly, searchQuery]);

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
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-brand-plum tracking-tight leading-snug">
              {t('discoverTitle')}
            </h1>
            <span className="shrink-0 whitespace-nowrap text-xs font-sans px-3 py-1 rounded-full bg-brand-plum/10 text-brand-plum font-bold border border-brand-plum/20">
              {filteredProfiles.length} Candidates
            </span>
          </div>
          <p className="text-xs text-brand-gray mt-1 leading-relaxed">
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
            placeholder="Search candidate name, caste, district..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-rose/20 bg-white text-xs shadow-sm focus:ring-2 focus:ring-brand-plum/20"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-brand-plum">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* TOP REDESIGNED HORIZONTAL FILTER PANEL */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-brand-rose/20 shadow-luxury space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 gap-2">
          <div className="flex items-center space-x-2 min-w-0">
            <SlidersHorizontal className="w-4 h-4 text-brand-plum shrink-0" />
            <h3 className="font-serif font-bold text-xs sm:text-sm text-brand-plum uppercase tracking-wider truncate sm:whitespace-nowrap">
              Smart Profile Filters
            </h3>
            {activeFiltersCount > 0 && (
              <span className="shrink-0 whitespace-nowrap px-2.5 py-0.5 bg-brand-plum text-white text-[10px] font-bold rounded-full">
                {activeFiltersCount} Active
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleReset}
              className="shrink-0 whitespace-nowrap text-xs font-semibold text-brand-kesari hover:underline flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3 shrink-0" />
              <span className="whitespace-nowrap">Reset All</span>
            </button>
          )}
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs font-semibold">
          
          {/* 1. Gender */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Gender / वधू-वर</label>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
            >
              <option value="female">Brides (वधू / Female)</option>
              <option value="male">Grooms (वर / Male)</option>
              <option value="all">All Genders</option>
            </select>
          </div>

          {/* 2. District */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">District / जिल्हा</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
            >
              <option value="All">All Maharashtra Districts</option>
              <option value="Ichalkaranji">Ichalkaranji</option>
              {MAHARASHTRA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 3. Religion */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Religion / धर्म</label>
            <select
              value={selectedReligion}
              onChange={(e) => setSelectedReligion(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
            >
              <option value="All">All Religions</option>
              {RELIGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* 4. Caste / Community */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Caste / जात-समाज</label>
            <select
              value={selectedCaste}
              onChange={(e) => setSelectedCaste(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
            >
              <option value="All">All Communities / Castes</option>
              {MAHARASHTRA_COMMUNITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 5. Age Range */}
          <div>
            <label className="block text-[11px] text-gray-500 mb-1">Age Range (वय)</label>
            <div className="grid grid-cols-2 gap-1.5">
              <select
                value={minAge}
                onChange={(e) => setMinAge(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                {AGE_OPTIONS.map((a) => (
                  <option key={`min-${a}`} value={a}>Min {a}y</option>
                ))}
              </select>
              <select
                value={maxAge}
                onChange={(e) => setMaxAge(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                {AGE_OPTIONS.map((a) => (
                  <option key={`max-${a}`} value={a}>Max {a}y</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Bottom Options Row */}
        <div className="flex flex-wrap items-center justify-between pt-2 gap-3 border-t border-gray-100 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Show 100% Verified Profiles Only</span>
          </label>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden px-4 py-2 bg-brand-plum text-white font-bold rounded-xl flex items-center space-x-1.5 shadow"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Mobile Filters ({activeFiltersCount})</span>
          </button>
        </div>
      </div>

      {/* Main Profile Grid Display */}
      <main className="space-y-6">
        
        {filteredProfiles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center space-y-4 shadow-luxury">
            <div className="w-16 h-16 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center mx-auto">
              <Filter className="w-8 h-8 text-brand-plum/50" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif font-bold text-lg text-brand-plum">No Matching Candidates Found</h3>
              <p className="text-xs text-brand-gray">
                Try relaxing your age range, district, or caste filters to view more candidate profiles.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow hover:bg-brand-plumDark transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

            <div className="space-y-4 text-xs font-semibold">
              {/* Gender */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Looking For (Gender)</label>
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

              {/* District */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">District / जिल्हा</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Maharashtra Districts</option>
                  <option value="Ichalkaranji">Ichalkaranji</option>
                  {MAHARASHTRA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Religion */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Religion / धर्म</label>
                <select
                  value={selectedReligion}
                  onChange={(e) => setSelectedReligion(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Religions</option>
                  {RELIGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Caste */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Caste / जात-समाज</label>
                <select
                  value={selectedCaste}
                  onChange={(e) => setSelectedCaste(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Communities / Castes</option>
                  {MAHARASHTRA_COMMUNITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Age Range (वय)</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={`m-min-${a}`} value={a}>Min {a}y</option>
                    ))}
                  </select>
                  <select
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={`m-max-${a}`} value={a}>Max {a}y</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Verified Only */}
              <div className="pt-2">
                <label className="flex items-center space-x-2.5 text-xs font-semibold text-brand-charcoal cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-brand-plum focus:ring-brand-plum w-4 h-4"
                  />
                  <span>Show 100% Verified Profiles Only</span>
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
