import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, ShieldCheck } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Phase 1: Start fade out animation at 1.5s
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1500);

    // Phase 2: Unmount component at 2.0s
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 via-amber-50/70 to-brand-ivory transition-all duration-500 ease-out select-none ${
        isFading ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Decorative Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] bg-gradient-to-r from-pink-300/20 via-rose-300/15 to-amber-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute inset-0 opacity-20 paithani-bg-accent" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-sm sm:max-w-md mx-auto">
        
        {/* Animated Logo Container */}
        <div className="relative mb-6">
          {/* Outer Pulsing Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/20 via-rose-500/30 to-amber-400/20 rounded-3xl blur-lg animate-pulse" />

          {/* Logo Card with Glassmorphism */}
          <div className="relative bg-white/95 backdrop-blur-xl p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-brand-rose/30 transform transition-transform duration-700 animate-[bounce_2s_infinite]">
            <img 
              src="/logo.png" 
              alt="Sambodhi Sarang Logo" 
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-md rounded-2xl"
            />

            {/* Subtle Shimmer Overlay */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
          </div>

          {/* Floating Heart Badges */}
          <div className="absolute -top-2 -right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg animate-bounce">
            <Heart className="w-4 h-4 fill-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 bg-amber-500 text-white p-1.5 rounded-full shadow-lg animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-plum font-serif-marathi tracking-wide drop-shadow-sm">
            ॥ संबोधी सारंग ॥
          </h1>
          
          <div className="flex items-center justify-center space-x-2 text-brand-rose font-semibold text-xs sm:text-sm">
            <span className="h-0.5 w-6 bg-brand-rose/40 rounded-full" />
            <span>वधू वर सूचक केंद्र</span>
            <span className="h-0.5 w-6 bg-brand-rose/40 rounded-full" />
          </div>

          <p className="text-[11px] sm:text-xs text-brand-gray font-medium pt-1 max-w-xs mx-auto">
            महाराष्ट्रातील १ नंबर सुरक्षित व विश्वासू वधूवर सूचक मंच
          </p>
        </div>

        {/* Progress Bar & Verification Seal */}
        <div className="mt-8 w-48 sm:w-56 space-y-3">
          <div className="h-1.5 w-full bg-brand-rose/20 rounded-full overflow-hidden p-0.5 border border-brand-rose/10 shadow-inner">
            <div className="h-full bg-gradient-to-r from-pink-500 via-rose-600 to-amber-500 rounded-full transition-all duration-[1400ms] ease-out w-full animate-pulse" />
          </div>

          <div className="flex items-center justify-center space-x-1.5 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 animate-pulse" />
            <span>100% Verified Profiles</span>
          </div>
        </div>

      </div>
    </div>
  );
};
