import React from 'react';

const RippleLogo = ({ size = 40 }) => {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className="drop-shadow-md">
      <defs>
        <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#3B82F6"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="50" fill="url(#rg)"/>
      <path d="M26 50 Q38 30 50 50 Q62 70 74 50" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="26" cy="50" r="6" fill="white"/>
      <circle cx="74" cy="50" r="6" fill="white"/>
      <path d="M20 68 Q30 62 40 68 Q50 74 60 68 Q70 62 80 68" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
    </svg>
  );
};

export default RippleLogo;
