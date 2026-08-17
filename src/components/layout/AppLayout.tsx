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
  Phone,
  PhoneCall,
} from 'lucide-react';
import { ClinicFirstLogo } from '../brand/ClinicFirstLogo';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { useTheme } from '../../theme/ThemeContext';
import { WorkspaceSwitcher } from '../workspace/WorkspaceSwitcher';
import { useWorkspace } from '../../context/WorkspaceContext';

export type AppTab =
  | 'dashboard'
  | 'agents'
  | 'contacts'
  | 'calls'
  | 'receptionist'
  | 'appointments'
  | 'doctors'
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
  onStartCall: () => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  activeTab,
  setActiveTab,
  onOpenBooking,
  onStartCall,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFutureModal, setShowFutureModal] = useState<string | null>(null);
  const { isDark, theme } = useTheme();
  const { currentWorkspace } = useWorkspace();

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

  // M3 Calling & Voice AI
  const callingModules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agents', label: 'AI Voice Agents', icon: Bot, isM3: true },
    { id: 'contacts', label: 'Contacts & Patients', icon: Users, isM3: true },
    { id: 'calls', label: 'Call Logs & Transcripts', icon: PhoneCall, isM3: true },
    { id: 'receptionist', label: 'AI Receptionist Live', icon: Mic },
  ] as const;

  // Clinic Operations & Scheduling
  const clinicModules = [
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Doctors & Shifts', icon: Stethoscope },
    { id: 'availability', label: 'Slot Explorer', icon: CheckCircle2 },
  ] as const;

  const futureModules = [
    { id: 'workflows', label: 'Workflows & Nodes', icon: GitBranch, phase: 'Phase 7' },
    { id: 'campaigns', label: 'Outbound Broadcasts', icon: Megaphone, phase: 'Phase 8' },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, phase: 'Phase 5' },
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
      <div className="md:hidden bg-white dark:bg-[#101F3D] border-b border-slate-200 dark:border-[#1C2E4C] px-3 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <ClinicFirstLogo size="sm" />
          <WorkspaceSwitcher compact />
        </div>
        <div className="flex items-center gap-1.5">
          <ThemeSwitcher compact />
          <button
            onClick={onStartCall}
            className="p-2 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            aria-label="Start AI Call"
          >
            <Phone className="w-4 h-4" />
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
        className={`fixed md:sticky top-0 z-30 h-screen w-64 bg-white dark:bg-[#101F3D] border-r border-slate-200 dark:border-[#1C2E4C] flex flex-col shrink-0 transition-transform duration-200 ease-in-out shadow-xs ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Pinned Top Brand Header */}
        <div className="shrink-0 p-4 border-b border-slate-100 dark:border-[#1C2E4C] bg-white dark:bg-[#101F3D]">
          <div className="p-1 rounded-lg">
            <ClinicFirstLogo size="md" />
          </div>
          <div className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight leading-tight">
            AI Voice Calling & Clinic Scheduling
          </div>

          {/* Workspace Switcher Component */}
          <div className="mt-3">
            <WorkspaceSwitcher />
          </div>
        </div>

        {/* Scrollable Navigation Menu Sections */}
        <div className="flex-1 overflow-y-auto min-h-0 px-3 py-4 space-y-5 bg-white dark:bg-[#101F3D]">
          {/* Calling Engine & AI Management (M3) */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Calling & AI Engine</span>
              <span className="text-[9px] font-mono text-[#C43D27] font-bold">M3</span>
            </div>
            <div className="space-y-0.5">
              {callingModules.map((tab) => {
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

          {/* Clinic Operations & Appointments */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Clinic Operations
            </div>
            <div className="space-y-0.5">
              {clinicModules.map((tab) => {
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

          {/* Future Modules Section */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Automation</span>
              <span className="text-[9px] font-mono text-slate-400">Roadmap</span>
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

          {/* Resources & Help */}
          <div>
            <div className="px-3 text-[10px] font-bold font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
              Resources
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
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">CLINICFIRST M3</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Calling Engine Operational" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Carrier Ready</span>
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
                ? 'Calling & Clinic Overview'
                : activeTab === 'agents'
                ? 'AI Voice Agents'
                : activeTab === 'contacts'
                ? 'Contacts & Patients'
                : activeTab === 'calls'
                ? 'Call Logs & Transcripts'
                : activeTab === 'receptionist'
                ? 'AI Voice Receptionist (Gemini Live)'
                : activeTab === 'testsuite'
                ? 'Engine Test Suite'
                : activeTab === 'schema'
                ? 'Clinical Rules & Specifications'
                : activeTab === 'availability'
                ? 'Doctor Slot Explorer'
                : activeTab === 'appointments'
                ? 'Appointments Schedule'
                : activeTab === 'doctors'
                ? 'Doctors & Shift Timings'
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
            {/* Header Clinic Workspace Switcher */}
            <div className="hidden lg:block">
              <WorkspaceSwitcher compact />
            </div>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Live Header Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] text-slate-700 dark:text-slate-300 font-mono text-2xs sm:text-xs">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold text-slate-900 dark:text-white">{currentTime}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-semibold">IST</span>
            </div>

            {/* Start AI Call Action Button (M3) */}
            <button
              id="header-start-call-btn"
              onClick={onStartCall}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Start AI Call</span>
            </button>

            {/* Persistent Primary Booking Action */}
            <button
              id="header-book-appointment-btn"
              onClick={onOpenBooking}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF8F3] dark:bg-[#172B52] hover:bg-slate-100 dark:hover:bg-[#1C2E4C] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#243B53] text-xs sm:text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
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
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">Milestone 3 (Calling Engine)</span>
              </div>
              <div className="flex justify-between">
                <span>Telephony Provider:</span>
                <span className="text-slate-800 dark:text-slate-200">Carrier Interface Ready</span>
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
