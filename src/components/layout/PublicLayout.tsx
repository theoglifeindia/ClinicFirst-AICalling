import React from 'react';
import { BrandHeader } from '../brand/BrandHeader';
import { BrandFooter } from '../brand/BrandFooter';

interface PublicLayoutProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  currentTab,
  onNavigate,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-900 font-sans">
      <BrandHeader currentTab={currentTab} onNavigate={onNavigate} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>
      <BrandFooter onNavigate={onNavigate} />
    </div>
  );
};
