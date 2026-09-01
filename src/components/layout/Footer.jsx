import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Heart, ShieldCheck, Phone, Mail, MapPin, Lock } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-brand-ivory text-brand-charcoal pt-8 sm:pt-16 pb-20 md:pb-12 border-t-2 sm:border-t-4 border-brand-plum relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none paithani-bg-accent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 text-center md:text-left">
          
          {/* Col 1: Brand Logo & Philosophy */}
          <div className="flex flex-col items-center md:items-start space-y-3 sm:space-y-4">
            <img 
              src="/logo.png" 
              alt="Sambodhi Sarang Marriage Bureau" 
              className="h-12 sm:h-16 w-auto object-contain cursor-pointer"
              onClick={() => onNavigate('/')}
            />

            <p className="text-brand-plum text-xs sm:text-sm font-serif-marathi font-bold leading-relaxed text-center md:text-left">
              ॥ संबोधी सारंग वधूवर सूचक केंद्र ॥
            </p>

            <p className="hidden sm:block text-brand-gray text-xs leading-relaxed">
              Designed exclusively for families across Ichalkaranji, Kolhapur, Sangli, Pune, Mumbai, Satara, Solapur, Nashik and worldwide.
            </p>

            <div className="pt-1 flex items-center justify-center md:justify-start space-x-3 sm:space-x-4 text-[11px] sm:text-xs">
              <div className="flex items-center space-x-1 text-brand-plum font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
                <span>100% Verified Profiles</span>
              </div>
              <div className="flex items-center space-x-1 text-brand-plum font-semibold">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-plum shrink-0" />
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="hidden md:flex flex-col items-start">
            <h4 className="font-serif text-sm sm:text-lg font-bold text-brand-plum mb-2 sm:mb-4 border-b border-brand-rose/20 pb-1 w-full text-center md:text-left">
              Explore Sambodhi Sarang
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
              Need assistance with profile creation or Biodata verification? Our support team is ready to help you.
            </p>
            <div className="flex flex-col items-center md:items-start space-y-1.5 sm:space-y-2 text-xs text-brand-charcoal font-medium">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-plum shrink-0" />
                <span>+91 9823425404</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-plum shrink-0" />
                <span>pk9823435404@gmail.com</span>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-center md:text-left">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-plum shrink-0" />
                <span>Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-6 sm:mt-12 pt-4 sm:pt-6 border-t border-brand-rose/20 flex flex-col sm:flex-row items-center justify-between text-[11px] sm:text-xs text-brand-gray gap-2 sm:gap-4 text-center sm:text-left">
          <p>© 2026 Sambodhi Sarang Marriage Bureau. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('/about')} className="hover:text-brand-plum transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => onNavigate('/about')} className="hover:text-brand-plum transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
