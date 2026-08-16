import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Stethoscope,
  Users,
  CheckCircle2,
  PlayCircle,
  Database,
  HelpCircle,
  Mail,
  Info,
  Bot,
  GitBranch,
  Megaphone,
  BookOpen,
  Mic,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { ClinicFirstLogo } from '../brand/ClinicFirstLogo';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useTheme } from '../../theme/ThemeContext';

export type AppTab =
  | 'dashboard'
  | 'receptionist'
  | 'appointments'
  | 'doctors'
  | 'patients'
  | 'availability'
  | 'testsuite'
  | 'schema'
  | 'help'
  | 'contact'
  | 'about';

interface AppLayoutProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenBooking: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFutureModal, setShowFutureModal] = useState<string | null>(null);
  const { isDark, theme } = useTheme();

  // Live Clock (IST)
  const [currentTime, setCurrentTime] = useState<string>(() => {
    const now = new Date();
    return now.toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const activeModules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receptionist', label: 'AI Receptionist', icon: Bot, isLiveVoice: true },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctors & Shifts', icon: Stethoscope },
    { id: 'patients', label: 'Patients Directory', icon: Users },
    { id: 'availability', label: 'Slot Explorer', icon: CheckCircle2 },
  ] as const;

  const futureModules = [
    { id: 'ai-agents', label: 'AI Agents', icon: Bot, phase: 'Phase 2' },
    { id: 'workflows', label: 'Workflows', icon: GitBranch, phase: 'Phase 7' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, phase: 'Phase 8' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, phase: 'Phase 5' },
    { id: 'voice-library', label: 'Voice Library', icon: Mic, phase: 'Phase 6' },
  ];

  const verificationModules = [
    { id: 'testsuite', label: 'Engine Test Suite', icon: PlayCircle },
    { id: 'schema', label: 'Clinical Rules & Specs', icon: ShieldCheck },
  ] as const;

  const publicResources = [
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'about', label: 'About CLINICFIRST', icon: Info },
    { id: 'contact', label: 'Contact Support', icon: Mail },
  ] as const;

  const handleTabClick = (tab: AppTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleFutureClick = (moduleName: string, phase: string) => {
    setShowFutureModal(`${moduleName} (${phase})`);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0A1128] flex flex-col md:flex-row text-slate-900 dark:text-[#F0F4F8] font-sans transition-colors duration-200">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-[#101F3D] border-b border-slate-200 dark:border-[#1C2E4C] px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <ClinicFirstLogo size="sm" />
        <div className="flex items-center gap-2">
          <ThemeSwitcher compact />
          <button
            onClick={onOpenBooking}
            className="p-2 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            aria-label="Book Appointment"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-[#FAF8F3] dark:hover:bg-[#172B52]"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-white dark:bg-[#101F3D] border-r border-slate-200 dark:border-[#1C2E4C] flex flex-col shrink-0 transition-transform duration-200 ease-in-out overflow-hidden shadow-xs ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Pinned Top Brand Header */}
        <div className="shrink-0 p-5 border-b border-slate-100 dark:border-[#1C2E4C] bg-white dark:bg-[#101F3D]">
          <div className="p-1 rounded-lg">
            <ClinicFirstLogo size="md" />
          </div>
          <div className="mt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-tight">
            AI Reception & Patient Communication
          </div>

          {/* Clinic Context Badge */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Demo Clinic</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Nagpur • Asia/Kolkata</div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-2xs" title="System Operational" />
          </div>
        </div>

        {/* Scrollable Navigation Menu Sections */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-6 bg-white dark:bg-[#101F3D]">
          {/* Active Clinic Operations */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Clinic Operations
            </div>
            <div className="space-y-0.5">
              {activeModules.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-tab-${tab.id}`}
                    onClick={() => handleTabClick(tab.id as AppTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#C43D27] text-white shadow-xs font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Future Modules Section */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>AI & Automation</span>
              <span className="text-[9px] font-mono text-[#C43D27] dark:text-[#E05A44] font-semibold">Roadmap</span>
            </div>
            <div className="space-y-0.5">
              {futureModules.map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.id}
                    onClick={() => handleFutureClick(mod.label, mod.phase)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <span>{mod.label}</span>
                    </div>
                    <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#FAF8F3] dark:bg-[#172B52] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#243B53]">
                      {mod.phase}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Engine Verification & Safeguards */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Engine & Safeguards
            </div>
            <div className="space-y-0.5">
              {verificationModules.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-tab-${tab.id}`}
                    onClick={() => handleTabClick(tab.id as AppTab)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 dark:bg-[#172B52] text-white shadow-xs font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resources & Help */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Resources & About
            </div>
            <div className="space-y-0.5">
              {publicResources.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-tab-${tab.id}`}
                    onClick={() => handleTabClick(tab.id as AppTab)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{tab.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pinned Bottom Sidebar Footer */}
        <div className="shrink-0 p-3 border-t border-slate-100 dark:border-[#1C2E4C] bg-white dark:bg-[#101F3D] text-2xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">CLINICFIRST</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="System Operational" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Operational</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF] dark:bg-[#0A1128]">
        {/* Top Operational Bar */}
        <header className="bg-white dark:bg-[#101F3D] border-b border-slate-200 dark:border-[#1C2E4C] px-4 sm:px-6 lg:px-8 py-3.5 sticky top-0 z-20 shadow-xs flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white capitalize">
              {activeTab === 'dashboard'
                ? 'Clinic Overview'
                : activeTab === 'receptionist'
                ? 'AI Voice Receptionist (Gemini Live)'
                : activeTab === 'testsuite'
                ? 'Engine Test Suite'
                : activeTab === 'schema'
                ? 'Clinical Rules & Specifications'
                : activeTab === 'availability'
                ? 'Doctor Slot Explorer'
                : activeTab === 'patients'
                ? 'Patients & Contacts'
                : activeTab}
            </h2>
            {/* Symbolic Double-Booking Guard Badge */}
            <div
              title="Double-Booking Guard Active (Atomic Concurrency Protected)"
              className="hidden sm:inline-flex items-center justify-center p-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] border border-slate-200 dark:border-[#243B53] cursor-help"
            >
              <ShieldCheck className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Live Header Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] text-slate-700 dark:text-slate-300 font-mono text-2xs sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-900 dark:text-white">{currentTime}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-semibold">IST</span>
            </div>

            {/* Operational Connectivity Indicator */}
            <div
              title="System Connected & Operational"
              className="flex items-center justify-center p-2 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] cursor-help"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            </div>

            {/* Persistent Primary Booking Action */}
            <button
              id="header-book-appointment-btn"
              onClick={onOpenBooking}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#FFFFFF] dark:bg-[#0A1128]">
          {children}
        </main>
      </div>


      {/* Planned Feature Architecture Modal */}
      {showFutureModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#008768] dark:text-emerald-400 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-[#008768] dark:text-[#38BDF8] uppercase tracking-wider">
                Planned Future Module
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{showFutureModal}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                This capability is part of the CLINICFIRST phased product architecture. In accordance with the system blueprint, future AI agents and workflows will call the core appointment engine via clean service APIs without modifying underlying scheduling math.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-2xs text-slate-500 dark:text-slate-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span>Current Milestone:</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Step 1 (Core Engine)</span>
              </div>
              <div className="flex justify-between">
                <span>Business Logic:</span>
                <span className="text-slate-800 dark:text-slate-200">Authoritative & Verified</span>
              </div>
            </div>

            <button
              onClick={() => setShowFutureModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
