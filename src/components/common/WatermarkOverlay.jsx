import React from 'react';

export const WatermarkOverlay = ({ size = 'medium', className = '' }) => {
  let sizeClasses = 'w-24 sm:w-32';
  if (size === 'small') {
    sizeClasses = 'w-8 sm:w-10';
  } else if (size === 'large') {
    sizeClasses = 'w-36 sm:w-48';
  }

  return (
    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none z-10 select-none ${className}`}>
      <img
        src="/logo.png"
        alt="Watermark"
        className={`${sizeClasses} h-auto opacity-35 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] object-contain`}
      />
    </div>
  );
};
