/**
 * CLINICFIRST Healthcare Design System & Theme Tokens
 * 
 * Default Theme: Clinical Pure White Canvas with Deep Navy Blue Typography
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryActive: string;
  primaryLight: string;
  primaryMuted: string;
  primaryBorder: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  accent: string;
  background: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
}

export const themePalettes: Record<string, ThemeColors> = {
  'clinical-white': {
    primary: '#0A2540', // Deep Medical Navy
    primaryHover: '#001D36',
    primaryActive: '#001426',
    primaryLight: '#F0F4F8',
    primaryMuted: '#E2E8F0',
    primaryBorder: '#CBD5E1',
    secondary: '#334E68', // Slate Navy
    secondaryHover: '#102A43',
    secondaryLight: '#F0F4F8',
    accent: '#003865',
    background: '#FFFFFF', // Pure White Canvas
    card: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0A2540', // Navy Blue
    textSecondary: '#334E68', // Slate-Navy Blue
    textMuted: '#627D98', // Muted Navy
  },
  'dark-night': {
    primary: '#F0F4F8',
    primaryHover: '#D9E2EC',
    primaryActive: '#BCCCDC',
    primaryLight: '#1B2A4A',
    primaryMuted: '#102A43',
    primaryBorder: '#243B53',
    secondary: '#9FB3C8',
    secondaryHover: '#D9E2EC',
    secondaryLight: '#0B132B',
    accent: '#627D98',
    background: '#0A1128',
    card: '#101F3D',
    border: '#1C2E4C',
    textPrimary: '#F0F4F8',
    textSecondary: '#BCCCDC',
    textMuted: '#829AB1',
  },
};

export const brandMeta = {
  name: 'CLINICFIRST',
  tagline: 'AI Reception & Patient Communication',
  subtitle: 'for Modern Clinics',
  copyright: '© 2026 CLINICFIRST. All rights reserved.',
};

