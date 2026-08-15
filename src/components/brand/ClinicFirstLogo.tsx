import React from 'react';

interface ClinicFirstLogoProps {
  className?: string;
  variant?: 'solid' | 'transparent-light' | 'transparent-dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showTagline?: boolean;
}

export const ClinicFirstLogo: React.FC<ClinicFirstLogoProps> = ({
  className = '',
  variant = 'transparent-light',
  size = 'md',
  showTagline = false,
}) => {
  const sizeClasses = {
    sm: 'h-8 w-32',
    md: 'h-10 w-44',
    lg: 'h-14 w-60',
    xl: 'h-20 w-80',
    custom: '',
  };

  const currentSizeClass = sizeClasses[size];

  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-white border border-slate-200 p-1.5 shadow-2xs ${className}`}
        aria-label="CLINICFIRST"
      >
        <svg viewBox="0 0 50 50" className="w-full h-full" fill="none">
          <g transform="translate(25, 25)">
            <path
              d="M -5 -15 L -5 -5 L -15 -5 L -15 5 L -5 5 L -5 15 L 0 15 L 0 -15 Z"
              fill="none"
              stroke="#008768"
              strokeWidth="2.8"
              strokeLinejoin="miter"
              strokeLinecap="square"
            />
            <path
              d="M 0 -15 L 5 -15 L 5 -5 L 15 -5 L 15 5 L 5 5 L 5 15 L 0 15 Z"
              fill="none"
              stroke="#003865"
              strokeWidth="2.8"
              strokeLinejoin="miter"
              strokeLinecap="square"
            />
            <path
              d="M -18 0 L -6 0 L -3 3 L 0 -10 L 3 8 L 6 0 L 18 0"
              fill="none"
              stroke="#003865"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div
        className={`relative shrink-0 flex items-center select-none ${currentSizeClass}`}
        style={{ aspectRatio: '3.7/1' }}
        aria-label="CLINICFIRST Logo"
      >
        <svg
          viewBox="0 0 520 140"
          className="w-full h-full"
          fill="none"
        >
          {/* Medical Cross Icon with Pulse (Top Center) */}
          <g transform="translate(260, 24)">
            {/* Left Half (Emerald Green) */}
            <path
              d="M -7 -20 L -7 -7 L -20 -7 L -20 7 L -7 7 L -7 20 L 0 20 L 0 -20 Z"
              fill="none"
              stroke="#008768"
              strokeWidth="3.6"
              strokeLinejoin="miter"
              strokeLinecap="square"
            />
            {/* Right Half (Navy Blue) */}
            <path
              d="M 0 -20 L 7 -20 L 7 -7 L 20 -7 L 20 7 L 7 7 L 7 20 L 0 20 Z"
              fill="none"
              stroke="#003865"
              strokeWidth="3.6"
              strokeLinejoin="miter"
              strokeLinecap="square"
            />
            {/* ECG Pulse Line */}
            <path
              d="M -23 0 L -8 0 L -4 4 L 0 -13 L 4 11 L 8 0 L 23 0"
              fill="none"
              stroke="#003865"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Wordmark Typography */}
          <g
            style={{
              fontFamily: "'Outfit', 'Montserrat', 'Inter', system-ui, -apple-system, sans-serif",
              fontSize: '66px',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            {/* CLINIC in Emerald Green */}
            <text x="32" y="116" fill="#008768">
              CLINIC
            </text>

            {/* FiRST in Navy Blue */}
            <text x="270" y="116" fill="#003865">
              F<tspan fontSize="62" dx="-2">i</tspan><tspan fontSize="66" dx="0">RST</tspan>
            </text>
          </g>
        </svg>
      </div>

      {showTagline && (
        <span className="text-[11px] font-medium text-slate-500 tracking-tight mt-1">
          AI Reception & Patient Communication
        </span>
      )}
    </div>
  );
};
