import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { PaithaniDivider } from '../components/common/PaithaniDivider';
import { ProfileCard } from '../components/discovery/ProfileCard';
import { MAHARASHTRA_DISTRICTS, MAHARASHTRA_COMMUNITIES, RELIGIONS, EDUCATION_LEVELS } from '../data/maharashtraData';
import { 
  Heart, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Lock, 
  Users, 
  Star,
  CheckCircle,
  FileText,
  MapPin,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

const AGE_OPTIONS = Array.from({ length: 53 }, (_, i) => 18 + i);

export const HomePage = ({ onNavigate }) => {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const { t } = useLanguage();
  const { profiles, homeContent, stories } = useProfiles();

  const [selectedStory, setSelectedStory] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedReligion, setSelectedReligion] = useState('All');
  const [selectedCaste, setSelectedCaste] = useState('All');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState('All');
  const [selectedEducation, setSelectedEducation] = useState('All');
  const [govtEmployeeFilter, setGovtEmployeeFilter] = useState('All');
  const [minAge, setMinAge] = useState('18');
  const [maxAge, setMaxAge] = useState('60');
  const [genderFilter, setGenderFilter] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showGuestAuthModal, setShowGuestAuthModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PROFILES_PER_PAGE = 12;

  const casteOptions = useMemo(() => {
    const list = [...MAHARASHTRA_COMMUNITIES];
    if (selectedCaste && selectedCaste !== 'All' && !list.includes(selectedCaste)) {
      list.unshift(selectedCaste);
    }
    return list;
  }, [selectedCaste]);

  const filteredProfiles = useMemo(() => {
    return (profiles || []).filter((p) => {
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
      if (user && user.gender === 'male') {
        if ((p.gender || '').toLowerCase().trim() !== 'female') return false;
      } else if (user && user.gender === 'female') {
        if ((p.gender || '').toLowerCase().trim() !== 'male') return false;
      } else if (genderFilter !== 'all') {
        const g = (p.gender || '').toLowerCase().trim();
        const targetG = genderFilter.toLowerCase().trim();
        if (g !== targetG) return false;
      }

      // 5. Marital Status Filter
      if (selectedMaritalStatus !== 'All') {
        const ms = (p.maritalStatus || '').toLowerCase().trim();
        const targetMS = selectedMaritalStatus.toLowerCase().trim();

        if (targetMS === 'unmarried') {
          if (ms && !ms.includes('unmarried') && !ms.includes('never married') && !ms.includes('single')) {
            return false;
          }
        } else if (targetMS === 'divorced') {
          if (!ms.includes('divorce')) return false;
        } else if (targetMS === 'widowed') {
          if (!ms.includes('widow')) return false;
        }
      }

      // 6. Age Range Filter
      const ageNum = parseInt(p.age, 10);
      if (!isNaN(ageNum)) {
        const minA = parseInt(minAge, 10);
        const maxA = parseInt(maxAge, 10);
        if (!isNaN(minA) && ageNum < minA) return false;
        if (!isNaN(maxA) && ageNum > maxA) return false;
      }

      // 7. District Filter
      if (selectedDistrict !== 'All') {
        const d = (p.district || '').toLowerCase().trim();
        const targetD = selectedDistrict.toLowerCase().trim();
        if (d !== targetD && !d.includes(targetD) && !targetD.includes(d)) return false;
      }

      // 8. Religion Filter
      if (selectedReligion !== 'All') {
        const r = (p.religion || '').toLowerCase().trim();
        const targetR = selectedReligion.toLowerCase().trim();
        if (targetR === 'buddhism' || targetR === 'buddhist' || targetR === 'bauddha') {
          if (!r.includes('buddh') && !r.includes('bauddha')) return false;
        } else if (!r.includes(targetR) && !targetR.includes(r)) {
          return false;
        }
      }

      // 9. Caste / Community Filter
      if (selectedCaste !== 'All') {
        const c = (p.caste || '').toLowerCase().trim();
        const targetC = selectedCaste.toLowerCase().trim();
        if (targetC === 'other') {
          const standardList = MAHARASHTRA_COMMUNITIES
            .filter((item) => item.toLowerCase().trim() !== 'other')
            .map((item) => item.toLowerCase().trim());

          const isStandardCaste = c && standardList.some((std) => {
            const baseStd = std.split(' ')[0].replace(/[^a-z]/g, '');
            const baseC = c.split(' ')[0].replace(/[^a-z]/g, '');
            return (
              c === std ||
              c.includes(std) ||
              std.includes(c) ||
              (baseStd.length >= 3 && c.includes(baseStd)) ||
              (baseC.length >= 3 && std.includes(baseC))
            );
          });
          if (isStandardCaste) return false;
        } else {
          const baseTarget = targetC.split(' ')[0].replace(/[^a-z]/g, '');
          if (!c.includes(targetC) && !c.includes(baseTarget)) return false;
        }
      }

      // 10. Education Filter
      if (selectedEducation !== 'All') {
        const edu = (p.education || '').toLowerCase().trim();
        const targetEdu = selectedEducation.toLowerCase().trim();
        const firstToken = targetEdu.split('/')[0].split(' ')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();

        if (targetEdu === 'other') {
          const isStandard = EDUCATION_LEVELS
            .filter((item) => item.toLowerCase().trim() !== 'other')
            .some((std) => {
              const stdToken = std.split('/')[0].split(' ')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
              return stdToken && edu.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(stdToken);
            });
          if (isStandard) return false;
        } else if (!edu.includes(targetEdu) && (firstToken.length >= 2 ? !edu.replace(/[^a-z0-9]/gi, '').toLowerCase().includes(firstToken) : true)) {
          return false;
        }
      }

      // 11. Government Employee Filter
      if (govtEmployeeFilter !== 'All') {
        const isGovtField = (p.isGovtEmployee || '').toLowerCase().trim() === 'yes';
        const occ = (p.occupation || '').toLowerCase();
        const isGovtOcc = occ.includes('govt') || occ.includes('government') || occ.includes('शासकीय') || occ.includes('सरकारी');
        const isGovt = isGovtField || isGovtOcc;

        if (govtEmployeeFilter === 'Yes' && !isGovt) return false;
        if (govtEmployeeFilter === 'No' && isGovt) return false;
      }

      // 12. Verified Only Filter
      if (verifiedOnly && !p.verified) return false;

      // 13. Search Query Text & Profile No.
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        const digitsQ = q.replace(/[^0-9]/g, '');

        const name = (p.name || '').toLowerCase();
        const dist = (p.district || '').toLowerCase();
        const edu = (p.education || '').toLowerCase();
        const occ = (p.occupation || '').toLowerCase();
        const caste = (p.caste || '').toLowerCase();
        const rel = (p.religion || '').toLowerCase();
        const regId = (p.regId || '').toLowerCase();
        const registrationId = String(p.registrationId || '').toLowerCase();
        const profileDigits = (regId + registrationId + String(p.id || '')).replace(/[^0-9]/g, '');

        const matchesQ =
          name.includes(q) ||
          dist.includes(q) ||
          edu.includes(q) ||
          occ.includes(q) ||
          caste.includes(q) ||
          rel.includes(q) ||
          regId.includes(q) ||
          registrationId.includes(q) ||
          (digitsQ.length > 0 && profileDigits.includes(digitsQ));

        if (!matchesQ) return false;
      }

      return true;
    });
  }, [profiles, user, genderFilter, selectedMaritalStatus, minAge, maxAge, selectedDistrict, selectedReligion, selectedCaste, selectedEducation, govtEmployeeFilter, verifiedOnly, searchQuery]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (genderFilter !== 'all') count++;
    if (selectedMaritalStatus !== 'All') count++;
    if (minAge !== '18' || maxAge !== '60') count++;
    if (selectedDistrict !== 'All') count++;
    if (selectedReligion !== 'All') count++;
    if (selectedCaste !== 'All') count++;
    if (selectedEducation !== 'All') count++;
    if (govtEmployeeFilter !== 'All') count++;
    if (verifiedOnly) count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [genderFilter, selectedMaritalStatus, minAge, maxAge, selectedDistrict, selectedReligion, selectedCaste, selectedEducation, govtEmployeeFilter, verifiedOnly, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDistrict, selectedReligion, selectedCaste, selectedMaritalStatus, selectedEducation, govtEmployeeFilter, minAge, maxAge, genderFilter, verifiedOnly]);

  const totalPages = Math.ceil(filteredProfiles.length / PROFILES_PER_PAGE) || 1;

  const paginatedProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * PROFILES_PER_PAGE;
    return filteredProfiles.slice(startIndex, startIndex + PROFILES_PER_PAGE);
  }, [filteredProfiles, currentPage]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedDistrict('All');
    setSelectedReligion('All');
    setSelectedCaste('All');
    setSelectedMaritalStatus('All');
    setSelectedEducation('All');
    setGovtEmployeeFilter('All');
    setMinAge('18');
    setMaxAge('60');
    setGenderFilter('all');
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (selectedStory || showMobileFilters || showGuestAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStory, showMobileFilters, showGuestAuthModal]);

  return (
    <div className="space-y-16 sm:space-y-24 pt-6 sm:pt-10 pb-12">
      
      {/* HERO SECTION WITH SHARP BACKGROUND IMAGE AND HIGH-CONTRAST TEXT (TEMPORARILY COMMENTED OUT) */}
      {/*
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] py-12 sm:py-16 lg:py-20 bg-cover bg-center bg-no-repeat flex items-center" style={{ backgroundImage: `url('/hero-bg.jpg')` }}>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-5 sm:space-y-8 text-center lg:text-left w-full max-w-full overflow-hidden">
              
              <div className="inline-flex items-center gap-1.5 bg-brand-plum/30 border border-brand-rose/50 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-md backdrop-blur-md max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-brand-rose shrink-0" />
                <span className="truncate">{homeContent.heroBadge || t('heroBadge')}</span>
              </div>

              <div className="space-y-2 sm:space-y-4">
                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-snug sm:leading-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] break-words">
                  {homeContent.heroTitle || t('heroTitle')}
                </h1>
                <p className="font-serif-marathi text-2xl sm:text-3xl lg:text-4xl text-amber-300 font-bold pt-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] break-words">
                  “{homeContent.heroTitleMr || t('heroTitleMr')}”
                </p>
              </div>

              <p className="text-xs sm:text-base lg:text-lg text-gray-100 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] break-words font-medium">
                {homeContent.heroSubtext || t('heroSubtext')}
              </p>

              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 w-full">
                <button
                  onClick={() => onNavigate(isAuthenticated ? '/discover' : '/signup')}
                  className="w-[85%] sm:w-auto max-w-xs sm:max-w-none px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-brand-plum to-rose-600 text-white font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2 border border-white/30"
                >
                  <Search className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white shrink-0" />
                  <span>{t('findMatchCTA')}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
                </button>
              </div>

              <div className="pt-5 sm:pt-8 border-t border-white/25 flex flex-col items-center justify-center space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 text-center sm:text-left">
                <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-white drop-shadow">{homeContent.verifiedProfilesCountText || t('verifiedProfilesCount')}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400 fill-rose-400 shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-white drop-shadow">{homeContent.happyCouplesCountText || t('happyCouplesCount')}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-white drop-shadow">{homeContent.privacyProtectedText || "Privacy Protected"}</span>
                </div>
              </div>

            </div>

            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/30 bg-white/10 backdrop-blur-md p-6 sm:p-8 space-y-6 text-white">
                  
                  <div className="space-y-2 border-b border-white/20 pb-4">
                    <span className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                      {homeContent.rightCardTitle || "Sambodhi Sarang Marriage Bureau"}
                    </span>
                    <h3 className="font-serif-marathi text-2xl font-bold text-white drop-shadow">
                      {homeContent.rightCardSubtitle || "॥ शुभमंगल सावधान ॥"}
                    </h3>
                    <p className="text-xs text-gray-100 leading-relaxed font-medium">
                      {homeContent.rightCardDesc || "Connecting verified families across Pune, Mumbai, Kolhapur, Sangli, Satara, Solapur, Nashik, Ichalkaranji & worldwide."}
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">100% Genuine & Trusted Profiles</p>
                        <p className="text-[11px] text-gray-200">Guaranteed authentic verified profiles</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                      <Star className="w-5 h-5 text-amber-300 fill-amber-300 shrink-0" />
                      <div>
                        <p className="font-bold text-white">Biodata PDF</p>
                        <p className="text-[11px] text-gray-200">Detailed family background & PDF biodata sharing</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-2xl border border-white/20">
                      <Lock className="w-5 h-5 text-rose-300 shrink-0" />
                      <div>
                        <p className="font-bold text-white">Strict Family Privacy Gate</p>
                        <p className="text-[11px] text-gray-200">Protected profile photos & contact details</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(isAuthenticated ? '/discover' : '/signup')}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-plum to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl hover:opacity-95 transition-all text-center border border-white/20"
                  >
                    Browse Verified Matches
                  </button>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <PaithaniDivider />
      */}

      {/* CANDIDATE PROFILES SECTION WITH SMART SEARCH & FILTER */}
      <section id="candidate-profiles-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header & Keyword Search Input */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-brand-rose/15 pb-4">
          <div>
            <div className="hidden sm:flex items-center flex-wrap gap-2.5">
              <div className="inline-flex items-center gap-1.5 bg-brand-plum/10 text-brand-plum px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-brand-kesari" />
                <span>Verified Matrimonial Profiles</span>
              </div>
              <span className="shrink-0 whitespace-nowrap text-xs font-sans px-3 py-1 rounded-full bg-brand-plum/10 text-brand-plum font-bold border border-brand-plum/20">
                {filteredProfiles.length} Candidates Found
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-plum mt-1">
              Find Your Perfect Alliance
            </h2>
            <p className="text-xs sm:text-sm text-brand-gray">
              Filter active verified profiles by gender, district, religion, caste, and age
            </p>
          </div>

          {/* Top Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, Profile No. (eg. 1001), district..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-brand-rose/20 bg-white text-xs shadow-sm focus:ring-2 focus:ring-brand-plum/20"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-brand-plum">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="w-full py-3.5 px-5 bg-brand-plum text-white font-bold text-sm rounded-2xl flex items-center justify-center space-x-2 shadow-luxury border border-brand-gold/40 hover:bg-brand-plumDark transition-all"
          >
            <Filter className="w-4 h-4 text-brand-gold" />
            <span>Filter</span>
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-2 py-0.5 bg-brand-kesari text-white text-[10px] font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* SMART PROFILE FILTER PANEL (DESKTOP VIEW ONLY) */}
        <div className="hidden md:block bg-white rounded-3xl p-4 sm:p-6 border border-brand-rose/20 shadow-luxury space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 gap-2">
            <div className="flex items-center space-x-2 min-w-0">
              <SlidersHorizontal className="w-4 h-4 text-brand-plum shrink-0" />
              <h3 className="font-serif font-bold text-xs sm:text-sm text-brand-plum uppercase tracking-wider truncate sm:whitespace-nowrap">
                Search & Filter Candidates
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
            
            {/* 1. Gender */}
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Gender / वधू-वर</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                <option value="all">All Genders</option>
                <option value="female">Brides (वधू / Female)</option>
                <option value="male">Grooms (वर / Male)</option>
              </select>
            </div>

            {/* 2. Marital Status */}
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Marital Status / वैवाहिक स्थिती</label>
              <select
                value={selectedMaritalStatus}
                onChange={(e) => setSelectedMaritalStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                <option value="All">All Marital Statuses</option>
                <option value="Unmarried">Unmarried (अविवाहित)</option>
                <option value="Divorced">Divorced (घटस्फोटित)</option>
                <option value="Widowed">Widowed (विधवा/विधुर)</option>
              </select>
            </div>

            {/* 3. Age Range (From Age to To Age) */}
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Age Range / वय (From - To)</label>
              <div className="grid grid-cols-2 gap-1.5">
                <select
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
                >
                  {AGE_OPTIONS.map((a) => (
                    <option key={`from-${a}`} value={a}>{a}</option>
                  ))}
                </select>
                <select
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
                >
                  {AGE_OPTIONS.map((a) => (
                    <option key={`to-${a}`} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. District */}
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

            {/* 5. Religion */}
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

            {/* 6. Caste / Community */}
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Caste / जात-समाज</label>
              <select
                value={selectedCaste}
                onChange={(e) => setSelectedCaste(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                <option value="All">All Communities / Castes</option>
                {casteOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* 7. Education */}
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Education / शिक्षण</label>
              <select
                value={selectedEducation}
                onChange={(e) => setSelectedEducation(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                <option value="All">All Education Backgrounds</option>
                {EDUCATION_LEVELS.map((edu) => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>

            {/* 8. Government Employee */}
            <div>
              <label className="block text-[11px] text-gray-500 mb-1">Govt Employee / शासकीय कर्मचारी</label>
              <select
                value={govtEmployeeFilter}
                onChange={(e) => setGovtEmployeeFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-plum/20 text-xs font-semibold text-brand-charcoal bg-gray-50/50"
              >
                <option value="All">All (सर्व)</option>
                <option value="Yes">Yes (होय)</option>
                <option value="No">No (नाही)</option>
              </select>
            </div>

          </div>

          {/* Bottom Checkbox Option */}
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

            {activeFiltersCount > 0 && (
              <span className="text-[11px] text-gray-500 italic">
                Showing candidates matching active filters
              </span>
            )}
          </div>
        </div>

        {/* Filtered Profiles Cards Display */}
        {filteredProfiles.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-brand-rose/20 text-center space-y-4 shadow-luxury">
            <div className="w-14 h-14 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center mx-auto">
              <Filter className="w-7 h-7 text-brand-plum/50" />
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProfiles.map((profile) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  onSelect={(id, action) => {
                    if (!isAuthenticated) {
                      setShowGuestAuthModal(true);
                      return;
                    }
                    if (action === 'chat') {
                      onNavigate('/messages');
                    } else {
                      onNavigate(`/profile/${profile.id}`);
                    }
                  }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-brand-rose/15">
                <div className="text-xs text-brand-gray font-medium">
                  Showing <span className="font-bold text-brand-plum">{(currentPage - 1) * PROFILES_PER_PAGE + 1}</span> to{' '}
                  <span className="font-bold text-brand-plum">{Math.min(currentPage * PROFILES_PER_PAGE, filteredProfiles.length)}</span> of{' '}
                  <span className="font-bold text-brand-plum">{filteredProfiles.length}</span> Candidates
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage((prev) => prev - 1);
                        document.getElementById('candidate-profiles-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-brand-plum border-brand-plum/20 hover:bg-brand-plum hover:text-white shadow-sm'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  <div className="flex items-center space-x-1.5 px-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          document.getElementById('candidate-profiles-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-brand-plum text-white shadow-luxury font-black border border-brand-gold/40'
                            : 'bg-white text-brand-plum border border-brand-rose/20 hover:bg-brand-plum/10'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage((prev) => prev + 1);
                        document.getElementById('candidate-profiles-section')?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 border transition-all ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        : 'bg-white text-brand-plum border-brand-plum/20 hover:bg-brand-plum hover:text-white shadow-sm'
                    }`}
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => onNavigate('/discover')}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-gradient-to-r from-brand-plum via-brand-plumDark to-brand-plum text-white font-bold text-xs sm:text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all duration-300 border border-brand-gold/40 group"
          >
            <span>See More Profiles on Discover Page</span>
            <ArrowRight className="w-4 h-4 text-brand-gold group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* SUCCESS STORIES SECTION (TEMPORARILY COMMENTED OUT) */}
      {false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum">
              {t('successStoriesTitle')}
            </h2>
            <p className="text-sm text-brand-gray">
              {t('successStoriesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {stories.map((story) => (
              <div 
                key={story.id}
                onClick={() => {
                  setSelectedStory(story);
                  setActivePhotoIdx(0);
                }}
                className="bg-white rounded-3xl overflow-hidden shadow-luxury border border-brand-rose/20 hover:shadow-luxury-hover transition-all cursor-pointer group relative flex flex-col justify-between"
              >
                <div className="relative h-64 overflow-hidden bg-brand-plum">
                  <img
                    src={story.photos[0].url}
                    alt={story.names}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-all" />
                  
                  <span className="absolute bottom-3 right-3 bg-black/75 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center space-x-1.5 shadow-lg border border-white/20 group-hover:scale-105 transition-all">
                    <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>View {story.photos.length} Photos</span>
                  </span>

                  <span className="absolute top-3 left-3 bg-brand-plum/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20">
                    {story.location}
                  </span>
                </div>

                <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-brand-plum group-hover:text-rose-600 transition-colors">
                      {story.names} ({story.location})
                    </h3>
                    <p className="text-xs text-brand-gray leading-relaxed mt-1">
                      {story.quote}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-brand-rose/10 flex items-center justify-between text-[11px] text-brand-plum font-bold">
                    <span>Click to view album</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* WHY CHOOSE / WHY FAMILIES TRUST SAMBODHI SARANG SECTION (TEMPORARILY COMMENTED OUT) */}
      {false && (
        <section className="bg-brand-ivory/80 py-16 border-y border-brand-rose/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum">
                {t('whyChooseTitle')}
              </h2>
              <p className="text-sm text-brand-gray">
                {t('whyChooseSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-plum">{t('feature1Title')}</h3>
                <p className="text-xs text-brand-gray leading-relaxed">{t('feature1Desc')}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-rose/20 text-brand-plum flex items-center justify-center">
                  <Lock className="w-6 h-6 text-brand-plum" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-plum">{t('feature2Title')}</h3>
                <p className="text-xs text-brand-gray leading-relaxed">{t('feature2Desc')}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-plum/10 text-brand-plum flex items-center justify-center">
                  <Users className="w-6 h-6 text-brand-plum" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-plum">{t('feature3Title')}</h3>
                <p className="text-xs text-brand-gray leading-relaxed">{t('feature3Desc')}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-600 fill-amber-500" />
                </div>
                <h3 className="font-serif text-lg font-bold text-brand-plum">{t('feature4Title')}</h3>
                <p className="text-xs text-brand-gray leading-relaxed">{t('feature4Desc')}</p>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* LIGHT WARM CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="bg-gradient-to-r from-amber-50 via-rose-50/70 to-amber-50 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl border-2 border-amber-200/80 relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-brand-plum">
              {t('ctaTitle')}
            </h2>
            <p className="text-sm text-brand-gray max-w-xl mx-auto">
              {t('ctaSubtitle')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate(isAuthenticated ? '/discover' : '/signup')}
              className="px-8 py-3.5 bg-brand-plum text-white font-bold rounded-2xl hover:bg-brand-plumDark transition-all shadow-lg text-sm border border-brand-gold/40"
            >
              {t('createProfileCTA')}
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="px-8 py-3.5 bg-white text-brand-plum font-bold rounded-2xl hover:bg-brand-ivory transition-all text-sm border border-brand-plum/30 shadow-sm"
            >
              {t('contactUs')}
            </button>
          </div>
        </div>
      </section>
      {/* Mobile Filter Modal Sheet */}
      {showMobileFilters && createPortal(
        <div className="md:hidden fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/80 backdrop-blur-md flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-6 space-y-5 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-lg text-brand-plum">Filter Candidates</h3>
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
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Gender / वधू-वर</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="all">All Genders</option>
                  <option value="female">Brides (वधू / Female)</option>
                  <option value="male">Grooms (वर / Male)</option>
                </select>
              </div>

              {/* Marital Status */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Marital Status / वैवाहिक स्थिती</label>
                <select
                  value={selectedMaritalStatus}
                  onChange={(e) => setSelectedMaritalStatus(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Marital Statuses</option>
                  <option value="Unmarried">Unmarried (अविवाहित)</option>
                  <option value="Divorced">Divorced (घटस्फोटित)</option>
                  <option value="Widowed">Widowed (विधवा/विधुर)</option>
                </select>
              </div>

              {/* Age Range */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Age Range / वय (From - To)</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={`m-hm-from-${a}`} value={a}>{a}</option>
                    ))}
                  </select>
                  <select
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                  >
                    {AGE_OPTIONS.map((a) => (
                      <option key={`m-hm-to-${a}`} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
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
                  {casteOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Education */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Education / शिक्षण</label>
                <select
                  value={selectedEducation}
                  onChange={(e) => setSelectedEducation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All Education Backgrounds</option>
                  {EDUCATION_LEVELS.map((edu) => (
                    <option key={edu} value={edu}>{edu}</option>
                  ))}
                </select>
              </div>

              {/* Government Employee */}
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">Government Employee / शासकीय कर्मचारी</label>
                <select
                  value={govtEmployeeFilter}
                  onChange={(e) => setGovtEmployeeFilter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs"
                >
                  <option value="All">All (सर्व)</option>
                  <option value="Yes">Yes (होय)</option>
                  <option value="No">No (नाही)</option>
                </select>
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
        </div>,
        document.body
      )}

      {/* Guest Access Modal for Non-Logged-In Users */}
      {showGuestAuthModal && createPortal(
        <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative text-center border border-brand-rose/20 animate-in zoom-in-95 duration-200">
            
            <button
              onClick={() => setShowGuestAuthModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-brand-plum p-1.5 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center mx-auto border-2 border-brand-plum/20 shadow-inner">
              <Lock className="w-8 h-8 text-brand-plum" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif font-bold text-2xl text-brand-plum">
                Access Candidate Profile
              </h3>
              <p className="text-xs text-brand-gray leading-relaxed px-2">
                Create an Account or Log In and Buy a Subscription to access full profile details, view verified contact information, and connect with candidates.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowGuestAuthModal(false);
                  onNavigate('/signup');
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all border border-brand-gold/30 flex items-center justify-center space-x-2"
              >
                <span>Create an Account / Sign Up</span>
              </button>

              <button
                onClick={() => {
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

    </div>
  );
};
