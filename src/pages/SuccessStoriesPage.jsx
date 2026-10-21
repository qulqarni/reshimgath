import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Camera, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  ArrowRight,
  Share2,
  CheckCircle2
} from 'lucide-react';

export const SuccessStoriesPage = ({ onNavigate }) => {
  const { t, lang } = useLanguage();
  const { stories } = useProfiles();

  const [selectedStory, setSelectedStory] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Filter published stories only (or published !== false) and sort by display order
  const publishedStories = (stories || [])
    .filter((s) => s.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-brand-lightBg/40 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header / Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-rose/20 text-brand-plum text-xs font-bold border border-brand-rose/40">
            <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
            <span>{lang === 'en' ? 'Blessed Marriages & Happy Families' : 'आनंदी विवाह आणि समाधानी कुटुंबे'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-plum">
            {lang === 'en' ? 'Success Stories' : 'यशस्वी विवाह गाथा'}
          </h1>

          <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
            {lang === 'en'
              ? 'Witness the heartwarming journeys of couples who found their perfect life partners through Sambodhi Sarang Marriage Bureau. Every story is a testament to trust, tradition, and divine union.'
              : 'संबोधी सारंग वधूवर सूचक केंद्राच्या माध्यमातून विवाहबंधनात अडकलेल्या सुखी जोडप्यांच्या हृदयस्पर्शी गाथा. विश्वास, परंपरा आणि पवित्र बंधनांचे मूर्तिमंत रूप.'}
          </p>
        </div>

        {/* Stories Grid */}
        {publishedStories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-rose/20 shadow-luxury space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-brand-rose/20 text-brand-plum flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="font-serif font-bold text-lg text-brand-plum">
              {lang === 'en' ? 'No Stories Published Yet' : 'अद्याप कोणत्याही यशोगाथा प्रकाशित केलेल्या नाहीत'}
            </h3>
            <p className="text-xs text-brand-gray">
              {lang === 'en'
                ? 'Our team will soon publish verified success stories. Check back shortly!'
                : 'लवकरच नवीन यशस्वी विवाह गाथा येथे जोडल्या जातील.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedStories.map((story) => {
              const primaryPhoto = story.photos?.[0]?.url || '/story1.jpg';
              const photoCount = story.photos?.length || 1;

              return (
                <div
                  key={story.id}
                  onClick={() => {
                    setSelectedStory(story);
                    setActivePhotoIdx(0);
                  }}
                  className="bg-white rounded-3xl overflow-hidden shadow-luxury border border-brand-rose/20 hover:shadow-luxury-hover transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative h-64 overflow-hidden bg-brand-plum">
                    <img
                      src={primaryPhoto}
                      alt={story.names}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {story.location && (
                      <span className="absolute top-3 left-3 bg-brand-plum/90 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-brand-gold" />
                        <span>{story.location}</span>
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 bg-black/75 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center space-x-1.5 shadow-lg border border-white/20 group-hover:scale-105 transition-all">
                      <Camera className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                      <span>{photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}</span>
                    </span>
                  </div>

                  <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-serif font-bold text-xl text-brand-plum group-hover:text-rose-600 transition-colors">
                          {story.names}
                        </h3>
                        <Sparkles className="w-4 h-4 text-brand-gold" />
                      </div>

                      {story.weddingDate && (
                        <div className="flex items-center space-x-1.5 text-xs text-brand-kesari font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{story.weddingDate}</span>
                        </div>
                      )}

                      <p className="text-xs text-brand-gray leading-relaxed line-clamp-3 italic pt-1">
                        {story.quote || story.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-brand-rose/15 flex items-center justify-between text-xs text-brand-plum font-bold">
                      <span>{lang === 'en' ? 'View Wedding Album & Story' : 'संपूर्ण गाथा आणि फोटो पहा'}</span>
                      <ArrowRight className="w-4 h-4 text-brand-plum group-hover:translate-x-1.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Story Modal Detail View */}
        {selectedStory && (
          <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 flex items-center justify-center animate-fade-in">
            <div className="bg-white max-w-4xl w-full max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 text-white bg-black/60 hover:bg-black/90 rounded-full transition-colors backdrop-blur-sm"
                aria-label="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex-1 overflow-y-auto">
                {/* Photo Viewer Carousel */}
                <div className="relative h-72 sm:h-96 w-full bg-slate-950 flex items-center justify-center">
                  <img
                    src={selectedStory.photos?.[activePhotoIdx]?.url || '/story1.jpg'}
                    alt={selectedStory.names}
                    className="w-full h-full object-contain"
                  />

                  {selectedStory.photos?.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : selectedStory.photos.length - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all backdrop-blur-sm"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIdx((prev) => (prev < selectedStory.photos.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all backdrop-blur-sm"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>

                      {/* Photo indicator dots */}
                      <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-1.5">
                        {selectedStory.photos.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              idx === activePhotoIdx ? 'bg-amber-400 w-6' : 'bg-white/60'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Caption / Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 border-gray-100">
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
                        {selectedStory.names}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-brand-gray mt-1">
                        {selectedStory.location && (
                          <span className="flex items-center space-x-1 text-slate-700 font-semibold">
                            <MapPin className="w-3.5 h-3.5 text-brand-plum" />
                            <span>{selectedStory.location}</span>
                          </span>
                        )}
                        {selectedStory.weddingDate && (
                          <span className="flex items-center space-x-1 text-brand-kesari font-semibold">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{selectedStory.weddingDate}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Marriage</span>
                      </span>
                    </div>
                  </div>

                  {/* Photo Caption */}
                  {selectedStory.photos?.[activePhotoIdx]?.caption && (
                    <div className="p-3 bg-brand-lightBg rounded-xl text-xs text-brand-charcoal font-medium border border-brand-rose/20">
                      <strong>Photo {activePhotoIdx + 1}:</strong> {selectedStory.photos[activePhotoIdx].caption}
                    </div>
                  )}

                  {/* Story Description / Quote */}
                  <div className="bg-brand-rose/10 border-l-4 border-brand-plum p-5 rounded-2xl relative">
                    <Quote className="w-8 h-8 text-brand-plum/20 absolute top-3 right-3" />
                    <p className="text-sm sm:text-base text-brand-charcoal leading-relaxed italic relative z-10">
                      {selectedStory.quote}
                    </p>
                  </div>

                  {selectedStory.description && selectedStory.description !== selectedStory.quote && (
                    <div className="text-xs sm:text-sm text-brand-charcoal leading-relaxed space-y-2">
                      <h4 className="font-bold text-brand-plum text-sm">Their Matrimonial Journey:</h4>
                      <p className="whitespace-pre-line">{selectedStory.description}</p>
                    </div>
                  )}

                  {/* Thumbnail Row */}
                  {selectedStory.photos?.length > 1 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-brand-plum uppercase tracking-wider">Photo Album</h4>
                      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
                        {selectedStory.photos.map((ph, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActivePhotoIdx(idx)}
                            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                              idx === activePhotoIdx ? 'border-brand-plum ring-2 ring-brand-plum/30 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={ph.url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-brand-gray">
                      Find your perfect life partner today through Sambodhi Sarang.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedStory(null);
                        onNavigate('/signup');
                      }}
                      className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs rounded-xl shadow-md hover:bg-brand-plumDark transition-all"
                    >
                      Create Your Profile
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
