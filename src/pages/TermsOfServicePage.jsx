import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  Scale, 
  Lock, 
  Phone, 
  Mail, 
  CheckCircle2,
  ShieldAlert,
  Ban,
  Upload,
  UserX,
  ExternalLink
} from 'lucide-react';
import { CURRENT_TERMS_VERSION, TERMS_LAST_UPDATED } from '../utils/termsEnforcement';

export const TermsOfServicePage = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-plum via-brand-plumDark to-brand-plum text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-brand-gold/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 bg-amber-400 text-slate-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
              <FileText className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
              <span>संबोधी सारंग सेवा शर्ती व नियम (v{CURRENT_TERMS_VERSION})</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-wide text-white">
              Terms of Use & Community Safety Rules
            </h1>
            <p className="text-xs sm:text-sm text-brand-rose max-w-2xl font-medium">
              Mandatory terms and standards governing profile registration, photo uploads, messaging, and community conduct on Sambodhi Sarang Marriage Bureau.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('/privacy-policy')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('/child-safety')}
              className="px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white font-bold text-xs rounded-xl transition-all border border-red-400 shadow-sm"
            >
              Child Safety Standards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-rose/20 shadow-luxury space-y-8 text-brand-charcoal leading-relaxed text-xs sm:text-sm">
        
        <div className="text-xs text-brand-gray border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-2">
          <span>Terms Version: <strong>v{CURRENT_TERMS_VERSION}</strong> • Last Updated: <strong>{TERMS_LAST_UPDATED}</strong></span>
          <span>Sambodhi Sarang Marriage Bureau, Ichalkaranji / Kolhapur, Maharashtra</span>
        </div>

        {/* Section 1: Acceptance & Requirement */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <h2>Mandatory Acceptance Before Uploading Content</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            By creating an account, browsing profiles, uploading biodata, or uploading profile photos, you enter into a legally binding agreement with Sambodhi Sarang Marriage Bureau.
          </p>
          <div className="p-4 bg-brand-lightBg/60 rounded-2xl border border-brand-rose/20 text-xs space-y-1.5">
            <strong className="text-brand-plum block font-bold">Explicit Pre-Upload Agreement Requirement:</strong>
            <p className="text-gray-700 leading-relaxed">
              Users must explicitly accept the current Terms of Use and Community Safety Rules before uploading profile photos, gallery media, or biodata documents. Each acceptance records your user ID, terms version (<span className="font-mono font-bold">v{CURRENT_TERMS_VERSION}</span>), and server timestamp in our secure database for compliance and dispute auditability.
            </p>
          </div>
        </section>

        {/* Section 2: Eligibility & Legal Age */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <h2>Eligibility & Legal Marriage Age Criteria (Strictly 18+)</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Sambodhi Sarang is an exclusive matrimonial matchmaking service designed solely for individuals seeking solemn, legal marriage alliances under Indian law:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Minimum Age Requirement:</strong> Candidates must be at least 18 years of age at the time of registration. Anyone under 18 years of age is strictly prohibited from registering or using the platform.</li>
            <li><strong>Marital Status:</strong> Only single, never-married, legally divorced (with valid court decree), or widowed individuals may create profiles. Married individuals attempting to register will be banned immediately.</li>
            <li><strong>Sole Matrimonial Purpose:</strong> The platform is dedicated exclusively to marriage alliances. Casual dating, hookups, commercial promotion, or non-matrimonial interactions are strictly forbidden.</li>
          </ul>
        </section>

        {/* Section 3: Community Safety & Prohibited Conduct */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <h2>Community Safety Rules & Prohibited Content</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            To maintain a safe, trusted, and respectful matchmaking environment for candidates and their families, the following activities and content are strictly prohibited:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            
            {/* Rule 1 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>1. Fake Profiles & Impersonation</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                You must not create profiles for fictitious individuals, impersonate another person, or provide false age, education, salary, marital status, or contact details.
              </p>
            </div>

            {/* Rule 2 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>2. Scams & Financial Solicitations</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Soliciting money, bank transfers, cryptocurrency, financial loans, gifts, travel expenses, or emergency funds from candidates or families is strictly forbidden.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>3. Inappropriate & Obscene Uploads</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Photos must be clear, modest portraits of the candidate. Nudity, pornography, semi-nude pictures, suggestive poses, alcohol/drug imagery, or copyrighted content will be deleted immediately.
              </p>
            </div>

            {/* Rule 4 */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-700 font-bold text-xs">
                <Ban className="w-4 h-4 text-rose-600 shrink-0" />
                <span>4. Harassment & Abusive Behavior</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Persistent unwanted messaging, stalking, profanity, vulgar language, extortion, defamation, casteist abuse, or intimidation will result in immediate suspension.
              </p>
            </div>

          </div>

          {/* Child Safety Callout */}
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl text-red-950 space-y-2">
            <div className="flex items-center space-x-2 text-red-800 font-extrabold text-xs sm:text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <span>Zero-Tolerance for Child Sexual Abuse & Exploitation (CSAE / CSAM)</span>
            </div>
            <p className="text-xs text-red-900 leading-relaxed">
              Sambodhi Sarang enforces absolute zero-tolerance for Child Sexual Abuse Material (CSAM), grooming, sexual solicitation of minors, or underage participation. Any attempt to upload CSAM or solicit minors will lead to immediate, irreversible account termination, IP blocking, and mandatory statutory reporting to the National Cyber Crime Reporting Portal (<a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-800">cybercrime.gov.in</a>) and helpline <strong>1930</strong> under the POCSO Act and IT Act.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/child-safety')}
                className="text-xs font-bold text-red-800 underline hover:text-red-950 inline-flex items-center space-x-1"
              >
                <span>Read our full Child Safety Standards Policy</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Section 4: Enforcement & Disciplinary Actions */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <h2>Content Removal, Account Suspension & Penalties</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Sambodhi Sarang reserves the right to review profiles, uploaded photos, and reported interactions through human moderation and automated safeguards. In the event of a violation, we will take one or more of the following actions without prior notice:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Official Warning:</strong> Issuance of a formal administrative warning notification.</li>
            <li><strong>Content Removal:</strong> Immediate deletion of violating profile photos, biodata files, or messages.</li>
            <li><strong>Account Suspension / Permanent Ban:</strong> Immediate deactivation of the offending account, forfeiture of all subscription credits without refund, and blocking of registered phone numbers and device identifiers.</li>
            <li><strong>Legal Prosecution:</strong> Escalation of fraudulent, criminal, or exploitative acts to Indian law enforcement authorities.</li>
          </ul>
        </section>

        {/* Section 5: Subscriptions & Credits */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <h2>Membership Subscriptions & Profile Access Credits</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Our bureau offers tiered membership subscription plans that provide visit credits to unlock full candidate details and contact information:
          </p>
          <ul className="space-y-2 text-xs text-slate-700 font-medium pl-4 list-disc">
            <li><strong>Credit Deductions:</strong> Profile credits are consumed only when unlocking a new, previously unviewed candidate profile.</li>
            <li><strong>Free Re-viewing:</strong> Candidate profiles you have already unlocked or connected with consume 0 credits and can be revisited freely during your plan validity.</li>
            <li><strong>Non-Refundable:</strong> Membership fees and credits are non-transferable and non-refundable once activated.</li>
          </ul>
        </section>

        {/* Section 6: User Verification & Independent Due Diligence */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              6
            </div>
            <h2>Due Diligence & Limitation of Liability</h2>
          </div>
          <p className="text-brand-gray text-xs sm:text-sm leading-relaxed">
            Sambodhi Sarang Marriage Bureau operates as an intermediary matchmaking platform facilitating introductions between families. While our team performs administrative document screening, candidates and families are strongly advised to conduct independent background checks, personal verification, employment verification, and Kundali matching before entering into any matrimonial commitments.
          </p>
        </section>

        {/* Section 7: Jurisdiction */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-brand-plum font-serif font-bold text-base">
            <Scale className="w-5 h-5 text-brand-plum shrink-0" />
            <h2>Governing Law & Legal Jurisdiction</h2>
          </div>
          <p className="text-xs text-brand-gray leading-relaxed">
            These Terms of Use are governed by and construed in accordance with the laws of the Republic of India. Any legal dispute or controversy arising out of platform usage shall be subject to the exclusive jurisdiction of the competent courts in Ichalkaranji / Kolhapur district, Maharashtra, India.
          </p>
        </section>

      </div>

    </div>
  );
};
