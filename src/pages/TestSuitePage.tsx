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
} from 'lucide-react';
import {
  runEngineTestSuite,
  runAcceptanceTestWorkflow,
  TestResult,
  AcceptanceStepResult,
} from '../services/testSuite';
import { StorageAdapter } from '../services/storageAdapter';

interface TestSuitePageProps {
  onResetDatabase: () => void;
}

export const TestSuitePage: React.FC<TestSuitePageProps> = ({ onResetDatabase }) => {
  // 15-Step Acceptance Test state
  const [acceptanceSteps, setAcceptanceSteps] = useState<AcceptanceStepResult[]>([]);
  const [runningAcceptance, setRunningAcceptance] = useState<boolean>(false);
  const [acceptanceSuccess, setAcceptanceSuccess] = useState<boolean | null>(null);

  // 7 Invariants Suite state
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [runningSuite, setRunningSuite] = useState<boolean>(false);

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
  };

  const passedTestsCount = testResults.filter((t) => t.status === 'passed').length;
  const failedTestsCount = testResults.filter((t) => t.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0A2540] dark:text-white">Engine Test & Verification Suite</h1>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold bg-[#F0F4F8] text-[#0A2540] border border-[#D9E2EC] dark:bg-[#172B52] dark:text-sky-300 dark:border-[#243B53]">
              CI / ACCEPTANCE
            </span>
          </div>
          <p className="text-xs text-[#486581] dark:text-slate-400 mt-0.5">
            Automated verification for double booking prevention, slot math, cancellations, and the 15-step acceptance workflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="reset-database-btn"
            onClick={handleResetData}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0A2540] dark:text-slate-300 bg-[#F0F4F8] dark:bg-[#172B52] hover:bg-[#D9E2EC] dark:hover:bg-[#1C2E4C] rounded-xl border border-[#D9E2EC] dark:border-[#243B53] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: 15-Step Final Acceptance Test */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-[#1C2E4C] bg-[#0A2540] text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-300" />
              <h2 className="text-base sm:text-lg font-bold text-white">15-Step Final Acceptance Workflow</h2>
            </div>
            <p className="text-xs text-slate-200 mt-1 max-w-xl">
              Simulates the full end-to-end Dr. Sharma 4:00 PM booking, duplicate rejection, and cancellation slot restoration sequence.
            </p>
          </div>

          <button
            id="run-acceptance-workflow-btn"
            disabled={runningAcceptance}
            onClick={handleRunAcceptance}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
              runningAcceptance
                ? 'bg-[#1C2E4C] text-slate-400 cursor-not-allowed'
                : 'bg-white text-[#0A2540] hover:bg-slate-100 active:bg-slate-200 active:scale-95'
            }`}
          >
            {runningAcceptance ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A2540] border-t-transparent rounded-full animate-spin" />
                <span>Running Workflow...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-[#0A2540]" />
                <span>Execute 15-Step Test</span>
              </>
            )}
          </button>
        </div>

        <div className="p-6">
          {acceptanceSteps.length === 0 ? (
            <div className="text-center py-8 text-[#627D98] dark:text-slate-400">
              <ShieldCheck className="w-10 h-10 text-[#829AB1] dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0A2540] dark:text-slate-200">Ready to execute acceptance workflow</p>
              <p className="text-xs text-[#627D98] dark:text-slate-400 mt-1">
                Click "Execute 15-Step Test" above to run the live verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptanceSuccess !== null && (
                <div
                  className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
                    acceptanceSuccess
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {acceptanceSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Acceptance Test Passed! All 15 steps verified successfully with 0 errors.</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>Acceptance Test Failed. Please check the step logs below.</span>
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {acceptanceSteps.map((s) => (
                  <div
                    key={s.step}
                    id={`acceptance-step-${s.step}`}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                      s.status === 'passed'
                        ? 'bg-[#F0F4F8] dark:bg-[#172B52]/50 border-[#D9E2EC] dark:border-[#243B53] text-[#0A2540] dark:text-slate-200'
                        : s.status === 'failed'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : s.status === 'running'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-slate-50 dark:bg-[#172B52]/40 border-slate-200 dark:border-[#243B53] text-[#627D98] dark:text-slate-400'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {s.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : s.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : s.status === 'running' ? (
                        <div className="w-4 h-4 border-2 border-amber-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-2xs font-bold px-1.5 py-0.5 rounded bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] text-[#0A2540] dark:text-slate-300">
                          Step {s.step}
                        </span>
                        <p className="text-xs font-semibold">{s.description}</p>
                      </div>
                      {s.detail && (
                        <p className="text-2xs font-mono text-[#334E68] dark:text-slate-300 mt-1 truncate bg-white/80 dark:bg-[#101F3D]/80 px-2 py-0.5 rounded border border-slate-100 dark:border-[#1C2E4C]">
                          {s.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: 7 Core Invariant Unit Tests */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-[#1C2E4C] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-base font-bold text-[#0A2540] dark:text-white">7 Core Scheduling Invariant Tests</h2>
            <p className="text-xs text-[#486581] dark:text-slate-400 mt-0.5">
              Programmatic validation for edge cases, non-overlapping multi-doctor slots, and input sanitation
            </p>
          </div>

          <div className="flex items-center gap-3">
            {testResults.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-[#003865] dark:text-sky-300 font-bold">{passedTestsCount} Passed</span>
                {failedTestsCount > 0 && <span className="text-rose-600 dark:text-rose-400 font-bold">{failedTestsCount} Failed</span>}
              </div>
            )}
            <button
              id="run-invariants-suite-btn"
              disabled={runningSuite}
              onClick={handleRunAllInvariants}
              className="px-4 py-2 bg-[#0A2540] hover:bg-[#103B66] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Run All 7 Tests</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-[#627D98] dark:text-slate-400">
              <Terminal className="w-10 h-10 text-[#829AB1] dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#0A2540] dark:text-slate-200">Invariant tests not yet executed</p>
              <p className="text-xs text-[#627D98] dark:text-slate-400 mt-1">
                Click "Run All 7 Tests" to test concurrent constraints and validation filters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((test) => (
                <div
                  key={test.id}
                  id={`invariant-test-${test.id}`}
                  className={`p-4 rounded-xl border transition-all ${
                    test.status === 'passed'
                      ? 'bg-slate-50 dark:bg-[#172B52]/50 border-slate-200 dark:border-[#243B53]'
                      : test.status === 'failed'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                      : 'bg-slate-50/50 dark:bg-[#172B52]/30 border-slate-200 dark:border-[#243B53]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        {test.status === 'passed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : test.status === 'failed' ? (
                          <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        ) : test.status === 'running' ? (
                          <div className="w-5 h-5 border-2 border-[#0A2540] dark:border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Clock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-2xs font-bold text-[#627D98] dark:text-slate-400">
                            Test #{test.id}
                          </span>
                          <h3 className="font-bold text-[#0A2540] dark:text-white text-sm">{test.name}</h3>
                          {test.durationMs !== undefined && (
                            <span className="text-2xs font-mono text-[#829AB1]">
                              ({test.durationMs}ms)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#486581] dark:text-slate-300 mt-0.5">{test.description}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-2xs font-mono font-bold uppercase tracking-wider ${
                        test.status === 'passed'
                          ? 'bg-[#F0F4F8] dark:bg-[#172B52] text-[#0A2540] dark:text-sky-300 border border-[#D9E2EC] dark:border-[#243B53]'
                          : test.status === 'failed'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          : 'bg-slate-200 dark:bg-[#172B52] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {test.status}
                    </span>
                  </div>

                  {/* Execution Logs */}
                  {test.logs.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-[#243B53] font-mono text-2xs space-y-1 bg-[#0A2540] text-slate-200 p-3 rounded-lg">
                      {test.logs.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-sky-300">›</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {test.error && (
                    <div className="mt-2 p-2 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-xs font-mono rounded">
                      Error: {test.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
