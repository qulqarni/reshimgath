import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trash2, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Send,
  HelpCircle
} from 'lucide-react';
import { submitAccountDeletionRequest } from '../services/firebaseService';

export const AccountDeletionPage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    memberId: user?.regId || user?.id || '',
    reason: 'marriage_fixed',
    customReason: '',
    confirmedCheckbox: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.fullName.trim()) {
      setError('Please provide your full registered name.');
      return;
    }

    if (!formData.phone.trim() && !formData.email.trim()) {
      setError('Please provide either your registered phone number or email address so we can identify your account.');
      return;
    }

    if (!formData.confirmedCheckbox) {
      setError('Please check the confirmation box acknowledging permanent data deletion.');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedId = `del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const result = await submitAccountDeletionRequest({
        id: generatedId,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        memberId: formData.memberId.trim(),
        reason: formData.reason,
        customReason: formData.customReason.trim(),
        userId: user?.id || null,
        source: 'public_web',
        status: 'pending',
        requestedAt: new Date().toISOString()
      });

      if (result) {
        setRequestId(generatedId);
        setSubmitted(true);
      } else {
        setError('Failed to submit deletion request. Please try again or contact support.');
      }
    } catch (err) {
      console.error('Account deletion submission error:', err);
      setError('An unexpected error occurred. Please contact our helpline directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('/')}
          className="p-2 rounded-xl border border-gray-200 text-brand-charcoal hover:bg-brand-lightBg transition-colors"
          title="Back to Home"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-semibold text-brand-gold uppercase tracking-wider">User Rights & Compliance</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-plum">
            Account & Data Deletion Request
          </h1>
          <p className="text-xs sm:text-sm text-brand-gray">
            खाते आणि वैयक्तिक माहिती हटविण्याची विनंती (Sambodhi Sarang Matrimony)
          </p>
        </div>
      </div>

      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-rose/20 shadow-luxury space-y-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-brand-charcoal">
              Right to Erasure & Account Deletion Policy
            </h2>
            <p className="text-xs sm:text-sm text-brand-gray leading-relaxed">
              At Sambodhi Sarang Marriage Bureau, you retain absolute ownership over your personal data. In full compliance with Google Play Developer Policies, the Indian Information Technology Act, and Digital Personal Data Protection (DPDP) standards, you can request the permanent removal of your account, photos, biodata, and chat history at any time.
            </p>
          </div>
        </div>

        {/* Logged in fast-track notice */}
        {user && (
          <div className="bg-amber-50 rounded-2xl p-4 sm:p-5 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-950">
                <p className="font-bold">You are currently logged in as {user.name} ({user.phone || user.email})</p>
                <p className="text-amber-800">You can delete your account instantly and automatically from Settings without waiting for manual verification.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('/settings')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all"
            >
              Go to Instant Deletion
            </button>
          </div>
        )}

        {/* Detailed deletion & retention breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Data that will be permanently deleted */}
          <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 space-y-3">
            <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
              <h3>Data That Will Be Permanently Deleted</h3>
            </div>
            <ul className="text-xs text-rose-950 space-y-2 font-medium">
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Profile Demographics:</strong> Full name, birthdate, caste, sub-caste, education, occupation, and family background.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Photographs:</strong> Primary avatar and all additional photos uploaded to your gallery.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Biodata Documents:</strong> Uploaded PDF biodata files and scanned document pages.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Interactions:</strong> Direct messages, conversations, and mutual interest requests.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Contact Details:</strong> Phone numbers, WhatsApp numbers, and email associations removed from candidate lists.</span>
              </li>
            </ul>
          </div>

          {/* Data retained and legal rationale */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0" />
              <h3>Data Retained & Statutory Requirements</h3>
            </div>
            <ul className="text-xs text-slate-700 space-y-2">
              <li className="flex items-start space-x-2">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>Statutory Security Logs:</strong> Basic account creation/deletion timestamps and access logs are retained for up to 180 days in accordance with the Indian Information Technology (IT) Rules, 2021 and CERT-In directives.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>Financial & Invoicing Records:</strong> If a premium membership was purchased, GST invoicing records and payment transaction reference IDs are retained under Indian Tax & GST statutes.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-slate-500 font-bold">•</span>
                <span><strong>Safety & Law Enforcement:</strong> In cases involving active law enforcement inquiries or reported child safety violations, records are preserved under applicable legal statutes (such as the POCSO Act).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Turnaround Time Info */}
        <div className="flex items-center space-x-3 bg-brand-lightBg p-4 rounded-2xl border border-brand-rose/20 text-xs text-brand-charcoal">
          <Clock className="w-5 h-5 text-brand-plum shrink-0" />
          <div>
            <strong>Processing Timeline:</strong> In-app deletions take effect immediately. Web-based deletion requests are verified and permanently executed within <strong>24 to 48 hours</strong>.
          </div>
        </div>
      </div>

      {/* Submission Form Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-rose/20 shadow-luxury space-y-6">
        <div className="space-y-1">
          <h2 className="font-serif font-bold text-lg text-brand-plum">
            Submit Public Account Deletion Request
          </h2>
          <p className="text-xs text-brand-gray">
            Please enter the registered credentials associated with your Sambodhi Sarang profile.
          </p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-lg text-emerald-900">
                Deletion Request Submitted Successfully!
              </h3>
              <p className="text-xs text-emerald-800">
                Your request ID is <span className="font-mono font-bold bg-emerald-200/60 px-2 py-0.5 rounded">{requestId}</span>.
              </p>
              <p className="text-xs text-emerald-700 max-w-md mx-auto pt-2">
                Our verification team will process your request and delete your profile and media within 24 to 48 hours. A confirmation SMS or email will be sent upon completion.
              </p>
            </div>
            <button
              onClick={() => onNavigate('/')}
              className="px-6 py-2.5 bg-brand-plum text-white font-bold text-xs rounded-xl shadow-xs hover:bg-brand-plumDark transition-all"
            >
              Return to Homepage
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Registered Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Ramesh Patil"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Registered Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9823425404"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. candidate@gmail.com"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Member ID / Profile ID (Optional)
                </label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  placeholder="e.g. SS-2026-0042"
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                Reason for Account Deletion
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none bg-white"
              >
                <option value="marriage_fixed">Marriage Fixed through Sambodhi Sarang (लग्न जमले - अभिनंदन!)</option>
                <option value="marriage_fixed_outside">Marriage Fixed through Other Means (इतर माध्यमातून लग्न जमले)</option>
                <option value="privacy_concern">Privacy / Personal Preference (वैयक्तिक कारण)</option>
                <option value="temporary_break">Taking a Temporary Break from Matchmaking (काही काळ थांबायचे आहे)</option>
                <option value="other">Other Reason (इतर)</option>
              </select>
            </div>

            {formData.reason === 'other' && (
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                  Please specify your reason
                </label>
                <textarea
                  name="customReason"
                  rows="2"
                  value={formData.customReason}
                  onChange={handleChange}
                  placeholder="Briefly describe why you wish to delete your account..."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none"
                />
              </div>
            )}

            <div className="pt-2">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="confirmedCheckbox"
                  checked={formData.confirmedCheckbox}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 w-4 h-4 shrink-0"
                />
                <span className="text-xs text-brand-gray leading-relaxed">
                  I confirm that I am the authorized owner or guardian of this profile. I understand that account deletion is <strong>permanent and irreversible</strong>, and that all my profile data, photos, biodata, and messages will be permanently erased.
                </span>
              </label>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <span>Submitting Deletion Request...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Deletion Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Support Contact Information */}
      <div className="bg-brand-lightBg p-6 rounded-3xl border border-brand-rose/20 text-xs space-y-3">
        <h3 className="font-serif font-bold text-sm text-brand-plum">
          Need Assistance with Account Deletion?
        </h3>
        <p className="text-brand-gray">
          If you are unable to access your registered phone number or email, our Grievance Officer can assist you with manual identity verification:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-brand-charcoal font-medium">
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-brand-plum shrink-0" />
            <span>Grievance Helpline: +91 9823425404</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-brand-plum shrink-0" />
            <span>Email: pk9823425404@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
