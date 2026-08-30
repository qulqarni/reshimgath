import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PaithaniDivider } from '../components/common/PaithaniDivider';
import { Heart, ShieldCheck, Award, Users, Lock } from 'lucide-react';

export const AboutPage = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-brand-rose/20 text-brand-plum text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Our Vision & Heritage
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-brand-plum">
          ReshimGath Matrimony (रेशीमगाठी)
        </h1>
        <p className="font-serif-marathi text-xl text-brand-kesari font-bold">
          “॥ शुभमंगल सावधान ॥ — रेशीमगाठ विश्वासाची”
        </p>
        <p className="text-sm text-brand-gray leading-relaxed pt-2">
          ReshimGath was founded to revolutionize matrimonial matchmaking for the people of Maharashtra by combining modern tech security with deep cultural respect for Maharashtrian families, family values, and regional pride.
        </p>
      </div>

      <PaithaniDivider />

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-600" />
          <h3 className="font-serif font-bold text-lg text-brand-plum">100% Profile Screening</h3>
          <p className="text-xs text-brand-gray leading-relaxed">
            Every bride and groom profile on ReshimGath undergoes profile screening and mobile verification to keep our platform free of fake accounts.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3">
          <Lock className="w-10 h-10 text-brand-rose" />
          <h3 className="font-serif font-bold text-lg text-brand-plum">Strict Privacy Control</h3>
          <p className="text-xs text-brand-gray leading-relaxed">
            Non-logged-in visitors cannot view profile details. Phone numbers are protected until an interest request is accepted by both families.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-brand-rose/20 shadow-luxury space-y-3">
          <Users className="w-10 h-10 text-brand-kesari" />
          <h3 className="font-serif font-bold text-lg text-brand-plum">Maharashtrian Heritage Focus</h3>
          <p className="text-xs text-brand-gray leading-relaxed">
            Focused specifically on Pune, Mumbai, Kolhapur, Sangli, Satara, Solapur, Nashik, Chhatrapati Sambhajinagar, Ratnagiri, and Maharashtrian diaspora worldwide.
          </p>
        </div>

      </div>

    </div>
  );
};
