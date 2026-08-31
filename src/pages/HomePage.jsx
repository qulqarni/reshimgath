import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { PaithaniDivider } from '../components/common/PaithaniDivider';
import { 
  Heart, 
  ShieldCheck, 
  Search, 
  UserPlus, 
  Sparkles, 
  Lock, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  Star,
  Camera,
  ChevronLeft,
  ChevronRight,
  X,
  Images
} from 'lucide-react';

export const HomePage = ({ onNavigate }) => {
  const { isAuthenticated, loginAsDemo } = useAuth();
  const { t } = useLanguage();

  const [selectedStory, setSelectedStory] = React.useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = React.useState(0);

  const stories = [
    {
      id: 1,
      names: "Swara & Swapnil",
      location: "Pune & Kolhapur",
      quote: "“We connected on ReshimGath. Our families met in Pune for Poha & Chaitanya discussions. Everything fell into place beautifully!”",
      weddingDate: "December 2025 • Pune Mandap Ceremony",
      photos: [
        { url: "/story1.jpg", caption: "Swara & Swapnil in traditional green Nauvari Paithani saree & pheta turban" },
        { url: "/story1_2.jpg", caption: "Joyful Varmala garland ritual ceremony with family blessings" },
        { url: "/story3_2.jpg", caption: "Candid wedding ring exchange moment surrounded by relatives" }
      ]
    },
    {
      id: 2,
      names: "Pooja & Varun",
      location: "Sangli & Mumbai",
      quote: "“Finding a partner who understands both corporate ambitions and Maharashtrian cultural roots seemed tough until we joined ReshimGath.”",
      weddingDate: "November 2025 • Sangli Wedding Hall",
      photos: [
        { url: "/story2.jpg", caption: "Pooja & Varun laughing happily in yellow Paithani saree during mandap rituals" },
        { url: "/story2_2.jpg", caption: "Walking together holding hands amidst marigold flower path" },
        { url: "/story1.jpg", caption: "Auspicious Maharashtrian wedding couple portrait" }
      ]
    },
    {
      id: 3,
      names: "Dr. Radhika & Rohan",
      location: "Nashik & Satara",
      quote: "“Authentic verified profiles gave our parents absolute confidence. Today we are happily married for over 2 years!”",
      weddingDate: "February 2024 • Nashik Grand Reception",
      photos: [
        { url: "/story3.jpg", caption: "Dr. Radhika & Rohan at their fairy-lit evening reception in maroon Nauvari saree" },
        { url: "/story3_2.jpg", caption: "Auspicious wedding ring ritual ceremony" },
        { url: "/story1_2.jpg", caption: "Grand Varmala flower garland celebration" }
      ]
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      
      {/* HERO SECTION WITH FULL SCREEN HEIGHT BACKGROUND IMAGE */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)] py-12 sm:py-16 lg:py-20 bg-cover bg-center bg-no-repeat flex items-center" style={{ backgroundImage: `url('/hero-bg.jpg')` }}>
        
        {/* Crisp Color Gradient Overlay (100% legibility on mobile & desktop, image sharp) */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-plum/95 via-brand-plum/85 to-brand-plum/60 lg:to-brand-plum/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-plum/90 via-transparent to-black/30" />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Text Column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-8 text-center lg:text-left w-full max-w-full overflow-hidden">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-1.5 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shadow-md backdrop-blur-md max-w-full">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                <span className="truncate">{t('heroBadge')}</span>
              </div>

              {/* Headlines */}
              <div className="space-y-2 sm:space-y-4">
                <h1 className="font-serif text-2xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-snug sm:leading-tight drop-shadow-lg break-words">
                  {t('heroTitle')}
                </h1>
                <p className="font-serif-marathi text-xl sm:text-3xl lg:text-4xl text-brand-gold font-bold pt-0.5 drop-shadow-md break-words">
                  “{t('heroTitleMr')}”
                </p>
              </div>

              <p className="text-xs sm:text-base lg:text-lg text-gray-200 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow break-words">
                {t('heroSubtext')}
              </p>

              {/* Hero CTA Buttons */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 w-full">
                <button
                  onClick={() => onNavigate(isAuthenticated ? '/discover' : '/signup')}
                  className="w-[85%] sm:w-auto max-w-xs sm:max-w-none px-5 sm:px-8 py-2.5 sm:py-4 bg-gradient-to-r from-brand-kesari to-amber-600 text-white font-bold text-xs sm:text-base rounded-xl sm:rounded-2xl shadow-xl hover:scale-105 transition-all flex items-center justify-center space-x-2 border border-brand-gold/50"
                >
                  <Search className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white shrink-0" />
                  <span>{t('findMatchCTA')}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
                </button>

                {!isAuthenticated && (
                  <button
                    onClick={() => {
                      loginAsDemo();
                      onNavigate('/discover');
                    }}
                    className="w-[85%] sm:w-auto max-w-xs sm:max-w-none px-4 sm:px-6 py-2.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-md font-bold text-[11px] sm:text-sm rounded-xl sm:rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                    <span>{t('demoUserBtn')}</span>
                  </button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-5 sm:pt-8 border-t border-white/20 flex flex-col items-center justify-center space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4 text-center sm:text-left">
                <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-gray-100">{t('verifiedProfilesCount')}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-brand-rose fill-brand-rose shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-gray-100">{t('happyCouplesCount')}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 sm:space-x-2.5">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-brand-gold shrink-0" />
                  <span className="text-xs sm:text-xs font-semibold text-gray-100">Privacy Protected</span>
                </div>
              </div>

            </div>

            {/* Right Side Glassmorphic Feature Card (Hidden on mobile to optimize layout, visible on desktop) */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Decorative Blur Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-brand-gold via-brand-kesari to-brand-rose rounded-3xl opacity-30 blur-2xl transform rotate-2" />

                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 sm:p-8 space-y-6 text-white">
                  
                  <div className="space-y-2 border-b border-white/15 pb-4">
                    <span className="text-brand-gold text-xs font-bold uppercase tracking-wider">
                      ReshimGath Matrimony
                    </span>
                    <h3 className="font-serif-marathi text-2xl font-bold text-brand-gold">
                      ॥ शुभमंगल सावधान ॥
                    </h3>
                    <p className="text-xs text-gray-200 leading-relaxed">
                      Connecting verified Maharashtrian families across Pune, Mumbai, Kolhapur, Sangli, Satara, Solapur, Nashik, & worldwide.
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">100% Genuine & Trusted Profiles</p>
                        <p className="text-[11px] text-gray-300">Guaranteed authentic Maharashtrian profiles</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white">Biodata PDF</p>
                        <p className="text-[11px] text-gray-300">Detailed family background & PDF biodata sharing</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 bg-white/10 p-3 rounded-2xl border border-white/10">
                      <Lock className="w-5 h-5 text-brand-rose shrink-0" />
                      <div>
                        <p className="font-bold text-white">Strict Family Privacy Gate</p>
                        <p className="text-[11px] text-gray-300">Protected profile photos & contact details</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate(isAuthenticated ? '/discover' : '/signup')}
                    className="w-full py-3 bg-white text-brand-plum font-bold text-xs rounded-xl shadow-lg hover:bg-brand-gold transition-all text-center"
                  >
                    Browse Verified Matches
                  </button>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PAITHANI DIVIDER */}
      <PaithaniDivider />

      {/* SUCCESS STORIES SECTION */}
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
                
                <span className="absolute bottom-3 right-3 bg-black/75 text-brand-gold text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center space-x-1.5 shadow-lg border border-brand-gold/40 group-hover:scale-105 transition-all">
                  <Camera className="w-3.5 h-3.5 text-brand-gold shrink-0" />
                  <span>View {story.photos.length} Photos</span>
                </span>

                <span className="absolute top-3 left-3 bg-brand-plum/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-brand-gold/30">
                  {story.location}
                </span>
              </div>

              <div className="p-6 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-brand-plum group-hover:text-brand-kesari transition-colors">
                    {story.names} ({story.location})
                  </h3>
                  <p className="text-xs text-brand-gray leading-relaxed mt-1">
                    {story.quote}
                  </p>
                </div>
                <div className="pt-3 border-t border-brand-rose/10 flex items-center justify-between text-[11px] text-brand-kesari font-bold">
                  <span>Click to view album</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PERFECTLY CENTERED PHOTO LIGHTBOX MODAL */}
      {selectedStory && (
        <div 
          onClick={() => setSelectedStory(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
        >
          {/* Close Button Top Right */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedStory(null);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-all border border-white/20 shadow-2xl"
            title="Close Gallery"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Centered Gallery Content */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col items-center justify-center max-w-5xl w-full"
          >
            {/* Main Center Image */}
            <div className="relative flex items-center justify-center max-w-full">
              <img
                src={selectedStory.photos[activePhotoIdx].url}
                alt={selectedStory.names}
                className="max-h-[68vh] sm:max-h-[72vh] w-auto max-w-[85vw] object-contain rounded-2xl border border-white/10 shadow-2xl"
              />

              {/* Left Arrow */}
              {selectedStory.photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx((prev) => (prev === 0 ? selectedStory.photos.length - 1 : prev - 1));
                  }}
                  className="absolute left-2 sm:-left-16 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 text-white hover:bg-brand-plum flex items-center justify-center border border-white/20 hover:scale-110 shadow-2xl transition-all"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}

              {/* Right Arrow */}
              {selectedStory.photos.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx((prev) => (prev === selectedStory.photos.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-2 sm:-right-16 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/75 text-white hover:bg-brand-plum flex items-center justify-center border border-white/20 hover:scale-110 shadow-2xl transition-all"
                  title="Next Photo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>

            {/* Bottom Gallery Thumbnail Strip */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mt-5 pt-2 max-w-full overflow-x-auto px-2">
              {selectedStory.photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePhotoIdx(idx);
                  }}
                  className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activePhotoIdx === idx
                      ? 'border-amber-400 scale-105 shadow-2xl ring-2 ring-amber-400/50 opacity-100'
                      : 'border-white/25 opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src={photo.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* LIGHT ELEGANT WHY CHOOSE US SECTION */}
      <section className="bg-gradient-to-b from-brand-ivory via-brand-lightBg to-brand-ivory py-16 lg:py-20 border-y border-brand-rose/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-brand-kesari text-xs font-bold tracking-widest uppercase">
              Cultural Trust & Security
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-brand-plum">
              {t('whyChooseTitle')}
            </h2>
            <p className="text-sm text-brand-gray">
              {t('whyChooseSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            
            <div className="bg-white p-6 rounded-3xl border border-brand-rose/20 shadow-luxury hover:shadow-luxury-hover transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-brand-kesari flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-brand-kesari" />
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

    </div>
  );
};
