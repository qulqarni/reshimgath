import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfiles } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, AlertTriangle, ArrowLeft, Ban, Shield, ExternalLink, CheckCircle2 } from 'lucide-react';
import { deleteUserAccount } from '../services/firebaseService';

export const SettingsPage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { deleteProfile, addToast } = useProfiles();
  const { t } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionReason, setDeletionReason] = useState('marriage_fixed');
  const [confirmedAcknowledged, setConfirmedAcknowledged] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!confirmedAcknowledged) {
      alert('Please check the confirmation box to proceed with account deletion.');
      return;
    }

    setIsDeleting(true);
    try {
      const userId = user.id || user.uid;
      // 1. Comprehensive backend deletion: Firestore profile, Storage photos/biodata, interests, notifications
      await deleteUserAccount(userId, {
        reason: deletionReason,
        requestedBy: 'user'
      });

      // 2. Clear client ProfileContext state & storage
      if (userId) {
        await deleteProfile(userId);
      }

      // 3. Clear auth state and notify user
      logout();
      setShowConfirmModal(false);
      addToast('Your Sambodhi Sarang account and personal data have been permanently deleted.', 'info');
      onNavigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again or contact bureau support.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-28 md:pb-12 space-y-6">
      {/* Back button & Heading */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onNavigate('/my-profile')}
          className="p-2 rounded-xl border border-gray-200 text-brand-charcoal hover:bg-brand-lightBg transition-colors"
          title="Back to Profile"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-plum">Account Settings</h1>
          <p className="text-xs text-brand-gray">Manage account settings, privacy, and preferences.</p>
        </div>
      </div>

      {/* Privacy & Safety: Blocked Members Card */}
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-brand-plum flex items-center justify-center shrink-0 border border-amber-200/60">
            <Ban className="w-5 h-5 text-rose-500" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-serif font-bold text-base text-brand-plum">Privacy & Safety: Blocked Members</h3>
            <p className="text-xs text-brand-gray leading-relaxed">
              Review and manage members you have blocked. Blocked members cannot see your profile, send you messages, or send connection interests.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/blocked-users')}
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
          >
            <Ban className="w-4 h-4 text-brand-gold" />
            <span>Manage Blocked Members</span>
          </button>
        </div>
      </div>

      {/* Privacy Policy & Public Data Deletion Portal */}
      <div className="bg-white rounded-3xl border border-brand-rose/20 shadow-luxury p-6 sm:p-8 space-y-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-lightBg text-brand-plum flex items-center justify-center shrink-0 border border-brand-rose/20">
            <Shield className="w-5 h-5 text-brand-plum" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="font-serif font-bold text-base text-brand-plum">Privacy Rights & Public Deletion</h3>
            <p className="text-xs text-brand-gray leading-relaxed">
              Sambodhi Sarang strictly respects your privacy. You can review our detailed Privacy Policy or access our public web deletion resource at any time.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={() => onNavigate('/privacy-policy')}
            className="px-4 py-2 border border-brand-plum/20 hover:bg-brand-lightBg text-brand-plum font-semibold text-xs rounded-xl transition-all"
          >
            Privacy Policy
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/delete-account')}
            className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <span>Public Deletion Web Form</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Danger Zone: Permanent Account Deletion */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-luxury p-6 sm:p-8 space-y-5">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-rose-900">Danger Zone: Delete Account</h3>
            <p className="text-xs text-brand-gray leading-relaxed">
              Permanently delete your profile, biodata, photos, messages, and account credentials from Sambodhi Sarang Marriage Bureau. This action is instantaneous and irreversible.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-rose-100">
          <button
            type="button"
            onClick={() => {
              setConfirmedAcknowledged(false);
              setShowConfirmModal(true);
            }}
            className="w-full sm:w-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-rose-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete my Sambodhi Sarang Account</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-rose-200 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">
                Permanently Delete Your Account?
              </h3>
              <p className="text-xs text-brand-gray leading-relaxed">
                This action is <strong>irreversible</strong>. The following data will be permanently wiped immediately:
              </p>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100 text-xs text-rose-950 space-y-1.5 font-medium">
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Profile biodata and personal demographics</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Avatar and uploaded photo gallery</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Biodata PDF and scanned documents</span>
              </p>
              <p className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Direct messages and mutual interest requests</span>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-charcoal">
                Please tell us why you are leaving (Optional):
              </label>
              <select
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-brand-plum focus:ring-1 focus:ring-brand-plum outline-none bg-white"
              >
                <option value="marriage_fixed">Marriage Fixed via Sambodhi Sarang (लग्न जमले!)</option>
                <option value="marriage_fixed_outside">Marriage Fixed Elsewhere (इतर माध्यमातून लग्न जमले)</option>
                <option value="privacy_concern">Privacy / Personal Preference</option>
                <option value="temporary_break">Taking a Break from Matchmaking</option>
                <option value="other">Other Reason</option>
              </select>
            </div>

            <div className="pt-1">
              <label className="flex items-start space-x-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedAcknowledged}
                  onChange={(e) => setConfirmedAcknowledged(e.target.checked)}
                  className="mt-0.5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 w-4 h-4 shrink-0"
                />
                <span className="text-xs text-brand-gray leading-relaxed">
                  I understand that this action is permanent and cannot be undone. All my profile details, media, and chats will be immediately destroyed.
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-brand-charcoal font-semibold text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting || !confirmedAcknowledged}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
