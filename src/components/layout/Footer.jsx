import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Heart, ShieldCheck, Phone, Mail, MapPin, Lock, Award } from 'lucide-react';
import { MAHARASHTRA_DISTRICTS } from '../../data/maharashtraData';

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-ivory text-brand-charcoal pt-8 sm:pt-16 pb-20 md:pb-12 border-t-2 sm:border-t-4 border-brand-gold relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none paithani-bg-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 text-center md:text-left">
          
          {/* Col 1: Brand & Philosophy */}
          <div className="flex flex-col items-center md:items-start space-y-2 sm:space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-brand-plum text-brand-gold flex items-center justify-center border border-brand-gold/40 shadow-sm shrink-0">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-brand-kesari text-brand-gold" />
              </div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-brand-plum">
                ReshimGath
              </span>
            </div>

            <p className="text-brand-kesari text-xs sm:text-sm font-serif-marathi font-bold leading-relaxed text-center md:text-left">
              {t('footerDevanagariQuote')}
            </p>

            <p className="hidden sm:block text-brand-gray text-xs leading-relaxed">
              Designed exclusively for Maharashtrian families across Pune, Mumbai, Kolhapur, Sangli, Satara, Solapur, Nashik, Ichalkaranji and worldwide.
            </p>

            <div className="pt-1 flex items-center justify-center md:justify-start space-x-3 sm:space-x-4 text-[11px] sm:text-xs">
              <div className="flex items-center space-x-1 text-brand-plum font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Profiles</span>
              </div>
              <div className="flex items-center space-x-1 text-brand-plum font-semibold">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-rose shrink-0" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links (Hidden on Mobile View) */}
          <div className="hidden md:flex flex-col items-start">
            <h4 className="font-serif text-sm sm:text-lg font-bold text-brand-plum mb-2 sm:mb-4 border-b border-brand-rose/20 pb-1 w-full text-center md:text-left">
              Explore ReshimGath
            </h4>
            <div className="flex flex-col items-center md:items-start gap-1.5 sm:space-y-2.5 text-xs text-brand-gray">
              <button onClick={() => onNavigate('/')} className="hover:text-brand-plum font-medium transition-colors">
                {t('home')}
              </button>
              <button onClick={() => onNavigate('/discover')} className="hover:text-brand-plum font-medium transition-colors">
                {t('discover')}
              </button>
              <button onClick={() => onNavigate('/about')} className="hover:text-brand-plum font-medium transition-colors">
                {t('aboutUs')}
              </button>
              <button onClick={() => onNavigate('/contact')} className="hover:text-brand-plum font-medium transition-colors">
                {t('contactUs')}
              </button>
              <button onClick={() => onNavigate('/login')} className="hover:text-brand-plum font-medium transition-colors">
                {t('login')} / {t('signup')}
              </button>
            </div>
          </div>

          {/* Col 3: Trust Helpline & Contact */}
          <div className="flex flex-col items-center md:items-start space-y-2 sm:space-y-3">
            <h4 className="font-serif text-sm sm:text-lg font-bold text-brand-plum mb-2 sm:mb-4 border-b border-brand-rose/20 pb-1 w-full text-center md:text-left">
              Connect With Us
            </h4>
            <p className="hidden sm:block text-xs text-brand-gray">
              Need assistance with profile creation or Biodata verification? Our support team speaks fluent Marathi & English.
            </p>
            <div className="flex flex-col items-center md:items-start space-y-1.5 sm:space-y-2 text-xs text-brand-charcoal font-medium">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-kesari shrink-0" />
                <span>+91 98220 12345 / 020 25678900</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-plum shrink-0" />
                <span>support@reshimgath.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-center md:text-left">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-kesari shrink-0" />
                <span>FC Road, Shivajinagar, Pune, Maharashtra 411005</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-12 pt-4 sm:pt-6 border-t border-brand-rose/20 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-brand-gray gap-2 sm:gap-4 text-center sm:text-left">
          <p>© 2026 ReshimGath Matrimony. {t('footerRights')}</p>
          <div className="flex justify-center space-x-4 sm:space-x-6">
            <span className="hover:text-brand-plum hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:text-brand-plum hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:text-brand-plum hover:underline cursor-pointer">Safety Tips</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
