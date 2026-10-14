import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Ban, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProfiles } from '../../context/ProfileContext';

export const BlockConfirmModal = ({
  isOpen,
  onClose,
  targetProfile,
  onSuccess
}) => {
  const { blockUser } = useAuth();
  const { addToast } = useProfiles();
  const [isBlocking, setIsBlocking] = useState(false);

  if (!isOpen || !targetProfile) return null;

  const handleConfirmBlock = async () => {
    setIsBlocking(true);
    try {
      await blockUser(targetProfile);
      addToast(`${targetProfile.name || 'Member'} has been blocked.`, 'info');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error blocking user:', err);
      addToast('Failed to block user. Please try again.', 'error');
    } finally {
      setIsBlocking(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-rose-200 text-left my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
              <Ban className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-plum">
                Block {targetProfile.name}?
              </h3>
              <p className="text-xs text-brand-gray">
                सदस्याला ब्लॉक करा ({targetProfile.regId || `SS-${targetProfile.registrationId || targetProfile.id}`})
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

        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-100 space-y-2 text-xs text-brand-charcoal">
          <p className="font-semibold text-rose-900 flex items-center space-x-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>When you block this member:</span>
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 pl-1">
            <li>They cannot send you messages or view your contact details.</li>
            <li>They cannot express interest or see your active status.</li>
            <li>You will not receive any notifications from this member.</li>
            <li>You can unblock them at any time from Settings &gt; Blocked Members.</li>
          </ul>
        </div>

        <div className="flex gap-2.5 pt-2">
          <button
            type="button"
            disabled={isBlocking}
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-brand-charcoal font-semibold text-xs hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isBlocking}
            onClick={handleConfirmBlock}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 border border-rose-700 disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            <span>{isBlocking ? 'Blocking...' : 'Block Member'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
