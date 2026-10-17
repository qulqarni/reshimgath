import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ExternalLink } from 'lucide-react';
import { useProfiles } from '../../context/ProfileContext';

/**
 * SiteAnnouncementModal
 * Displays an admin-configured promotional / announcement popup image when visitors open the site.
 * Includes a prominent cancel/close button, keyboard Escape handling, backdrop dismissal,
 * and remembers dismissal for the current browsing session to avoid repetitive interruptions.
 */
export const SiteAnnouncementModal = ({ 
  onNavigate, 
  forceOpen = false, 
  overrideContent = null, 
  onClose = null 
}) => {
  const { homeContent } = useProfiles();
  const popupConfig = overrideContent || homeContent?.popupAd;

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If admin is previewing via forceOpen
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    // Normal visitor logic
    const isEnabled = Boolean(popupConfig?.enabled);
    const imageUrl = popupConfig?.imageUrl;

    if (!isEnabled || !imageUrl) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in this session for this specific image version
    const dismissalKey = `dismissed_popup_${popupConfig?.updatedAt || imageUrl}`;
    const wasDismissed = sessionStorage.getItem(dismissalKey);

    if (!wasDismissed) {
      // Small 500ms delay so page mounts smoothly before presenting popup
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [forceOpen, popupConfig?.enabled, popupConfig?.imageUrl, popupConfig?.updatedAt]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    if (!forceOpen && popupConfig?.imageUrl) {
      const dismissalKey = `dismissed_popup_${popupConfig?.updatedAt || popupConfig.imageUrl}`;
      try {
        sessionStorage.setItem(dismissalKey, 'true');
      } catch (e) {}
    }
    if (onClose) onClose();
  };

  const handleActionClick = () => {
    const link = popupConfig?.linkUrl?.trim();
    handleDismiss();

    if (!link) return;

    if (link.startsWith('http://') || link.startsWith('https://') || link.startsWith('tel:') || link.startsWith('mailto:')) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } else if (onNavigate) {
      onNavigate(link);
    } else {
      window.location.href = link;
    }
  };

  if (!isOpen || !popupConfig?.imageUrl) return null;

  const hasLink = Boolean(popupConfig?.linkUrl?.trim());

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="Site Announcement"
    >
      {/* Modal Dialog Card */}
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-brand-rose/30 flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prominent Floating Cancel / Close Button (X) */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          title="Cancel / Close (बंद करा)"
          aria-label="Cancel and close popup"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Optional Header / Title */}
        {popupConfig.title && (
          <div className="bg-gradient-to-r from-brand-plum to-brand-maroon text-white px-5 py-3 pr-14 border-b border-brand-rose/20">
            <h3 className="font-serif font-bold text-sm sm:text-base leading-snug line-clamp-2">
              {popupConfig.title}
            </h3>
            {popupConfig.subtitle && (
              <p className="text-[11px] text-brand-rose/90 line-clamp-1 mt-0.5">
                {popupConfig.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Image Content Container */}
        <div className="relative flex-1 overflow-y-auto max-h-[70vh] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center select-none">
          {hasLink ? (
            <div 
              onClick={handleActionClick}
              className="cursor-pointer group relative w-full flex items-center justify-center"
              title="Click to explore"
            >
              <img 
                src={popupConfig.imageUrl} 
                alt={popupConfig.title || "Announcement"} 
                className="w-full h-auto max-h-[68vh] object-contain block transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center space-x-1">
                  <span>Explore</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ) : (
            <img 
              src={popupConfig.imageUrl} 
              alt={popupConfig.title || "Announcement"} 
              className="w-full h-auto max-h-[70vh] object-contain block"
            />
          )}
        </div>

        {/* Action & Dismiss Footer */}
        <div className="p-3 sm:p-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-brand-charcoal hover:bg-gray-100 font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 order-2 sm:order-1"
          >
            <X className="w-4 h-4 text-gray-500" />
            <span>Cancel / बंद करा</span>
          </button>

          {/* Optional Action / View Button */}
          {hasLink && (
            <button
              type="button"
              onClick={handleActionClick}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-plum hover:bg-brand-plumDark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              <span>{popupConfig.buttonText || 'अधिक माहिती (View Details)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
