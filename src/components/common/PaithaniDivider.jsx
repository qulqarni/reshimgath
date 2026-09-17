import React from 'react';

export const PaithaniDivider = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center my-6 space-x-3 text-brand-gold opacity-80 ${className}`}>
      <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-r from-transparent to-brand-gold"></div>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5">
        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#C9A35B" stroke="#54263D" strokeWidth="0.75" />
        <circle cx="12" cy="12" r="3" fill="#C8752A" />
      </svg>
      <div className="h-[1px] w-12 sm:w-24 bg-gradient-to-l from-transparent to-brand-gold"></div>
    </div>
  );
};
