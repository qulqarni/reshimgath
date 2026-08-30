import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const VerificationBadge = ({ size = "normal", showLabel = true }) => {
  const { t } = useLanguage();
  
  if (size === "small") {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2 py-0.5 rounded-full border border-emerald-200/60 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        {showLabel && <span>{t('verifiedTag')}</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-900 text-xs px-2.5 py-1 rounded-full border border-emerald-300/80 font-semibold shadow-sm">
      <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
      <span>{t('verifiedTag')}</span>
    </span>
  );
};
