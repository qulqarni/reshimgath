import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  Images, 
  Play, 
  X, 
  ZoomIn, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Camera,
  Film
} from 'lucide-react';

export const GalleryPage = () => {
  const { lang } = useLanguage();
  const { gallery } = useProfiles();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeMediaItem, setActiveMediaItem] = useState(null);

  // Published gallery items
  const publishedItems = (gallery || [])
    .filter((g) => g.published !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  // Extract categories dynamically
  const categories = ['All', ...new Set(publishedItems.map((item) => item.category || 'General'))];

  const filteredItems = publishedItems.filter((item) => {
    if (selectedCategory === 'All') return true;
    return (item.category || 'General') === selectedCategory;
  });

  return (
    <div className="min-h-screen bg-brand-lightBg/40 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-brand-rose/20 text-brand-plum text-xs font-bold border border-brand-rose/40">
            <Images className="w-3.5 h-3.5 text-brand-plum" />
            <span>{lang === 'en' ? 'Photo & Video Moments' : 'फोटो व व्हिडिओ गॅलरी'}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-plum">
            {lang === 'en' ? 'Sambodhi Sarang Gallery' : 'गॅलरी आणि स्मृतीचित्रे'}
          </h1>

          <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
            {lang === 'en'
              ? 'Explore memorable glimpses from our matrimonial Melawas, family celebrations, auspicious weddings, and bureau office moments.'
              : 'वधू-वर मेळावे, विवाह सोहळे आणि संबोधी सारंग केंद्राच्या विविध उपक्रमांची छायाचित्रे व व्हिडिओ.'}
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-brand-plum text-white shadow-md'
                    : 'bg-white text-brand-charcoal hover:bg-brand-lightBg border border-brand-rose/20'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-brand-rose/20 shadow-luxury space-y-3">
            <Images className="w-12 h-12 text-brand-rose mx-auto" />
            <h3 className="font-serif font-bold text-lg text-brand-plum">No Media in this Category</h3>
            <p className="text-xs text-brand-gray">New photographs and videos will be published soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => setActiveMediaItem(item)}
                className="bg-white rounded-3xl overflow-hidden shadow-luxury border border-brand-rose/20 hover:shadow-luxury-hover transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Media Thumbnail */}
                <div className="relative h-60 w-full overflow-hidden bg-brand-plum">
                  {item.type === 'video' ? (
                    <div className="w-full h-full bg-slate-950 flex items-center justify-center relative">
                      <video src={item.url} className="w-full h-full object-cover opacity-60" />
                      <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform absolute">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                      <span className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <Film className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ) : (
                    <>
                      <img
                        src={item.url}
                        alt={item.title || 'Gallery image'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-brand-plum flex items-center justify-center shadow-lg">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>
                      <span className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm">
                        <Camera className="w-3.5 h-3.5" />
                      </span>
                    </>
                  )}

                  {item.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-plum/90 text-white text-[10px] font-bold backdrop-blur-sm border border-white/20">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Caption / Title */}
                <div className="p-4 space-y-1">
                  <h4 className="font-serif font-bold text-sm text-brand-plum truncate group-hover:text-rose-600 transition-colors">
                    {item.title || 'Gallery Moment'}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-brand-gray line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Lightbox / Video Viewer Modal */}
        {activeMediaItem && (
          <div className="fixed inset-0 w-screen h-screen z-[99999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
            <div className="bg-black rounded-3xl overflow-hidden max-w-4xl w-full relative shadow-2xl border border-white/20 flex flex-col my-auto max-h-[90vh]">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveMediaItem(null)}
                className="absolute top-4 right-4 z-30 p-2 text-white bg-black/60 hover:bg-black/90 rounded-full transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Media Container */}
              <div className="flex-1 flex items-center justify-center bg-black min-h-[300px] max-h-[70vh]">
                {activeMediaItem.type === 'video' ? (
                  <video
                    src={activeMediaItem.url}
                    controls
                    autoPlay
                    className="w-full max-h-[70vh] object-contain"
                  />
                ) : (
                  <img
                    src={activeMediaItem.url}
                    alt={activeMediaItem.title}
                    className="w-full max-h-[70vh] object-contain"
                  />
                )}
              </div>

              {/* Caption Footer */}
              <div className="p-4 sm:p-6 bg-slate-900 text-white space-y-1 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-white">
                    {activeMediaItem.title || 'Gallery Photo'}
                  </h3>
                  {activeMediaItem.category && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-plum text-amber-300 border border-brand-gold/30">
                      {activeMediaItem.category}
                    </span>
                  )}
                </div>
                {activeMediaItem.caption && (
                  <p className="text-xs text-gray-300 leading-relaxed">
                    {activeMediaItem.caption}
                  </p>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
