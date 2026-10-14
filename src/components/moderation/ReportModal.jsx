import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ShieldAlert, X, AlertTriangle, CheckCircle2, Image as ImageIcon, MessageSquare, User, Flag } from 'lucide-react';
import { useProfiles } from '../../context/ProfileContext';

export const REASON_OPTIONS = {
  profile: [
    'Fake profile / Impersonation (खोटे प्रोफाइल किंवा दुसऱ्याची माहिती)',
    'Inappropriate / Offensive details (अयोग्य किंवा अपमानास्पद माहिती)',
    'Underage or Ineligible (विवाहास अपात्र किंवा वय कमी)',
    'Commercial, Scam or Financial Demands (व्यावसायिक किंवा पैशांची मागणी)',
    'Harassment or Stalking (त्रास देणे किंवा पाठलाग)',
    'Other violation (इतर तक्रार)'
  ],
  photo: [
    'Inappropriate or vulgar photo (अयोग्य किंवा अश्लील फोटो)',
    'Not their own photo / Celebrity photo (स्वतःचा फोटो नाही / सेलिब्रिटी फोटो)',
    'Blurry, fake or misleading photo (अस्पष्ट किंवा दिशाभूल करणारा फोटो)',
    'Copyright or privacy violation (कॉपीराइट किंवा गोपनीयतेचे उल्लंघन)',
    'Other photo issue (इतर समस्या)'
  ],
  message: [
    'Abusive, vulgar or disrespectful language (अश्लील किंवा अपमानकारक भाषा)',
    'Harassment or unwanted continuous messages (त्रासदायक सतत मेसेजेस)',
    'Financial fraud / asking for money (पैशांची मागणी किंवा फसवणूक)',
    'Asking for inappropriate photos inappropriately (अयोग्य फोटो किंवा संपर्क मागणी)',
    'Spam / Commercial advertising (स्पॅम / जाहिरात)',
    'Other message violation (इतर तक्रार)'
  ]
};

export const ReportModal = ({
  isOpen,
  onClose,
  targetType = 'profile', // 'profile' | 'photo' | 'message'
  targetUser = null,
  evidence = null
}) => {
  const { submitReport, addToast } = useProfiles();
  const reasons = REASON_OPTIONS[targetType] || REASON_OPTIONS.profile;

  const [selectedReason, setSelectedReason] = useState(reasons[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      addToast('Please select a reason for reporting.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReport({
        targetType,
        targetUserId: targetUser?.id || evidence?.senderId,
        targetName: targetUser?.name || 'Member',
        targetRegId: targetUser?.regId || (targetUser?.registrationId ? `SS-${targetUser.registrationId}` : ''),
        reason: selectedReason,
        details,
        evidence
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit report:', err);
      addToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalTitle = 
    targetType === 'photo' ? 'Report Profile Photo' :
    targetType === 'message' ? 'Report Private Message' :
    'Report Member Profile';

  const modalSubtitle =
    targetType === 'photo' ? 'Report an inappropriate, fake, or copyrighted photo to Sambodhi Sarang administration.' :
    targetType === 'message' ? 'Report abusive, harassing, or fraudulent private messages to administration.' :
    'Help us keep Sambodhi Sarang safe, respectful, and genuine by reporting suspicious activity.';

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-rose-200/80 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <ShieldAlert className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-plum">
                {modalTitle}
              </h3>
              <p className="text-[11px] sm:text-xs text-brand-gray">
                तक्रार नोंदवा (Confidential Report)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-brand-plum hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-brand-charcoal leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
          {modalSubtitle} Your report is strictly confidential and visible only to authorized bureau administrators.
        </p>

        {/* Evidence preview card */}
        <div className="bg-brand-lightBg/50 p-3.5 rounded-2xl border border-brand-rose/20 space-y-2">
          <div className="text-[11px] font-bold text-brand-plum uppercase tracking-wider flex items-center space-x-1.5">
            {targetType === 'photo' ? <ImageIcon className="w-3.5 h-3.5" /> :
             targetType === 'message' ? <MessageSquare className="w-3.5 h-3.5" /> :
             <User className="w-3.5 h-3.5" />}
            <span>Reporting: {targetUser?.name || 'Member'} {targetUser?.regId ? `(${targetUser.regId})` : ''}</span>
          </div>

          {targetType === 'photo' && evidence?.photoUrl && (
            <div className="flex items-center space-x-3 pt-1">
              <img
                src={evidence.photoUrl}
                alt="Reported content"
                className="w-16 h-16 rounded-xl object-cover border border-rose-300 shrink-0"
              />
              <span className="text-xs text-brand-gray italic">
                Photo selected for review by administration.
              </span>
            </div>
          )}

          {targetType === 'message' && evidence?.text && (
            <div className="bg-white p-2.5 rounded-xl border border-rose-200 text-xs text-brand-charcoal italic">
              "{evidence.text}"
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-2">
              Select Reason / तक्रारीचे कारण <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {reasons.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-start space-x-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-rose-50/80 border-rose-300 text-brand-plum font-semibold ring-1 ring-rose-300'
                      : 'border-gray-200 hover:bg-gray-50 text-brand-charcoal'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span className="leading-snug">{reason}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
              Additional Details / अधिक माहिती (Optional)
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide any additional context or details that will help our moderation team review this report..."
              className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-medium text-brand-charcoal focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-brand-charcoal font-semibold text-xs hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 border border-rose-700 disabled:opacity-50"
            >
              <Flag className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
