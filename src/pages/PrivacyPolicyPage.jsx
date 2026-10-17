import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  FileText, 
  UserCheck, 
  Phone, 
  Mail, 
  ArrowLeft, 
  CheckCircle2, 
  Trash2, 
  AlertCircle, 
  Database, 
  MessageSquare, 
  ShieldAlert,
  ExternalLink
} from 'lucide-react';

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
              Privacy Policy & Data Protection
            </h1>
            <p className="text-xs sm:text-sm text-brand-rose max-w-2xl font-medium">
              Your trust and family privacy are our highest priority. This policy outlines how Sambodhi Sarang Marriage Bureau collects, safeguards, utilizes, retains, and permanently deletes your personal profile information in compliance with Indian IT Rules and Google Play policies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
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
            <button
              onClick={() => onNavigate('/delete-account')}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all border border-rose-400/40"
            >
              Data Deletion
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-rose/20 shadow-luxury space-y-8 text-brand-charcoal leading-relaxed text-xs sm:text-sm">
        
        <div className="text-xs text-brand-gray border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-2">
          <span>Last Updated & Effective: <strong>January 1, 2026 (Version 2026.2)</strong></span>
          <span>Sambodhi Sarang Marriage Bureau, Ichalkaranji, Maharashtra, India</span>
        </div>

        {/* Introduction */}
        <section className="space-y-3 bg-brand-lightBg/50 p-5 rounded-2xl border border-brand-rose/15">
          <h2 className="font-serif font-bold text-base text-brand-plum">1. Introduction & Regulatory Scope</h2>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Sambodhi Sarang Marriage Bureau ("we", "us", "our", or "Sambodhi Sarang") operates matrimonial matchmaking services through our official website (<strong>sambodhisarang.com</strong>) and mobile platforms. We are committed to protecting the privacy, dignity, and personal safety of our members.
          </p>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            This Privacy Policy has been formulated in strict accordance with the <strong>Information Technology Act, 2000</strong>, the <strong>Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021</strong>, the <strong>Digital Personal Data Protection (DPDP) Act</strong>, and the <strong>Google Play Developer Data Safety Guidelines</strong>.
          </p>
        </section>

        {/* Section 2: Information We Collect */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <h2>Information We Collect</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            To provide legitimate matrimonial matchmaking services between verified candidates and their families, Sambodhi Sarang collects personal details voluntarily provided by candidates, their parents, or authorized guardians:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-brand-lightBg/60 p-3 rounded-xl border border-brand-rose/15 space-y-1">
              <span className="font-bold text-brand-plum flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Personal & Demographic Details
              </span>
              <p className="text-xs text-brand-gray">Full candidate name, gender, date of birth, age, height, marital status, mother tongue, native place, and horoscope/gothra details.</p>
            </div>
            <div className="bg-brand-lightBg/60 p-3 rounded-xl border border-brand-rose/15 space-y-1">
              <span className="font-bold text-brand-plum flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Education & Career
              </span>
              <p className="text-xs text-brand-gray">Highest educational qualifications, college/university, current profession, employer/business name, annual income, and work location.</p>
            </div>
            <div className="bg-brand-lightBg/60 p-3 rounded-xl border border-brand-rose/15 space-y-1">
              <span className="font-bold text-brand-plum flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Contact & Family Information
              </span>
              <p className="text-xs text-brand-gray">Registered mobile phone number, WhatsApp contact number, email address, physical address, parents' names, and family background.</p>
            </div>
            <div className="bg-brand-lightBg/60 p-3 rounded-xl border border-brand-rose/15 space-y-1">
              <span className="font-bold text-brand-plum flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Profile Photos & Biodata Documents
              </span>
              <p className="text-xs text-brand-gray">Candidate portrait photographs, gallery photos, and uploaded PDF or image biodata documents containing family details.</p>
            </div>
            <div className="bg-brand-lightBg/60 p-3 rounded-xl border border-brand-rose/15 space-y-1">
              <span className="font-bold text-brand-plum flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Private Communications
              </span>
              <p className="text-xs text-brand-gray">Direct messages exchanged between mutual matches, connection interest requests sent and received, and read receipts.</p>
            </div>
            <div className="bg-brand-lightBg/60 p-3 rounded-xl border border-brand-rose/15 space-y-1">
              <span className="font-bold text-brand-plum flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Safety, Reports & Block Logs
              </span>
              <p className="text-xs text-brand-gray">User reports filed or received, reasons, moderation actions, blocked profile lists, and Terms of Use acceptance timestamps.</p>
            </div>
          </div>
        </section>

        {/* Section 3: Profile Photos & Media Validation */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <h2>Profile Photos & Media Protection</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Profile photos and biodatas are sensitive personal assets. Sambodhi Sarang enforces strict technical and administrative safeguards:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Format & Size Validation:</strong> All uploaded images must be valid JPG, PNG, or WEBP formats under 10MB. Biodatas must be in PDF or image format under 15MB. Executable code, scripts, or SVG formats are strictly rejected.</li>
            <li><strong>Mandatory Terms Acceptance:</strong> Users must explicitly accept the Terms of Use and Community Safety Rules before uploading photos or biodatas. Acceptance is verified server-side.</li>
            <li><strong>Storage & Watermarking:</strong> Photos are stored on secure Google Cloud Firebase Storage with encrypted TLS transmission. Watermarks and download restrictions protect photos against unauthorized copying.</li>
            <li><strong>Access Controls:</strong> Only the profile owner or verified administrators can upload, replace, or delete photos for a given account.</li>
          </ul>
        </section>

        {/* Section 4: Private Messaging & User Communications */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <h2>Private Messaging & Communication Safety</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Our platform provides private messaging to enable prospective brides, grooms, and their families to communicate respectfully:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>End-to-End Privacy:</strong> Private messages are strictly accessible only to the two participants of the conversation. Database access rules mathematically enforce that non-participating members cannot read or tamper with your chats.</li>
            <li><strong>No Ad Targeting:</strong> We do not scan, parse, or monetize private message contents for commercial advertisements or third-party profiling.</li>
            <li><strong>Moderation of Reported Abuse:</strong> If a user reports a conversation for harassment, financial extortion, abusive conduct, or child exploitation, our safety team may review reported snippets solely to investigate the violation and take protective action (warning, suspension, or law enforcement referral).</li>
          </ul>
        </section>

        {/* Section 5: Strict Phone Privacy Gate */}
        <section className="space-y-3 bg-amber-50/70 p-5 sm:p-6 rounded-2xl border border-amber-200">
          <div className="flex items-center space-x-2.5 text-amber-900 font-serif font-bold text-base sm:text-lg">
            <Lock className="w-5 h-5 text-amber-700 shrink-0" />
            <h2>Strict Family Privacy & Phone Number Protection</h2>
          </div>
          <p className="text-amber-950 text-xs sm:text-sm leading-relaxed font-medium">
            Sambodhi Sarang enforces an uncompromising privacy gate to protect female candidates and prevent telemarketing harassment:
          </p>
          <ul className="space-y-2 text-xs text-amber-950 font-semibold pt-1">
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Candidate phone numbers and complete postal addresses are hidden from unauthorized visitors and unverified users.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Contact details are accessible only by mutual consent or authorized premium family accounts.</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
              <span><strong>ZERO Commercial Sale:</strong> We NEVER sell, rent, or trade member phone numbers or emails to third-party telemarketers, banks, loan agents, or data brokers.</span>
            </li>
          </ul>
        </section>

        {/* Section 6: Third-Party Data Sharing & Disclosure */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <h2>Data Sharing & Third-Party Disclosure Policy</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            We share personal data strictly on a need-to-know basis to fulfill core matchmaking operations:
          </p>
          <div className="space-y-2 text-xs text-slate-700">
            <p><strong>1. Infrastructure & Cloud Providers:</strong> We use Google Cloud Firebase (Firestore, Storage, Authentication) to store data securely. Google acts as a secure data processor bound by strict confidentiality and ISO 27001 data security standards.</p>
            <p><strong>2. Payment Gateways:</strong> When you purchase a subscription plan, payment processing is handled securely by Razorpay. Sambodhi Sarang does not store credit/debit card numbers or net banking passwords.</p>
            <p><strong>3. Legal & Statutory Disclosure:</strong> We may disclose member records only when legally mandated by Indian law enforcement authorities under a valid Section 91 CrPC notice, court order, or when mandatory under the POCSO Act 2012 / Information Technology Act 2000.</p>
          </div>
        </section>

        {/* Section 7: Data Retention Policy */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              6
            </div>
            <h2>Data Retention Policy</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            We retain personal data only for as long as necessary to fulfill matrimonial matchmaking purposes or satisfy statutory requirements:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Active Profiles:</strong> Retained while your account remains active and registered with the bureau.</li>
            <li><strong>Immediate Purge on Deletion:</strong> Upon in-app deletion or verification of a web deletion request, your profile biodata, photographs, uploaded files, and private chats are permanently purged from active databases and storage.</li>
            <li><strong>Statutory Compliance Logs:</strong> Basic transaction invoices (for tax/accounting audit) and security connection logs (timestamps, IP addresses) are retained for up to 180 days solely to comply with CERT-In directives and Rule 3(1)(h) of the Information Technology (Intermediary Guidelines) Rules, 2021, after which they are irreversibly destroyed.</li>
            <li><strong>Child Safety & Incident Records:</strong> Records related to child sexual abuse material (CSAM) or severe violations are preserved as required by law for submission to statutory child protection and law enforcement agencies.</li>
          </ul>
        </section>

        {/* Section 8: Account Deletion & User Rights */}
        <section className="space-y-4 bg-rose-50/50 p-6 rounded-2xl border border-rose-200">
          <div className="flex items-center space-x-2.5 text-rose-900 font-serif font-bold text-base sm:text-lg">
            <Trash2 className="w-5 h-5 text-rose-600 shrink-0" />
            <h2>Account Deletion & Right to Erasure</h2>
          </div>
          <p className="text-rose-950 text-xs sm:text-sm leading-relaxed font-medium">
            In compliance with Google Play Developer Policies and the Digital Personal Data Protection Act, we provide two transparent mechanisms for complete account and data deletion:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-2">
              <h3 className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Mechanism A: Instant In-App Deletion
              </h3>
              <p className="text-xs text-brand-gray">
                Logged-in users can permanently erase their account at any time:
              </p>
              <ol className="text-xs text-slate-700 list-decimal pl-4 space-y-1 font-medium">
                <li>Go to <strong>My Profile</strong> &gt; <strong>Account Settings</strong>.</li>
                <li>Navigate to <strong>Danger Zone: Delete Account</strong>.</li>
                <li>Confirm deletion. Your profile, photos, biodata, and chats will be immediately and irreversibly purged.</li>
              </ol>
              <button
                onClick={() => onNavigate('/settings')}
                className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
              >
                Go to Account Settings <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-2">
              <h3 className="font-bold text-xs text-rose-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Mechanism B: Public Web Deletion Request
              </h3>
              <p className="text-xs text-brand-gray">
                If you have uninstalled the app or cannot log in, use our dedicated public deletion page:
              </p>
              <p className="text-xs text-slate-700 font-medium">
                Visit <strong>sambodhisarang.com/delete-account</strong> (no login required). Enter your registered name, phone, or email. Your request will be verified and executed within 24 to 48 hours.
              </p>
              <button
                onClick={() => onNavigate('/delete-account')}
                className="mt-2 text-xs font-bold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
              >
                Open Public Deletion Page <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 9: Grievance Officer & Contact Information */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              7
            </div>
            <h2>Grievance Redressal Officer & Bureau Contact</h2>
          </div>
          <p className="text-xs text-brand-gray leading-relaxed">
            In compliance with Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the details of our designated Grievance Officer are published below:
          </p>
          <div className="bg-brand-lightBg p-5 rounded-2xl border border-brand-rose/20 text-xs space-y-2 text-brand-charcoal">
            <p className="font-bold text-brand-plum text-sm">
              Sambodhi Sarang Marriage Bureau (संबोधी सारंग वधूवर सूचक केंद्र)
            </p>
            <p><strong>Designation:</strong> Grievance Redressal & Data Protection Officer</p>
            <p><strong>Office Address:</strong> Sambodhi Sarang Marriage Bureau, Ichalkaranji, Dist. Kolhapur, Maharashtra - 416115, India</p>
            <p><strong>Helpline / WhatsApp:</strong> +91 9823425404</p>
            <p><strong>Official Monitored Email:</strong> <a href="mailto:pk9823425404@gmail.com" className="text-brand-plum font-bold underline">pk9823425404@gmail.com</a></p>
            <p className="text-brand-gray text-[11px] pt-1 border-t border-brand-rose/20">
              * The Grievance Officer acknowledges all privacy grievances, data erasure requests, or safety inquiries within 24 hours and resolves them within 15 days as mandated by Indian law.
            </p>
          </div>
        </section>

      </div>

    </div>
  );
};
