import React from 'react';
import { createPortal } from 'react-dom';
import { 
  Eye, 
  X, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const UnlockConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  profile, 
  remainingVisits = 0,
  totalVisits = 25
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !profile) return null;

  const firstName = profile.name ? profile.name.split(' ')[0] : 'Candidate';
  const candidatePhoto = (profile.photos && profile.photos.length > 0) 
    ? profile.photos[0] 
    : (profile.avatar || null);

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[99999] overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 flex items-center justify-center">
      <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-brand-rose/30 my-auto animate-in zoom-in-95 duration-200 space-y-6 p-6 sm:p-7 relative text-center">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-brand-plum p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Candidate Photo & Info */}
        <div className="space-y-3 pt-2">
          <div className="relative w-20 h-20 mx-auto">
            {candidatePhoto ? (
              <img
                src={candidatePhoto}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-brand-plum shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-brand-plum/10 text-brand-plum font-serif font-bold text-2xl flex items-center justify-center border-2 border-brand-plum shadow-md">
                {firstName[0]}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow border-2 border-white">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-xl font-bold text-brand-plum">
              {profile.name}
            </h3>
            <p className="text-xs font-semibold text-brand-gray mt-0.5">
              Profile No. {profile.regId || `SS-${profile.registrationId || 1001}`} • {profile.district || 'Maharashtra'}
            </p>
          </div>
        </div>

        {/* Remaining Credits Counter Box */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Your Profile Visit Credits</span>
            </span>
            <span className="px-2.5 py-0.5 bg-amber-200 text-amber-950 font-extrabold rounded-full text-[11px]">
              {remainingVisits} / {totalVisits} Left
            </span>
          </div>

          <p className="text-xs text-brand-charcoal leading-relaxed pt-1">
            Do you really want to view and unlock complete profile details of <strong className="text-brand-plum">{profile.name}</strong>?
          </p>
          
          <div className="text-[11px] text-amber-800 font-medium italic flex items-center space-x-1 pt-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>1 visit credit will be deducted from your account.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-plum to-brand-plumDark text-white font-bold text-xs sm:text-sm rounded-2xl shadow-luxury hover:shadow-luxury-hover transition-all flex items-center justify-center space-x-2 border border-brand-gold/40"
          >
            <UserCheck className="w-4 h-4 text-brand-gold" />
            <span>Confirm & Unlock Profile (1 Credit)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gray-100 text-brand-charcoal font-bold text-xs rounded-2xl hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
