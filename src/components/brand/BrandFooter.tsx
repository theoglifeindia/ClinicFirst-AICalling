import React from 'react';

interface BrandFooterProps {
  onNavigate?: (page: string) => void;
}

export const BrandFooter: React.FC<BrandFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="mt-8 border-t border-slate-200/80 dark:border-slate-800 py-4 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-2xs sm:text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">CLINICFIRST</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-slate-500 dark:text-slate-400">OPD & Appointment Scheduling Engine (Asia/Kolkata)</span>
        </div>

        <div className="flex items-center gap-4 text-2xs text-slate-500 dark:text-slate-400">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('help')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Help
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => onNavigate('contact')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Support
              </button>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <button
                onClick={() => onNavigate('schema')}
                className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
