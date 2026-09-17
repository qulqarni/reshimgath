import React from 'react';

export const WatermarkOverlay = ({ size = 'medium', className = '' }) => {
  let sizeClasses = 'w-32 sm:w-44';

  if (size === 'small') {
    sizeClasses = 'w-14 sm:w-20';
  } else if (size === 'large') {
    sizeClasses = 'w-48 sm:w-72';
  }

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Watermark"
        className={`${sizeClasses} h-auto opacity-45 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] object-contain transition-transform origin-center`}
      />
    </div>
  );
};
