import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FileText, ShieldCheck, UserCheck, AlertTriangle, Scale, Lock, Phone, Mail, CheckCircle2 } from 'lucide-react';

export const TermsOfServicePage = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-plum via-brand-plumDark to-brand-plum text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-brand-gold/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
              <FileText className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>संबोधी सारंग सेवा शर्ती</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-wide text-white">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-brand-rose max-w-2xl font-medium">
              Please read these Terms of Service carefully before creating a profile or using Sambodhi Sarang Marriage Bureau services.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigate('/privacy-policy')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('/terms-of-service')}
              className="px-4 py-2 bg-white text-brand-plum font-bold text-xs rounded-xl shadow border border-white"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-rose/20 shadow-luxury space-y-8 text-brand-charcoal leading-relaxed text-xs sm:text-sm">
        
        <div className="text-xs text-brand-gray border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-2">
          <span>Effective Date: <strong>January 1, 2026</strong></span>
          <span>Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra</span>
        </div>

        {/* Section 1 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <h2>Eligibility & Legal Minimum Age Criteria</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Sambodhi Sarang Marriage Bureau is an exclusive matrimonial platform intended solely for individuals seeking solemn, legal marriage alliances under Indian law:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Minimum Age Requirement:</strong> Female candidates must be at least 18 years of age, and Male candidates must be at least 21 years of age at the time of registration.</li>
            <li><strong>Marital Status:</strong> Only single, never-married, legally divorced (with valid court decree), or widowed individuals may create profiles. Married individuals are strictly prohibited from registering.</li>
            <li><strong>Sole Purpose:</strong> Platform usage is restricted exclusively to matrimonial matchmaking. Dating, casual relationships, or non-matrimonial usage are strictly forbidden.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <h2>Authentic Information & Verification Guarantee</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            By registering on Sambodhi Sarang, you guarantee that all details, photos, age, education, caste, marital status, and family background provided in your profile are 100% true, accurate, and authentic:
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1 font-medium">
            <p className="font-bold flex items-center gap-1 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Zero Tolerance for Fraud & False Information:</span>
            </p>
            <p>Providing false identity, fake photos, inflated income/degree, or hiding prior marital status will result in immediate profile ban and forfeiture of membership fees without refund, alongside reporting to law enforcement where applicable.</p>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <h2>Membership Plans & Profile Access Credits</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Our bureau offers tiered membership subscription plans (Basic ₹1100, Standard ₹2100, Premium ₹3100) that grant profile visit credits to unlock full candidate details and contact numbers:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Credit Deductions:</strong> Profile credits are consumed only when unlocking a new, unviewed candidate profile.</li>
            <li><strong>Already Opened Profiles:</strong> Re-viewing candidate profiles that you have already unlocked or connected with consumes 0 credits and remains free forever.</li>
            <li><strong>Non-Transferable:</strong> Membership plans and credits are non-transferable and non-refundable once activated.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <h2>User Code of Conduct & Family Dignity</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Members agree to conduct all interactions with dignity, courtesy, and respect toward candidate families:
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Do not solicit money, financial loans, or commercial favors from other members.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Do not send abusive, obscene, or harassing messages to candidates or families.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Respect decisions if a candidate or family declines an interest request.</span>
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <h2>Bureau Role & Limitation of Liability</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Sambodhi Sarang Marriage Bureau provides a matchmaking platform to facilitate family introductions. While we perform administrative background verifications, candidate families are strongly encouraged to conduct independent background checks, personal verification, and Kundali matching prior to finalizing any wedding commitments.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-brand-plum font-serif font-bold text-base">
            <Scale className="w-5 h-5 text-brand-plum shrink-0" />
            <h2>Governing Law & Jurisdiction</h2>
          </div>
          <p className="text-xs text-brand-gray leading-relaxed">
            These Terms of Service are governed by the laws of India. Any disputes arising out of platform usage or bureau services shall be subject to the exclusive jurisdiction of the competent courts in Ichalkaranji / Kolhapur district, Maharashtra, India.
          </p>
        </section>

      </div>

    </div>
  );
};
