import React, { createContext, useContext, useState, useEffect } from 'react';

export type ClinicTheme = 'clinical-white' | 'dark-night';

export interface ThemeMeta {
  id: ClinicTheme;
  name: string;
  category: 'White' | 'Dark';
  description: string;
  badge: string;
  previewColors: string[];
}

export const THEME_OPTIONS: ThemeMeta[] = [
  {
    id: 'clinical-white',
    name: 'Healthcare Light (Default)',
    category: 'White',
    description: 'Clean white primary canvas, soft warm cream sections, charcoal typography, and CLINICFIRST terracotta accents.',
    badge: 'Light Theme',
    previewColors: ['#FFFFFF', '#C43D27'],
  },
  {
    id: 'dark-night',
    name: 'Night Shift Mode',
    category: 'Dark',
    description: 'Low-glare deep navy canvas for night shifts and low-light wards with crisp contrast.',
    badge: 'Night Shift',
    previewColors: ['#0A1128', '#F0F4F8'],
  },
];

interface ThemeContextType {
  theme: ClinicTheme;
  setTheme: (theme: ClinicTheme) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'clinicfirst_theme_v7_white_navy';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ClinicTheme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'clinical-white' || saved === 'dark-night')) {
        return saved as ClinicTheme;
      }
    } catch {
      // ignore localstorage errors
    }
    return 'clinical-white';
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
      setTheme('clinical-white');
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

