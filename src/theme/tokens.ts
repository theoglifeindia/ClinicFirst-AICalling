/**
 * CLINICFIRST Healthcare Design System & Theme Tokens
 * 
 * Default Theme: Medical Trust Blue (#003865 / #0284C7) & Healing Emerald Green (#008768 / #059669)
 * Serenity Blue: High Trust, Calm, Security (#0369A1, #0284C7)
 * Healing Green: Sage, Mint, Restorative Balance (#008768, #10B981)
 * Night Mode: Deep Slate, Low Eye Fatigue, Crystal Clear Typography (#0B1120, #F8FAFC)
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
  'clinical-dual': {
    primary: '#008768', // Healing Emerald Green
    primaryHover: '#007055',
    primaryActive: '#005842',
    primaryLight: '#E8F5F1',
    primaryMuted: '#D1EBE3',
    primaryBorder: '#A3D9C9',
    secondary: '#003865', // Deep Trust Navy
    secondaryHover: '#002849',
    secondaryLight: '#E6F0F8',
    accent: '#0284C7', // Sky Blue
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
  },
  'serenity-blue': {
    primary: '#0284C7', // Trust Royal Blue
    primaryHover: '#0369A1',
    primaryActive: '#075985',
    primaryLight: '#F0F9FF',
    primaryMuted: '#E0F2FE',
    primaryBorder: '#BAE6FD',
    secondary: '#003865',
    secondaryHover: '#002849',
    secondaryLight: '#E0F2FE',
    accent: '#38BDF8',
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
  },
  'healing-green': {
    primary: '#059669', // Restorative Emerald / Mint
    primaryHover: '#047857',
    primaryActive: '#065F46',
    primaryLight: '#ECFDF5',
    primaryMuted: '#D1FAE5',
    primaryBorder: '#A7F3D0',
    secondary: '#008768',
    secondaryHover: '#007055',
    secondaryLight: '#D1FAE5',
    accent: '#10B981',
    background: '#F8FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    textPrimary: '#0F172A',
    textSecondary: '#334155',
    textMuted: '#64748B',
  },
  'dark-night': {
    primary: '#10B981', // Luminous Emerald
    primaryHover: '#34D399',
    primaryActive: '#059669',
    primaryLight: '#064E3B',
    primaryMuted: '#065F46',
    primaryBorder: '#047857',
    secondary: '#38BDF8', // Luminous Trust Sky Blue
    secondaryHover: '#7DD3FC',
    secondaryLight: '#0C4A6E',
    accent: '#60A5FA',
    background: '#0B1120',
    card: '#131E32',
    border: '#1E293B',
    textPrimary: '#F8FAFC',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
  },
};

export const brandMeta = {
  name: 'CLINICFIRST',
  tagline: 'AI Reception & Patient Communication',
  subtitle: 'for Modern Clinics',
  copyright: '© 2026 CLINICFIRST. All rights reserved.',
};
