import React from 'react';
import { ClinicFirstLogo } from './ClinicFirstLogo';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';

interface BrandHeaderProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
}

export const BrandHeader: React.FC<BrandHeaderProps> = ({ currentTab, onNavigate }) => {
  const links = [
    { id: 'dashboard', label: 'Clinic Portal' },
    { id: 'about', label: 'About CLINICFIRST' },
    { id: 'help', label: 'Help Center' },
    { id: 'contact', label: 'Contact Us' },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="text-left cursor-pointer focus:outline-none"
            >
              <ClinicFirstLogo size="md" />
            </button>
            <div className="hidden lg:block h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <span className="hidden lg:inline-block text-xs font-medium text-slate-500 dark:text-slate-400">
              AI Reception & Patient Communication
            </span>
          </div>

          {/* Navigation Links & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 sm:gap-2">
              {links.map((link) => {
                const isActive = currentTab === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#003865] dark:bg-slate-800 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}

              <button
                onClick={() => onNavigate('dashboard')}
                className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#008768] hover:bg-[#007055] active:bg-[#005842] text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <span>Clinic Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </nav>

            <div className="pl-2 border-l border-slate-200 dark:border-slate-700">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
