import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PaithaniDivider } from '../components/common/PaithaniDivider';
import { ShieldCheck, Users, Lock, MapPin, Phone, Mail } from 'lucide-react';

export const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-brand-rose/20 text-brand-plum text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Our Bureau & Heritage
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-plum">
          Sambodhi Sarang Marriage Bureau
        </h1>
        <p className="font-serif-marathi text-2xl text-brand-plum font-bold">
          “॥ संबोधी सारंग वधूवर सूचक केंद्र ॥”
        </p>
        <p className="text-sm text-brand-gray leading-relaxed pt-2">
          Sambodhi Sarang Marriage Bureau was established in Ichalkaranji to connect families with trust, tradition, and dignity across Ichalkaranji, Kolhapur, Sangli, Pune, Mumbai, and worldwide.
        </p>
      </div>

      <PaithaniDivider />

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-600" />
          <h3 className="font-serif font-bold text-lg text-brand-plum">100% Profile Screening</h3>
          <p className="text-xs text-brand-gray leading-relaxed">
            Every bride and groom profile on Sambodhi Sarang Marriage Bureau undergoes screening and mobile verification for guaranteed authenticity.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3">
          <Lock className="w-10 h-10 text-brand-plum" />
          <h3 className="font-serif font-bold text-lg text-brand-plum">Strict Privacy Control</h3>
          <p className="text-xs text-brand-gray leading-relaxed">
            Non-logged-in visitors cannot view profile details. Phone numbers are protected until an interest request is accepted by both families.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3">
          <Users className="w-10 h-10 text-brand-plum" />
          <h3 className="font-serif font-bold text-lg text-brand-plum">Ichalkaranji & Regional Focus</h3>
          <p className="text-xs text-brand-gray leading-relaxed">
            Headquartered in Ichalkaranji, tailored specifically for families across Kolhapur, Sangli, Pune, Mumbai, Maharashtra and worldwide.
          </p>
        </div>

      </div>

      {/* Contact Quick Info Card */}
      <div className="bg-brand-plum text-white p-8 rounded-3xl text-center max-w-2xl mx-auto space-y-4 shadow-xl">
        <h3 className="font-serif font-bold text-xl text-brand-rose">Contact Bureau Office</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-gray-100">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-brand-rose" />
            <span className="font-bold">+91 9823425404</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-brand-rose" />
            <span className="font-bold">pk9823435404@gmail.com</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-brand-rose" />
            <span className="font-bold">Ichalkaranji, Maharashtra</span>
          </div>
        </div>
      </div>

    </div>
  );
};
