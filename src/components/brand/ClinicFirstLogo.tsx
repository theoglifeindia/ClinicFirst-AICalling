import React from 'react';

interface ClinicFirstLogoProps {
  className?: string;
  variant?: 'banner' | 'terracotta' | 'solid' | 'transparent-light' | 'transparent-dark' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showTagline?: boolean;
}

export const ClinicFirstLogo: React.FC<ClinicFirstLogoProps> = ({
  className = '',
  variant = 'terracotta',
  size = 'md',
  showTagline = false,
}) => {
  const sizeClasses = {
    sm: 'h-7 w-auto max-w-[150px]',
    md: 'h-9 w-auto max-w-[200px]',
    lg: 'h-12 w-auto max-w-[280px]',
    xl: 'h-16 w-auto max-w-[360px]',
    custom: '',
  };

  const currentSizeClass = sizeClasses[size];

  // SVG Paths for exact "CLINICFIRST" custom architectural typography from brand image
  const renderWordmarkSvg = (strokeColor = 'currentColor') => (
    <svg
      viewBox="0 0 710 140"
      className="w-full h-full select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      <g
        stroke={strokeColor}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* C 1 */}
        <path d="M 96.5 45.4 A 40 40 0 1 0 96.5 94.6" />

        {/* L */}
        <path d="M 120 30 L 120 110 L 165 110" />

        {/* I 1 */}
        <path d="M 188 30 L 188 110" />

        {/* N */}
        <path d="M 214 110 L 214 30 L 264 110 L 264 30" />

        {/* I 2 */}
        <path d="M 288 30 L 288 110" />

        {/* C 2 */}
        <path d="M 383.5 45.4 A 40 40 0 1 0 383.5 94.6" />

        {/* F (Signature Brand Floating Top Bar + Arm) */}
        <path d="M 414 30 L 460 30" />
        <path d="M 454 54 L 414 54 L 414 110" />

        {/* I 3 */}
        <path d="M 480 30 L 480 110" />

        {/* R (Signature Brand Open Arch) */}
        <path d="M 506 30 L 506 110" />
        <path d="M 506 68 L 528 68 A 20 20 0 0 1 548 88 L 548 110" />

        {/* S */}
        <path d="M 598 44 C 594 34 584 30 572 30 C 556 30 550 42 550 52 C 550 68 568 70 580 74 C 596 79 604 86 604 98 C 604 108 594 110 578 110 C 564 110 554 104 550 94" />

        {/* T */}
        <path d="M 626 30 L 678 30 M 652 30 L 652 110" />
      </g>
    </svg>
  );

  // Icon only compact view (C + F monogram)
  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center rounded-xl overflow-hidden shrink-0 bg-[#C43D27] text-white p-2 shadow-xs ${className}`}
        aria-label="CLINICFIRST"
      >
        <svg viewBox="0 0 100 100" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 48 30 A 24 24 0 1 0 48 70" />
          <path d="M 60 22 L 86 22" />
          <path d="M 82 40 L 60 40 L 60 78" />
        </svg>
      </div>
    );
  }

  // Exact Terracotta / Crimson Red Background Variant (As seen in the official brand screenshot)
  if (variant === 'terracotta' || variant === 'banner') {
    return (
      <div className={`inline-flex flex-col items-start ${className}`}>
        <div
          className={`inline-flex items-center justify-center bg-[#C43D27] text-white px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-xs transition-transform hover:scale-[1.01] ${currentSizeClass}`}
          style={{ aspectRatio: '5.07/1' }}
          aria-label="CLINICFIRST"
        >
          {renderWordmarkSvg('#FFFFFF')}
        </div>

        {showTagline && (
          <span className="text-[11px] font-medium text-[#486581] dark:text-slate-400 tracking-tight mt-1">
            AI Reception & Patient Communication
          </span>
        )}
      </div>
    );
  }

  // Transparent dark (for dark themes / dark hero sections)
  if (variant === 'transparent-dark') {
    return (
      <div className={`inline-flex flex-col items-start ${className}`}>
        <div
          className={`inline-flex items-center justify-center text-white ${currentSizeClass}`}
          style={{ aspectRatio: '5.07/1' }}
          aria-label="CLINICFIRST"
        >
          {renderWordmarkSvg('#FFFFFF')}
        </div>

        {showTagline && (
          <span className="text-[11px] font-medium text-slate-200 tracking-tight mt-1">
            AI Reception & Patient Communication
          </span>
        )}
      </div>
    );
  }

  // Transparent light or solid
  const strokeColor = variant === 'solid' ? '#C43D27' : '#0A2540';

  return (
    <div className={`inline-flex flex-col items-start ${className}`}>
      <div
        className={`inline-flex items-center justify-center text-[#0A2540] dark:text-white ${currentSizeClass}`}
        style={{ aspectRatio: '5.07/1' }}
        aria-label="CLINICFIRST"
      >
        {renderWordmarkSvg('currentColor')}
      </div>

      {showTagline && (
        <span className="text-[11px] font-medium text-[#486581] dark:text-slate-400 tracking-tight mt-1">
          AI Reception & Patient Communication
        </span>
      )}
    </div>
  );
};
