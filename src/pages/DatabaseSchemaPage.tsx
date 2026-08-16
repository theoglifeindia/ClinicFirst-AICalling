import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Lock,
  Building2,
  Stethoscope,
  PhoneCall,
  Check,
  AlertCircle
} from 'lucide-react';

export const DatabaseSchemaPage: React.FC = () => {
  const [testLockDoctor, setTestLockDoctor] = useState('Dr. Sharma');
  const [testLockTime, setTestLockTime] = useState('10:30 AM');
  const [testSimulationRun, setTestSimulationRun] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    callerA: string;
    callerB: string;
  } | null>(null);

  const handleRunSimulation = () => {
    setTestSimulationRun(true);
    setTimeout(() => {
      setSimulationResult({
        callerA: `Caller 1 (AI Voice): Confirmed for ${testLockTime} (Lock Acquired)`,
        callerB: `Caller 2 (Web Portal): Slot occupied. Offered next available: 11:00 AM`,
      });
      setTestSimulationRun(false);
    }, 400);
  };

  const operationalModules = [
    {
      title: 'Clinic Profile & Location',
      tag: 'Core Entity',
      icon: Building2,
      description: 'Defines operating clinics, operational timezones (Asia/Kolkata), and emergency contact coordinates.',
      fields: [
        { name: 'Clinic Identifier', desc: 'Unique system identifier for clinic isolation' },
        { name: 'Practice Name', desc: 'Display name for SMS, WhatsApp, and Voice greetings' },
        { name: 'Operational Timezone', desc: 'Fixed to Asia/Kolkata (IST) for consistent slot math' },
        { name: 'Primary Phone', desc: 'Official clinic contact number for patient callbacks' },
      ],
    },
    {
      title: 'Doctor Directory & Specialty',
      tag: 'Physician Entity',
      icon: Stethoscope,
      description: 'Physicians practicing at the clinic, medical specialty, consultation rules, and active status.',
      fields: [
        { name: 'Physician Name', desc: 'Full medical provider name (e.g. Dr. Rajesh Sharma)' },
        { name: 'Specialty & Department', desc: 'Cardiology, General Medicine, Pediatrics, etc.' },
        { name: 'Active Practice Status', desc: 'Toggles provider availability for new bookings' },
        { name: 'Registration Date', desc: 'Provider onboarding timestamp' },
      ],
    },
    {
      title: 'OPD Shift & Working Hours',
      tag: 'Scheduling Rules',
      icon: Clock,
      description: 'Weekly recurring shift windows, morning/evening splits, and consultation slot durations.',
      fields: [
        { name: 'Day of Week', desc: 'Active days (Monday through Saturday)' },
        { name: 'Morning Shift', desc: 'Standard morning OPD window (e.g. 10:00 AM - 1:00 PM)' },
        { name: 'Evening Shift', desc: 'Standard evening OPD window (e.g. 4:00 PM - 7:00 PM)' },
        { name: 'Slot Interval', desc: 'Discrete consultation granularity (15m, 20m, 30m, 45m)' },
      ],
    },
    {
      title: 'Patient Master Directory',
      tag: 'Patient Entity',
      icon: Users,
      description: 'Master patient identity records indexed by validated 10-digit mobile number.',
      fields: [
        { name: 'Full Name', desc: 'Patient name for appointment token and medical charts' },
        { name: 'Mobile Number', desc: 'Standard +91 10-digit format for notifications & lookups' },
        { name: 'Clinic Pairing', desc: 'Isolates patient records per healthcare facility' },
        { name: 'First Visit Date', desc: 'Initial registration record timestamp' },
      ],
    },
    {
      title: 'Appointment Ledger & Lifecycle',
      tag: 'Transaction Entity',
      icon: Calendar,
      description: 'Confirmed consultation bookings with real-time conflict-free locking and status tracking.',
      fields: [
        { name: 'Slot Window', desc: 'Explicit start time and calculated end time (e.g. 10:00 - 10:30)' },
        { name: 'Lifecycle Status', desc: 'Active states: Confirmed, Cancelled, Completed, No-Show' },
        { name: 'Booking Channel', desc: 'Reception Dashboard, Voice AI Call, or Web API' },
        { name: 'Concurrency Lock', desc: 'Guarantees zero overlapping active appointments per doctor' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#101F3D] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold bg-[#F0F4F8] text-[#0A2540] border border-[#D9E2EC] dark:bg-[#172B52] dark:text-sky-300 dark:border-[#243B53]">
              OPERATIONAL SPECIFICATIONS
            </span>
            <span className="text-xs text-[#486581] dark:text-slate-400 font-mono">Asia/Kolkata (IST)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A2540] dark:text-white">
            Clinical Rules & Scheduling Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#486581] dark:text-slate-400 mt-1 max-w-2xl">
            Automated conflict-free slot allocation, multi-shift doctor scheduling, and resilient clinic operational guardrails.
          </p>
        </div>
      </div>

      {/* Hero Showcase: Real-Time Double-Booking Lock */}
      <div className="bg-[#0A2540] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#1C2E4C] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/15 border border-white/20 text-sky-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-200">
                Core Concurrency Guarantee
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Zero-Conflict Slot Lock Engine
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Every appointment is guarded by a strict concurrency lock. When an AI Voice agent, online patient, or front-desk receptionist books a slot for a doctor at a given time, the slot is locked immediately. Even if two patients attempt to book the exact same millisecond, the engine confirms the first caller and instantly redirects the second to the next open window.
            </p>
          </div>

          {/* Interactive Simulation Sandbox */}
          <div className="bg-white/10 dark:bg-black/30 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/20 w-full lg:w-96 shrink-0 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-200" />
                Live Collision Simulator
              </span>
              <span className="text-[10px] font-mono bg-white/20 px-2 py-0.5 rounded text-white font-semibold">
                Test Mode
              </span>
            </div>

            <div className="text-2xs text-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span>Doctor:</span>
                <span className="font-bold text-white">{testLockDoctor}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Time Slot:</span>
                <span className="font-bold text-sky-200">{testLockTime}</span>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              disabled={testSimulationRun}
              className="w-full py-2 bg-white hover:bg-slate-100 text-[#0A2540] text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {testSimulationRun ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0A2540]" />
                  <span>Simulating Concurrency...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-current text-[#0A2540]" />
                  <span>Simulate 2 Simultaneous Callers</span>
                </>
              )}
            </button>

            {simulationResult && (
              <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/15 text-[11px] font-mono space-y-1.5">
                <div className="text-sky-300 flex items-start gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{simulationResult.callerA}</span>
                </div>
                <div className="text-amber-200 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{simulationResult.callerB}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Operational Guardrails Grid (3 Key Pillars) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pillar 1 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-2.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#0A2540] dark:text-white">
            Shift & OPD Interval Rules
          </h3>
          <p className="text-xs text-[#486581] dark:text-slate-400 leading-relaxed">
            Doctors operate on dedicated morning and evening consultation shifts. The engine breaks down shifts into discrete slots (e.g. 30 minutes) and blocks dates outside the physician's active schedule.
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-2.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#0A2540] dark:text-white">
            Instant Cancellation Recycling
          </h3>
          <p className="text-xs text-[#486581] dark:text-slate-400 leading-relaxed">
            When a patient cancels or reschedules an appointment, the concurrency lock is released immediately. The slot instantly returns to available inventory for online booking and voice agents.
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-2.5 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm sm:text-base text-[#0A2540] dark:text-white">
            Single Master Patient Profile
          </h3>
          <p className="text-xs text-[#486581] dark:text-slate-400 leading-relaxed">
            Patients are identified uniquely by their validated 10-digit mobile number within each clinic. Re-bookings automatically connect to the existing patient record without duplicate profiles.
          </p>
        </div>
      </div>

      {/* Structural Data Models & Fields */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0A2540] dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0A2540] dark:text-sky-300" />
            <span>Clinic Operational Data Structures</span>
          </h2>
          <span className="text-xs text-[#486581] dark:text-slate-400 font-mono">5 Core Modules</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {operationalModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div
                key={mod.title}
                className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs p-5 space-y-3 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#0A2540] dark:text-white">{mod.title}</h3>
                      <p className="text-[11px] text-[#486581] dark:text-slate-400">{mod.description}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 border border-[#D9E2EC] dark:border-[#243B53]">
                    {mod.tag}
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-[#1C2E4C] pt-2 space-y-1.5 text-xs">
                  {mod.fields.map((f) => (
                    <div
                      key={f.name}
                      className="p-2 rounded-lg bg-slate-50/80 dark:bg-[#172B52]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <span className="font-semibold text-[#0A2540] dark:text-slate-200 font-mono">{f.name}</span>
                      <span className="text-[#486581] dark:text-slate-400 text-2xs sm:text-right">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

