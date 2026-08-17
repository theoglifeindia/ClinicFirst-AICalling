import React, { useState } from 'react';
import {
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Check,
  AlertTriangle,
  Terminal,
  PhoneCall,
  Bot,
  Users,
} from 'lucide-react';
import {
  runEngineTestSuite,
  runAcceptanceTestWorkflow,
  runCallingEngineTestSuite,
  TestResult,
  AcceptanceStepResult,
} from '../services/testSuite';
import { StorageAdapter } from '../services/storageAdapter';

interface TestSuitePageProps {
  onResetDatabase: () => void;
}

export const TestSuitePage: React.FC<TestSuitePageProps> = ({ onResetDatabase }) => {
  // M3 Calling Engine Suite state
  const [callingResults, setCallingResults] = useState<TestResult[]>([]);
  const [runningCallingSuite, setRunningCallingSuite] = useState<boolean>(false);

  // 15-Step Acceptance Test state
  const [acceptanceSteps, setAcceptanceSteps] = useState<AcceptanceStepResult[]>([]);
  const [runningAcceptance, setRunningAcceptance] = useState<boolean>(false);
  const [acceptanceSuccess, setAcceptanceSuccess] = useState<boolean | null>(null);

  // 7 Invariants Suite state
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningSuite, setRunningSuite] = useState<boolean>(false);

  const handleRunCallingSuite = async () => {
    setRunningCallingSuite(true);
    try {
      await runCallingEngineTestSuite((updated) => setCallingResults(updated));
    } finally {
      setRunningCallingSuite(false);
    }
  };

  const handleRunAcceptance = async () => {
    setRunningAcceptance(true);
    setAcceptanceSuccess(null);
    try {
      const res = await runAcceptanceTestWorkflow((updated) => setAcceptanceSteps(updated));
      setAcceptanceSuccess(res.success);
    } catch {
      setAcceptanceSuccess(false);
    } finally {
      setRunningAcceptance(false);
    }
  };

  const handleRunAllInvariants = async () => {
    setRunningSuite(true);
    try {
      await runEngineTestSuite((updated) => setTestResults(updated));
    } finally {
      setRunningSuite(false);
    }
  };

  const handleResetData = () => {
    StorageAdapter.resetAllData();
    onResetDatabase();
    setAcceptanceSteps([]);
    setAcceptanceSuccess(null);
    setTestResults([]);
    setCallingResults([]);
  };

  const passedCallingCount = callingResults.filter((t) => t.status === 'passed').length;
  const failedCallingCount = callingResults.filter((t) => t.status === 'failed').length;

  const passedTestsCount = testResults.filter((t) => t.status === 'passed').length;
  const failedTestsCount = testResults.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Engine Test & Verification Suite</h1>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#FAF8F3] text-[#C43D27] border border-[#F2C4BC] dark:bg-[#C43D27]/20 dark:text-[#F2C4BC] dark:border-[#C43D27]/40">
              CI / ACCEPTANCE
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Automated verification for M3 Calling Engine, Workspace Isolation, Double-Booking Guard, and 15-Step Clinical Workflow.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-database-btn"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-300 bg-[#FAF8F3] dark:bg-[#172B52] hover:bg-slate-200 dark:hover:bg-[#1C2E4C] rounded-xl border border-slate-200 dark:border-[#243B53] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: M3 Calling Engine & Workspace Isolation Suite */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-[#1C2E4C] bg-[#FAF8F3] dark:bg-[#172B52] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-[#C43D27] dark:text-[#E05A44]" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                M3 Calling Engine & Multi-Tenant Isolation Suite (6 Tests)
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Verifies Agent workspace boundaries, phone normalization, full call lifecycle, active call termination, carrier failure handling, and workspace metrics.
            </p>
          </div>

          <button
            id="run-calling-suite-btn"
            onClick={handleRunCallingSuite}
            disabled={runningCallingSuite}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <PlayCircle className={`w-4 h-4 ${runningCallingSuite ? 'animate-spin' : ''}`} />
            <span>{runningCallingSuite ? 'Running Calling Tests...' : 'Run M3 Calling Tests'}</span>
          </button>
        </div>

        {callingResults.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-[#101F3D] border-b border-slate-200 dark:border-[#1C2E4C] flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Calling Suite Results: {passedCallingCount}/{callingResults.length} Passed
            </span>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-emerald-600 font-bold">{passedCallingCount} Passed</span>
              {failedCallingCount > 0 && (
                <span className="text-rose-600 font-bold">{failedCallingCount} Failed</span>
              )}
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
          {callingResults.map((t) => (
            <div key={t.id} className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {t.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : t.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : t.status === 'running' ? (
                    <Clock className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </span>
                </div>
                {t.durationMs !== undefined && (
                  <span className="text-2xs font-mono text-slate-400">{t.durationMs}ms</span>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">{t.description}</p>

              {t.logs.length > 0 && (
                <div className="ml-6 mt-2 p-2.5 rounded-xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] text-[11px] font-mono text-slate-700 dark:text-slate-300 space-y-0.5">
                  {t.logs.map((log, i) => (
                    <div key={i}>• {log}</div>
                  ))}
                </div>
              )}

              {t.error && (
                <div className="ml-6 mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-mono">
                  Error: {t.error}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: 15-Step Acceptance Test Workflow */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-[#1C2E4C] bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold">15-Step End-to-End Acceptance Test Workflow</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Validates slot query → atomic booking → lock verification → double-booking prevention → cancellation → slot release.
            </p>
          </div>

          <button
            id="run-acceptance-test-btn"
            onClick={handleRunAcceptance}
            disabled={runningAcceptance}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <PlayCircle className={`w-4 h-4 ${runningAcceptance ? 'animate-spin' : ''}`} />
            <span>{runningAcceptance ? 'Executing 15 Steps...' : 'Run 15-Step Acceptance Test'}</span>
          </button>
        </div>

        {acceptanceSteps.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
            {acceptanceSteps.map((s) => (
              <div key={s.step} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-[#172B52] flex items-center justify-center font-mono font-bold text-slate-700 dark:text-slate-300 text-2xs">
                    {s.step}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{s.description}</span>
                    <p className="text-slate-500 dark:text-slate-400 text-2xs font-mono mt-0.5">{s.detail}</p>
                  </div>
                </div>

                {s.status === 'passed' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : s.status === 'failed' ? (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: 7 Invariants Suite */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-[#1C2E4C] bg-[#FAF8F3] dark:bg-[#172B52] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Core Engine Invariants Suite (7 Invariants)
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Verifies all invariant mathematical rules across working hours, slot exclusivity, and input validation.
            </p>
          </div>

          <button
            onClick={handleRunAllInvariants}
            disabled={runningSuite}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            <PlayCircle className={`w-4 h-4 ${runningSuite ? 'animate-spin' : ''}`} />
            <span>{runningSuite ? 'Running Invariants...' : 'Run 7 Invariants'}</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
          {testResults.map((t) => (
            <div key={t.id} className="p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {t.status === 'passed' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : t.status === 'failed' ? (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</span>
                </div>
                {t.durationMs !== undefined && (
                  <span className="text-2xs font-mono text-slate-400">{t.durationMs}ms</span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">{t.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
