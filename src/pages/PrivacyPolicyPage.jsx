import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ShieldCheck, Lock, Eye, FileText, UserCheck, Phone, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-plum via-brand-plumDark to-brand-plum text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-brand-gold/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>संबोधी सारंग गोपनीयता धोरण</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-wide text-white">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-brand-rose max-w-2xl font-medium">
              Your trust and family privacy are our highest priority. Learn how Sambodhi Sarang Marriage Bureau protects, uses, and safeguards your personal profile information.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => onNavigate('/privacy-policy')}
              className="px-4 py-2 bg-white text-brand-plum font-bold text-xs rounded-xl shadow border border-white"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('/terms-of-service')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20"
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
            <h2>Information We Collect</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            To facilitate authentic matrimonial matchmaking between verified Maharashtrian families, Sambodhi Sarang Marriage Bureau collects personal and family details provided voluntarily by candidates or their parents/guardians during account registration and profile creation:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1 font-medium text-slate-700">
            <li className="flex items-center space-x-2 bg-brand-lightBg/60 p-2.5 rounded-xl border border-brand-rose/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Personal Details (Full Name, Gender, DOB, Age, Height)</span>
            </li>
            <li className="flex items-center space-x-2 bg-brand-lightBg/60 p-2.5 rounded-xl border border-brand-rose/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Cultural Details (Religion, Caste, Sub-caste, Gothra)</span>
            </li>
            <li className="flex items-center space-x-2 bg-brand-lightBg/60 p-2.5 rounded-xl border border-brand-rose/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contact Info (Phone Number, WhatsApp, Email, Address)</span>
            </li>
            <li className="flex items-center space-x-2 bg-brand-lightBg/60 p-2.5 rounded-xl border border-brand-rose/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Education & Profession (Degree, Occupation, Income)</span>
            </li>
            <li className="flex items-center space-x-2 bg-brand-lightBg/60 p-2.5 rounded-xl border border-brand-rose/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Family Background & Biodata PDF documents</span>
            </li>
            <li className="flex items-center space-x-2 bg-brand-lightBg/60 p-2.5 rounded-xl border border-brand-rose/15">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Government Photo Verification Documents (Aadhaar/ID)</span>
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <h2>How We Use Your Profile Information</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            All profile information collected is strictly utilized to deliver legitimate matrimonial services:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li>Displaying filtered candidate profiles to registered users according to caste, age, education, and district preferences.</li>
            <li>Enabling interest request exchanges and mutual connection requests between candidate families.</li>
            <li>Generating verified Biodata PDFs for family sharing.</li>
            <li>Preventing fake registrations, spam, and financial misrepresentation on the bureau platform.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 bg-amber-50/70 p-5 sm:p-6 rounded-2xl border border-amber-200">
          <div className="flex items-center space-x-2.5 text-amber-900 font-serif font-bold text-base sm:text-lg">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <h2>Strict Family Privacy & Phone Number Protection</h2>
          </div>
          <p className="text-amber-950 text-xs sm:text-sm leading-relaxed font-medium">
            Sambodhi Sarang Marriage Bureau enforces a strict privacy gate to prevent commercial abuse and protect female & candidate privacy:
          </p>
          <ul className="space-y-1.5 text-xs text-amber-950 font-semibold pt-1">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Phone numbers and full surnames are hidden from non-logged-in visitors and unauthorized accounts.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Contact details are accessible only by active membership plan subscribers or connected matches.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>We never sell or rent candidate phone numbers or emails to third-party ad networks or data brokers.</span>
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <h2>Data Security & Safeguards</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            We implement industry-standard encryption, SSL security protocols, and firewalls to protect your stored profile data and photos. Access to internal administrative databases is strictly restricted to authorized Sambodhi Sarang bureau verification personnel.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <h2>User Rights & Account Control</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            As a candidate or profile creator, you hold complete control over your profile data:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Update Profile:</strong> You can edit your biodata, photos, and preferences at any time via My Profile settings.</li>
            <li><strong>Delete / Deactivate:</strong> You can request profile deactivation or deletion once your marriage is fixed or whenever desired by contacting bureau support.</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="font-serif font-bold text-base text-brand-plum">Contact Privacy Support</h2>
          <p className="text-xs text-brand-gray">
            For any questions, profile privacy requests, or data removal inquiries, please contact our bureau office:
          </p>
          <div className="bg-brand-lightBg p-4 rounded-2xl border border-brand-rose/20 text-xs space-y-1 text-brand-plum font-semibold">
            <p>Sambodhi Sarang Marriage Bureau (संबोधी सारंग वधूवर सूचक केंद्र)</p>
            <p className="text-brand-charcoal font-medium">Helpline / WhatsApp: +91 9823425404</p>
            <p className="text-brand-charcoal font-medium">Email: pk9823435404@gmail.com</p>
            <p className="text-brand-gray font-normal">Ichalkaranji, Maharashtra, India</p>
          </div>
        </section>

      </div>

    </div>
  );
};
