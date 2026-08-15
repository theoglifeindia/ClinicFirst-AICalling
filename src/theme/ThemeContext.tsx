import React, { createContext, useContext, useState, useEffect } from 'react';

export type ClinicTheme = 'clinical-dual' | 'serenity-blue' | 'healing-green' | 'dark-night';

export interface ThemeMeta {
  id: ClinicTheme;
  name: string;
  category: 'Dual' | 'Blue' | 'Green' | 'Dark';
  description: string;
  badge: string;
  previewColors: string[];
}

export const THEME_OPTIONS: ThemeMeta[] = [
  {
    id: 'clinical-dual',
    name: 'Clinical Blue & Green (Default)',
    category: 'Dual',
    description: 'Harmonious pairing of Trust Blue & Healing Emerald for balanced clinical workflows.',
    badge: 'Trust & Healing',
    previewColors: ['#003865', '#008768'],
  },
  {
    id: 'serenity-blue',
    name: 'Serenity Blue',
    category: 'Blue',
    description: 'Light shades lower anxiety; deep blues project authority, security, and cleanliness. Ideal for primary care and cardiology.',
    badge: 'Trust & Calm',
    previewColors: ['#0284C7', '#0369A1'],
  },
  {
    id: 'healing-green',
    name: 'Healing Sage & Emerald',
    category: 'Green',
    description: 'Soft sage and mint greens reduce eye fatigue and stress. Perfect for recovery areas and wellness.',
    badge: 'Healing & Balance',
    previewColors: ['#008768', '#10B981'],
  },
  {
    id: 'dark-night',
    name: 'Night Shift Mode',
    category: 'Dark',
    description: 'Ultra-low glare dark slate canvas for night shifts and low-light wards with crystal clear text legibility.',
    badge: 'Night & Focus',
    previewColors: ['#0A1325', '#38BDF8'],
  },
];

interface ThemeContextType {
  theme: ClinicTheme;
  setTheme: (theme: ClinicTheme) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'clinicfirst_theme_v4';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ClinicTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'clinical-dual' || saved === 'serenity-blue' || saved === 'healing-green' || saved === 'dark-night')) {
        return saved as ClinicTheme;
      }
    } catch {
      // ignore localstorage errors
    }
    return 'clinical-dual';
  });

  const isDark = theme === 'dark-night';

  const setTheme = (newTheme: ClinicTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
  };

  const toggleDarkMode = () => {
    if (theme === 'dark-night') {
      setTheme('clinical-dual');
    } else {
      setTheme('dark-night');
    }
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark-night') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
