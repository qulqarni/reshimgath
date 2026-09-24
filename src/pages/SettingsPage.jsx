import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProfiles } from '../context/ProfileContext';
import { useLanguage } from '../context/LanguageContext';
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';

export const SettingsPage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { deleteProfile } = useProfiles();
  const { t } = useLanguage();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      if (user.id) {
        await deleteProfile(user.id);
      }
      logout();
      onNavigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('Failed to delete account. Please try again.');
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
          <p className="text-xs text-brand-gray">Manage account settings and permanent data deletion.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-rose-100 shadow-luxury p-6 sm:p-8 space-y-5">
        <div className="flex items-start space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/60">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-base text-rose-900">Danger Zone: Delete Account</h3>
            <p className="text-xs text-brand-gray leading-relaxed">
              Permanently delete your profile, biodata, photos, messages, and account credentials from Sambodhi Sarang Marriage Bureau. This action is irreversible.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-rose-100">
          <button
            type="button"
            onClick={() => setShowConfirmModal(true)}
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-bold text-brand-charcoal">
                Are you absolutely sure?
              </h3>
              <p className="text-xs text-brand-gray leading-relaxed">
                Deleting your account will permanently wipe your profile information, registered biodata, uploaded photographs, and active chat history. You will not be able to recover this profile once deleted.
              </p>
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
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
              >
                {isDeleting ? (
                  <span>Deleting...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete Account</span>
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
