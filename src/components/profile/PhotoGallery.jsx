import React, { useState } from 'react';
import { Maximize2, X, ChevronLeft, ChevronRight, Image as ImageIcon, User, Camera } from 'lucide-react';

export const PhotoGallery = ({ photos = [], name = "" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-96 sm:h-[480px] rounded-3xl bg-white border-2 border-dashed border-brand-rose/30 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-luxury">
        <div className="w-20 h-20 rounded-full bg-brand-plum/10 text-brand-plum flex items-center justify-center border-2 border-brand-plum/20">
          <User className="w-10 h-10 text-brand-plum" />
        </div>
        <div className="space-y-1 max-w-xs">
          <h4 className="font-serif font-bold text-lg text-brand-plum">No Profile Photo Uploaded</h4>
          <p className="text-xs text-brand-gray leading-relaxed">
            Upload your genuine profile photo to build trust and receive 3x more responses from verified Maharashtrian families.
          </p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[activeIndex] || photos[0];

  return (
    <div className="space-y-4">
      {/* Main Feature Photo */}
      <div className="relative h-96 sm:h-[480px] w-full rounded-3xl overflow-hidden bg-brand-charcoal group shadow-luxury">
        <img
          src={currentPhoto}
          alt={`${name} photo ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />

        {/* Expand Lightbox Overlay Button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-brand-plum transition-all"
          title="View Fullsize Photo"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Counter Tag */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
          {activeIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Thumbnails Row */}
      {photos.length > 1 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-none">
          {photos.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                activeIndex === idx
                  ? 'border-brand-plum ring-2 ring-brand-gold shadow-md scale-105'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Previous Arrow */}
          {photos.length > 1 && (
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
              className="absolute left-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden">
            <img
              src={currentPhoto}
              alt="Full view"
              className="w-full h-full object-contain max-h-[85vh]"
            />
          </div>

          {/* Next Arrow */}
          {photos.length > 1 && (
            <button
              onClick={() => setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
              className="absolute right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
