import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, X, Lock, ShieldAlert, Ban } from 'lucide-react';
import { CURRENT_TERMS_VERSION } from '../../utils/termsEnforcement';

export const TermsAcceptanceModal = ({
  isOpen,
  onClose,
  onAccept,
  onNavigate,
  actionTitle = 'Upload Photo or Biodata'
}) => {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setAgreed(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!agreed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAccept(CURRENT_TERMS_VERSION);
      onClose();
    } catch (err) {
      console.error('Error accepting terms:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-rose-100 space-y-5 max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terms-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-plum to-rose-700 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 id="terms-modal-title" className="font-serif font-bold text-base sm:text-lg text-brand-plum">
                Community Safety & Content Rules
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                Mandatory agreement before you {actionTitle.toLowerCase()}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Rules Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs text-brand-charcoal">
          
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 text-rose-950 space-y-1.5">
            <div className="font-bold text-[11px] text-rose-800 flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Strict Rules for Profiles, Photos & Uploaded Content</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-900">
              Sambodhi Sarang maintains a family-friendly, dignified matrimonial service. To protect all candidates and families, you must confirm adherence to these safety standards:
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-rose-600 font-bold shrink-0 text-sm">❌</span>
              <div>
                <strong className="text-slate-900 block font-semibold text-xs">No Fake Profiles or Impersonation</strong>
                <p className="text-[11px] text-gray-600 leading-snug">All photos and personal details must be authentic and accurately represent you. Celebrity, third-party, or misattributed photos are prohibited.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-rose-600 font-bold shrink-0 text-sm">❌</span>
              <div>
                <strong className="text-slate-900 block font-semibold text-xs">No Inappropriate, Nude or Obscene Media</strong>
                <p className="text-[11px] text-gray-600 leading-snug">Photos must be modest, clear personal portraits. Provocative, vulgar, watermarked, or copyrighted content will be deleted immediately.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-rose-600 font-bold shrink-0 text-sm">❌</span>
              <div>
                <strong className="text-slate-900 block font-semibold text-xs">No Scams, Loans or Financial Solicitation</strong>
                <p className="text-[11px] text-gray-600 leading-snug">Asking members for money, bank transfers, cryptocurrency, gifts, or commercial favors is strictly prohibited.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-rose-600 font-bold shrink-0 text-sm">❌</span>
              <div>
                <strong className="text-slate-900 block font-semibold text-xs">No Harassment, Stalking or Abusive Messages</strong>
                <p className="text-[11px] text-gray-600 leading-snug">Treat candidates and families with respect. Unwanted, aggressive, or defamatory communication will not be tolerated.</p>
              </div>
            </div>

            <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-red-50/70 border border-red-200">
              <span className="text-red-700 font-bold shrink-0 text-sm">🚨</span>
              <div>
                <strong className="text-red-950 block font-semibold text-xs">Zero-Tolerance for Underage Users & Child Exploitation</strong>
                <p className="text-[11px] text-red-900 leading-snug">Registration is strictly 18+. Child sexual abuse material (CSAM), exploitation (CSAE), or grooming will lead to immediate account banning and mandatory reporting to law enforcement (POCSO & cybercrime.gov.in / 1930).</p>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 leading-relaxed pt-1">
            Violations will result in immediate content removal, account suspension without refund, and potential legal action under Indian law.
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-gray-100 text-[11px]">
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('/terms-of-service');
              }}
              className="text-brand-plum font-bold hover:underline inline-flex items-center space-x-1"
            >
              <FileText className="w-3.5 h-3.5 text-brand-plum" />
              <span>Read Full Terms of Use (v{CURRENT_TERMS_VERSION})</span>
            </button>
            <span className="text-gray-300">•</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('/child-safety');
              }}
              className="text-rose-700 font-bold hover:underline inline-flex items-center space-x-1"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Read Child Safety Standards</span>
            </button>
          </div>

        </div>

        {/* Checkbox & Buttons */}
        <div className="pt-3 border-t border-gray-100 space-y-3 shrink-0">
          <label className="flex items-start space-x-2.5 cursor-pointer p-2.5 bg-brand-lightBg/60 rounded-xl border border-brand-rose/20">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded text-brand-plum focus:ring-brand-plum w-4 h-4 cursor-pointer shrink-0"
            />
            <span className="text-[11px] text-gray-800 font-medium leading-relaxed">
              I have read, understood, and explicitly agree to the Sambodhi Sarang <strong>Terms of Use</strong> and <strong>Community Safety Rules</strong>. I confirm my uploaded content is genuine and compliant.
            </span>
          </label>

          <div className="flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!agreed || isSubmitting}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center space-x-1.5 ${
                agreed && !isSubmitting
                  ? 'bg-gradient-to-r from-brand-plum to-rose-700 hover:from-brand-plumDark hover:to-rose-800 cursor-pointer hover:scale-102'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-brand-gold" />
              <span>{isSubmitting ? 'Recording Acceptance...' : 'Accept & Proceed'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
