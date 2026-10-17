import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useProfiles } from '../context/ProfileContext';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Lock, 
  Send, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  FileText, 
  AlertOctagon, 
  UserX, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Clock,
  Scale
} from 'lucide-react';

export const ChildSafetyStandardsPage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { submitReport, addToast } = useProfiles();

  useEffect(() => {
    document.title = "Child Safety Standards | Sambodhi Sarang Matrimony";
    window.scrollTo(0, 0);
  }, []);

  // Public Child-Safety Incident / Feedback Form State
  const [reporterName, setReporterName] = useState('');
  const [reporterContact, setReporterContact] = useState('');
  const [targetIdOrUrl, setTargetIdOrUrl] = useState('');
  const [violationCategory, setViolationCategory] = useState('csae_csam');
  const [incidentDetails, setIncidentDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handlePublicReportSubmit = async (e) => {
    e.preventDefault();
    if (!targetIdOrUrl.trim() || !incidentDetails.trim()) {
      addToast?.('Please specify the offending profile/content and provide details of the concern.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const categoryLabels = {
        csae_csam: 'Child Sexual Abuse Material (CSAM) / CSAE Concern',
        underage_minor: 'Underage Account / Minor Registered Profile',
        grooming_solicitation: 'Grooming / Exploitation / Involving Minors',
        inappropriate_media: 'Inappropriate Media Depicting Minors',
        other_child_safety: 'Other Child Safety & Minor Protection Concern'
      };

      const res = await submitReport({
        targetType: 'profile',
        targetUserId: targetIdOrUrl.trim(),
        targetName: 'Reported Account / Content',
        reason: categoryLabels[violationCategory] || 'Child Safety Violation',
        details: incidentDetails.trim(),
        reporterName: reporterName.trim() || 'Concerned Citizen (Public Report)',
        reporterEmail: reporterContact.includes('@') ? reporterContact.trim() : '',
        reporterPhone: !reporterContact.includes('@') ? reporterContact.trim() : '',
        isChildSafety: true,
        priority: 'critical'
      });

      if (res) {
        setSubmittedSuccess(true);
        setReporterName('');
        setReporterContact('');
        setTargetIdOrUrl('');
        setIncidentDetails('');
      }
    } catch (err) {
      console.error('Error submitting public child safety report:', err);
      addToast?.('Failed to submit report. Please contact emergency authorities if immediate harm is suspected.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-fade-in text-brand-charcoal">
      
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-950 via-rose-950 to-brand-plum text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-rose-500/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-rose-500/30 text-rose-200 px-3.5 py-1 rounded-full text-xs font-bold border border-rose-400/40">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Zero-Tolerance Child Protection Standards</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Child Safety Standards
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
              बाल सुरक्षा आणि बाल लैंगिक शोषण प्रतिबंधक धोरण • Sambodhi Sarang Matrimony is committed to protecting children and strictly prohibits Child Sexual Abuse Material (CSAM), Child Sexual Exploitation and Abuse (CSAE), grooming, and underage participation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <a
              href="#report-form"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Report a Concern</span>
            </a>
            <button
              type="button"
              onClick={() => onNavigate('/terms-of-service')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/privacy-policy')}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-all border border-white/20"
            >
              Privacy Policy
            </button>
          </div>
        </div>

        {/* 4 Pillars Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-white/15 text-xs">
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">Exclusively 18+ Adult Service</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center space-x-2">
            <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">Zero Tolerance CSAE / CSAM</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">Rapid Triage & Content Removal</span>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl border border-white/10 flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-semibold text-[11px] sm:text-xs">Law Enforcement Escalation</span>
          </div>
        </div>
      </div>

      {/* Main Policy Document */}
      <article className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-rose/20 shadow-luxury space-y-8 text-xs sm:text-sm leading-relaxed">
        
        <div className="text-xs text-brand-gray border-b border-gray-100 pb-4 flex flex-wrap items-center justify-between gap-2">
          <span>Published Policy Version: <strong>2026.1 (Effective October 2026)</strong></span>
          <span>Applicable Jurisdiction: <strong>India & Applicable International Laws</strong></span>
          <span>Platform: <strong>Sambodhi Sarang Marriage Bureau (sambodhisarang.com)</strong></span>
        </div>

        {/* Section 1: Our Commitment to Child Safety */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0">
              1
            </div>
            <h2>Our Commitment to Child Safety</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Sambodhi Sarang Matrimony is deeply committed to protecting children and maintains an uncompromised <strong>Zero-Tolerance Policy</strong> against <strong>Child Sexual Abuse and Exploitation (CSAE)</strong> and <strong>Child Sexual Abuse Material (CSAM)</strong> on its platform.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The service is intended exclusively for adults seeking genuine matrimonial relationships. Sambodhi Sarang operates in strict accordance with the Prohibition of Child Marriage Act, the Protection of Children from Sexual Offences (POCSO) Act, the Information Technology Act 2000, and Google Play Child Safety Standards.
          </p>
          <div className="p-4 bg-rose-50 border-l-4 border-rose-600 rounded-r-2xl space-y-2 text-rose-950">
            <p className="font-bold text-xs sm:text-sm flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Strict Legal Age Prohibition: Anyone Under 18 Is Forbidden</span>
            </p>
            <p className="text-xs text-rose-900 leading-relaxed">
              <strong>Anyone under 18 years of age is strictly not permitted to create an account, upload content, or use the service under any circumstances.</strong> In addition, Sambodhi Sarang enforces legal marriageable age standards in India (minimum 18 years for females and 21 years for males). Any account discovered to have been created by or on behalf of a minor will be terminated immediately, barred permanently, and escalated to statutory law enforcement authorities.
            </p>
          </div>
        </section>

        {/* Section 2: Prohibited Content and Conduct */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              2
            </div>
            <h2>Prohibited Content and Conduct</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We maintain an uncompromising, zero-tolerance policy against harmful materials and predatory behaviors. The following content and conduct are strictly prohibited on Sambodhi Sarang across profiles, photographs, biodata files, chat messages, and all platform communication:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <UserX className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Child Sexual Abuse Material (CSAM):</strong>
                <span className="text-slate-600">Creating, uploading, sharing, storing, or distributing any visual, digital, AI-generated, or photographic depictions of child sexual abuse, child nudity, or exploitation.</span>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Sexual Exploitation & Grooming:</strong>
                <span className="text-slate-600">Any sexual exploitation, grooming, solicitation, coercion, or abuse of minors, or attempting to establish inappropriate contact with or regarding children.</span>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Endangering or Sexually Targeting Children:</strong>
                <span className="text-slate-600">Any attempt to use the platform to harm, exploit, or sexually target a child, including facilitating underage betrothal or child marriage.</span>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5">
              <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block mb-0.5">Child Trafficking & Illicit Facilitation:</strong>
                <span className="text-slate-600">Any content, transaction, or conduct that facilitates child trafficking, forced child union, or commercial exploitation of minors.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Reporting Child Safety Concerns */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              3
            </div>
            <h2>Reporting Child Safety Concerns</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Sambodhi Sarang provides multiple accessible methods to report suspected child exploitation, abusive content, grooming, or child safety concerns:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-brand-lightBg rounded-2xl border border-brand-rose/20 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs">
                A
              </div>
              <h4 className="font-bold text-brand-plum">In-App Report Buttons</h4>
              <p className="text-gray-600 leading-relaxed">
                Click the <strong>Report</strong> button directly on any candidate profile, photo viewer, or private chat message. Select "Child Safety / Underage Account" for instant triage.
              </p>
            </div>

            <div className="p-4 bg-brand-lightBg rounded-2xl border border-brand-rose/20 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs">
                B
              </div>
              <h4 className="font-bold text-brand-plum">Public Incident Reporting Form</h4>
              <p className="text-gray-600 leading-relaxed">
                Use the <a href="#report-form" className="text-rose-600 underline font-bold">Public Incident Form</a> at the bottom of this page. It is accessible 24/7 without requiring login or an account.
              </p>
            </div>

            <div className="p-4 bg-brand-lightBg rounded-2xl border border-brand-rose/20 space-y-1.5">
              <div className="w-7 h-7 rounded-lg bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs">
                C
              </div>
              <h4 className="font-bold text-brand-plum">Direct Safety Contact</h4>
              <p className="text-gray-600 leading-relaxed">
                Contact our verified administrative support directly via phone at <strong>+91 9823425404</strong> or email at <strong>pk9823425404@gmail.com</strong>.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-950 flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Urgent / Immediate Danger Notice:</strong> If you believe a child is in immediate physical danger, being actively abused, or at risk of harm, please immediately contact your local emergency police helpline (<strong>112</strong> in India) or the National Cyber Crime Helpline (<strong>1930</strong> / <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-bold text-red-800">cybercrime.gov.in</a>).
            </div>
          </div>
        </section>

        {/* Section 4: Investigation and Enforcement */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <h2>Investigation and Enforcement</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            All reports of child exploitation or safety concerns are assigned critical priority in our administrative moderation system and reviewed promptly by designated bureau administrators.
          </p>
          <div className="space-y-2.5 text-xs text-gray-700">
            <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Immediate Content Removal:</strong> Any photograph, document, text, or profile content that violates our child safety standards is purged immediately from the live platform and storage buckets.
              </div>
            </div>
            <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Account Restriction and Permanent Termination:</strong> Accounts confirmed to be in violation are immediately suspended, permanently banned, and prevented from re-registering.
              </div>
            </div>
            <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Evidence Preservation:</strong> Where legally appropriate and required for statutory investigations, relevant records, transmission logs, and identifiers are preserved in secure audit files to support law enforcement inquiries.
              </div>
            </div>
            <div className="flex items-start space-x-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Reporting to Authorities:</strong> Suspected illegal activity, CSAM, and child exploitation are escalated directly to appropriate statutory law enforcement bodies.
              </div>
            </div>
          </div>
        </section>

        {/* Section 5: Cooperation With Authorities */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              5
            </div>
            <h2>Cooperation With Authorities</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Sambodhi Sarang Matrimony is committed to cooperating fully with competent judicial, statutory, and law enforcement authorities in the investigation and prosecution of child sexual abuse, exploitation, and related crimes.
          </p>
          <div className="p-4 bg-slate-100 rounded-2xl border border-slate-300 text-xs text-slate-800 space-y-2">
            <div className="font-bold flex items-center space-x-1.5 text-slate-900">
              <Scale className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Statutory Escalation & Reporting Framework</span>
            </div>
            <p className="leading-relaxed">
              We comply with applicable child safety laws and mandatory reporting obligations, including Section 19 of the POCSO Act (Protection of Children from Sexual Offences) and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules. Suspected incidents are reported to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium pl-2">
              <li><strong>National Cyber Crime Reporting Portal:</strong> <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline font-bold">cybercrime.gov.in</a> (Helpline: <strong>1930</strong>)</li>
              <li><strong>Emergency Police Helpline:</strong> <strong>112</strong></li>
              <li><strong>Maharashtra Cyber Police & Local Jurisdiction:</strong> Kolhapur District Police & Cyber Crime Cell</li>
            </ul>
          </div>
        </section>

        {/* Section 6: Prevention and Ongoing Review */}
        <section className="space-y-3">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              6
            </div>
            <h2>Prevention and Ongoing Review</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Sambodhi Sarang actively reviews child safety concerns and its safety practices periodically and takes reasonable, proactive steps to prevent misuse of the platform:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-gray-700 pl-2">
            <li><strong>Mandatory Date of Birth Verification:</strong> Registration forms enforce strict age calculations ensuring only adult members (18+ for females, 21+ for males) can register.</li>
            <li><strong>Manual Profile Screening:</strong> Candidate biodata and profile photographs undergo administrative review prior to profile verification.</li>
            <li><strong>Periodic Policy Audits:</strong> Safety guidelines, terms of use, and reporting pipelines are reviewed regularly to align with updated industry standards and statutory guidelines.</li>
            <li><strong>Staff & Moderator Training:</strong> Bureau administration personnel are trained to recognize, prioritize, and escalate child safety and grooming indicators immediately.</li>
          </ul>
        </section>

        {/* Section 7: Contact Information */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2.5 text-brand-plum font-serif font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-xl bg-brand-plum/10 text-brand-plum flex items-center justify-center font-bold text-xs shrink-0">
              7
            </div>
            <h2>Contact Information</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            For questions, statutory notices, regulatory inquiries, or reports concerning child safety standards on Sambodhi Sarang, please contact our verified administrative grievance office:
          </p>

          <div className="bg-gradient-to-r from-slate-50 to-brand-lightBg p-5 sm:p-6 rounded-2xl border border-brand-rose/30 space-y-4">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-sm sm:text-base text-brand-plum">
                Sambodhi Sarang Marriage Bureau — Safety & Grievance Office
              </h4>
              <p className="text-xs text-gray-600">
                Designated point of contact for Child Safety Standards and regulatory compliance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start space-x-2.5">
                <Phone className="w-4 h-4 text-brand-plum shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase">Official Support Phone</span>
                  <a href="tel:+919823425404" className="font-bold text-slate-800 text-xs hover:text-brand-plum">
                    +91 9823425404
                  </a>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-start space-x-2.5">
                <Mail className="w-4 h-4 text-brand-plum shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="text-[11px] text-gray-400 block font-bold uppercase">Designated Monitored Email</span>
                  <a href="mailto:pk9823425404@gmail.com" className="font-mono text-xs text-brand-plum font-semibold break-all hover:underline">
                    pk9823425404@gmail.com
                  </a>
                  <span className="text-[10px] text-gray-500 block mt-0.5">
                    (Actively monitored for safety and grievance concerns)
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 p-3 bg-white rounded-xl border border-slate-200 flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-brand-plum shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] text-gray-400 block font-bold uppercase">Registered Bureau Address</span>
                  <span className="font-medium text-slate-800">
                    Sambodhi Sarang Marriage Bureau, Ichalkaranji, Kolhapur District, Maharashtra, India
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 8: Public Child Safety Incident Reporting Form */}
        <section className="space-y-4 pt-6 border-t border-gray-100" id="report-form">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-rose-100 text-rose-800 px-3 py-0.5 rounded-full text-xs font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Public Incident Reporting Form</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-plum">
              Submit an Urgent Child Safety Report (तात्काळ बाल सुरक्षा तक्रार)
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Anyone, including non-registered visitors, family members, and parents, can report a suspected child safety violation through this form. Reports are transmitted directly with critical priority to our moderation team.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="font-serif font-bold text-base text-emerald-900">
                Child Safety Report Received Successfully
              </h4>
              <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed">
                Thank you for helping us protect minors. Your report has been dispatched to our priority administrative queue for immediate inspection. If there is immediate physical danger to a child, please also contact the National Emergency Helpline (112) or Cyber Crime Helpline (1930).
              </p>
              <button
                type="button"
                onClick={() => setSubmittedSuccess(false)}
                className="px-4 py-2 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-800 transition-all cursor-pointer"
              >
                Submit Another Report
              </button>
            </div>
          ) : (
            <form onSubmit={handlePublicReportSubmit} className="bg-slate-50 p-5 sm:p-7 rounded-2xl border border-slate-200 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Your Name (Optional / Anonymous if preferred)
                  </label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="e.g. Concerned Parent or Anonymous"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Your Email or Mobile Number (For updates)
                  </label>
                  <input
                    type="text"
                    value={reporterContact}
                    onChange={(e) => setReporterContact(e.target.value)}
                    placeholder="e.g. parent@example.com or 9822000000"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Offending Profile ID, Name, or Link <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={targetIdOrUrl}
                    onChange={(e) => setTargetIdOrUrl(e.target.value)}
                    placeholder="e.g. SS-1025 or candidate name or URL"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Nature of Violation / तक्रारीचा प्रकार <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={violationCategory}
                    onChange={(e) => setViolationCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                  >
                    <option value="csae_csam">Child Sexual Abuse Material (CSAM) / CSAE</option>
                    <option value="underage_minor">Underage Account / Candidate Below Legal Age</option>
                    <option value="grooming_solicitation">Grooming / Exploitation / Solicitations</option>
                    <option value="inappropriate_media">Inappropriate Media Involving a Minor</option>
                    <option value="other_child_safety">Other Minor Safety & Welfare Violation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Incident Details & Evidence Description <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={incidentDetails}
                  onChange={(e) => setIncidentDetails(e.target.value)}
                  placeholder="Please describe the violation in detail, including what was observed, where on the profile/chat it occurred, and any supporting facts..."
                  className="w-full p-3.5 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <span className="text-[11px] text-gray-500">
                  🔒 Reports are confidential and reviewed under high priority by bureau administration.
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Urgent Report...' : 'Submit Child Safety Report'}</span>
                </button>
              </div>
            </form>
          )}
        </section>

      </article>

    </div>
  );
};
