import React from 'react';

interface BrandFooterProps {
  onNavigate?: (page: string) => void;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-8 border-t border-[#D9E2EC] py-4 text-xs text-[#627D98] transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-2xs sm:text-xs">
          <span className="font-bold text-[#0A2540] font-mono">CLINICFIRST</span>
          <span className="text-[#D9E2EC]">•</span>
          <span className="text-[#486581]">OPD & Appointment Scheduling Engine (Asia/Kolkata)</span>
        </div>

        <div className="flex items-center gap-4 text-2xs text-[#627D98]">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('help')}
                className="hover:text-[#0A2540] transition-colors cursor-pointer"
              >
                Help
              </button>
              <span className="text-[#D9E2EC]">•</span>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-[#0A2540] transition-colors cursor-pointer"
              >
                Support
              </button>
              <span className="text-[#D9E2EC]">•</span>
              <button
                onClick={() => onNavigate('schema')}
                className="hover:text-[#0A2540] transition-colors cursor-pointer"
              >
                Schema Specs
              </button>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};
