import React, { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Check, Sparkles, Shield, HeartPulse } from 'lucide-react';
import { useTheme, THEME_OPTIONS, ClinicTheme } from '../../theme/ThemeContext';

export const ThemeSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { theme, setTheme, isDark, toggleDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        {/* Quick Dark/Light Toggle Button */}
        <button
          onClick={toggleDarkMode}
          title={isDark ? 'Switch to Daytime Clinical Theme' : 'Switch to Night Shift Dark Mode'}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-[#F5F2E9] dark:bg-slate-800 hover:bg-[#EAE4D7] dark:hover:bg-slate-700 transition-colors cursor-pointer border border-[#E8E3D7] dark:border-slate-700 shadow-2xs"
          aria-label="Toggle Night Mode"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Theme Palette Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
            isDark
              ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              : 'bg-[#FFFEFA] border-[#E8E3D7] text-slate-700 hover:bg-[#F5F2E9]'
          }`}
          title="Customize Clinical Theme"
          aria-expanded={isOpen}
        >
          <div className="flex items-center -space-x-1">
            <span
              className="w-3 h-3 rounded-full border border-white dark:border-slate-800"
              style={{ backgroundColor: activeOption.previewColors[0] }}
            />
            {activeOption.previewColors[1] && (
              <span
                className="w-3 h-3 rounded-full border border-white dark:border-slate-800"
                style={{ backgroundColor: activeOption.previewColors[1] }}
              />
            )}
          </div>
          {!compact && (
            <span className="hidden lg:inline text-2xs font-mono font-bold text-slate-600 dark:text-slate-300">
              {activeOption.badge}
            </span>
          )}
          <Palette className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 p-2.5 bg-[#FFFEFA] dark:bg-slate-900 border border-[#E8E3D7] dark:border-slate-700 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-[#EFEBE0] dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#008768] dark:text-[#38BDF8]" />
                Healthcare Clinical Themes
              </span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#F5F2E9] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#E8E3D7] dark:border-slate-700">
                WCAG AA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
              Scientifically curated palettes designed to reduce anxiety, enhance focus, and eliminate night-shift eye fatigue.
            </p>
          </div>

          <div className="p-1 space-y-1 mt-1">
            {THEME_OPTIONS.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/90 dark:bg-slate-800/90 border border-emerald-300 dark:border-emerald-500/50 shadow-2xs'
                      : 'hover:bg-[#F5F2E9] dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1 shrink-0">
                        <span
                          className="w-3.5 h-3.5 rounded-full shadow-2xs"
                          style={{ backgroundColor: opt.previewColors[0] }}
                        />
                        {opt.previewColors[1] && (
                          <span
                            className="w-3.5 h-3.5 rounded-full shadow-2xs"
                            style={{ backgroundColor: opt.previewColors[1] }}
                          />
                        )}
                      </div>
                      <span className={`font-bold truncate ${isSelected ? 'text-emerald-950 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-200'}`}>
                        {opt.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[#EFEBE0] dark:border-slate-800 px-3 py-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" /> High-Contrast Guarantee
            </span>
            <span>Asia/Kolkata</span>
          </div>
        </div>
      )}
    </div>
  );
};
