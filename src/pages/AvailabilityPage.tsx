import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Stethoscope,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Code2,
  Copy,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Doctor, GetAvailabilityResponse } from '../types/database';
import { getAvailableSlots } from '../services/appointmentService';
import {
  formatTo12Hour,
  formatDisplayDate,
  getDateStringOffset,
  getTodayDateString,
  isDateInPast,
  timeToMinutes,
} from '../utils/timeUtils';

interface AvailabilityPageProps {
  doctors: Doctor[];
  initialDoctorId?: string;
  onBookSlot: (doctorId: string, date: string, slot: string) => void;
}

export const AvailabilityPage: React.FC<AvailabilityPageProps> = ({
  doctors,
  initialDoctorId,
  onBookSlot,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(
    initialDoctorId || (doctors[0]?.id || '')
  );
  const [date, setDate] = useState<string>(getDateStringOffset(0));
  const [availability, setAvailability] = useState<GetAvailabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const todayStr = getTodayDateString();
  const isPastDate = isDateInPast(date);

  useEffect(() => {
    if (initialDoctorId) {
      setSelectedDoctorId(initialDoctorId);
    }
  }, [initialDoctorId]);

  const fetchAvailability = async () => {
    if (!selectedDoctorId || !date) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAvailableSlots(selectedDoctorId, date);
      setAvailability(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to query availability');
      setAvailability(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedDoctorId, date]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Group slots into Morning (before 14:00) and Evening (after 14:00)
  const morningSlots = (availability?.available_slots || []).filter(
    (s) => timeToMinutes(s) < timeToMinutes('14:00')
  );
  const eveningSlots = (availability?.available_slots || []).filter(
    (s) => timeToMinutes(s) >= timeToMinutes('14:00')
  );

  const bookedSlots = availability?.booked_slots || [];

  const apiJsonPayload = availability
    ? JSON.stringify(
        {
          doctor: availability.doctor,
          date: availability.date,
          available_slots: availability.available_slots,
        },
        null,
        2
      )
    : '';

  const handleCopyJson = () => {
    navigator.clipboard.writeText(apiJsonPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Doctor Slot Availability Explorer</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time calculation engine with working hours and double-booking verification
          </p>
        </div>
      </div>

      {/* Selector Bar */}
      <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
            <select
              id="availability-doctor-select"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#FAF8F3] dark:bg-[#172B52]/60 border border-slate-200 dark:border-[#243B53] rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#172B52] focus:outline-none focus:ring-2 focus:ring-[#C43D27]/30"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id} className="bg-white dark:bg-[#101F3D] text-slate-900 dark:text-white">
                  {d.name} ({d.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Date</label>
              {isPastDate && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" /> Past date
                </span>
              )}
            </div>
            <input
              id="availability-date-select"
              type="date"
              min={todayStr}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2.5 bg-[#FAF8F3] dark:bg-[#172B52]/60 border rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-[#172B52] focus:outline-none focus:ring-2 ${
                isPastDate
                  ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/40 dark:bg-rose-950/30'
                  : 'border-slate-200 dark:border-[#243B53] focus:ring-[#C43D27]/30'
              }`}
            />
          </div>

          <div>
            <button
              onClick={fetchAvailability}
              className="w-full py-2.5 px-4 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Check Availability
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Slot Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs p-6 transition-colors">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-[#1C2E4C]">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedDoctor?.name} — {formatDisplayDate(date)}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isPastDate
                    ? 'Past date — historical slots cannot be explored or booked'
                    : 'Click any available slot to initiate direct booking'}
                </p>
              </div>

              {isPastDate ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> 0 Slots (Past Date)
                </span>
              ) : availability ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#FAF8F3] text-slate-800 border border-slate-200 dark:bg-[#172B52] dark:text-slate-200 dark:border-[#243B53]">
                  {availability.available_slots.length} Slots Open
                </span>
              ) : null}
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-[#C43D27] dark:border-white border-t-transparent mb-2" />
                <p className="text-xs">Calculating available slots...</p>
              </div>
            ) : error ? (
              <div className="p-6 my-4 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-800 text-xs">
                <p className="font-semibold">Availability Error</p>
                <p className="mt-1">{error}</p>
              </div>
            ) : isPastDate ? (
              <div className="p-8 my-6 text-center bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Back-Dated Exploration Prohibited</h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-md mx-auto">
                  The selected date ({formatDisplayDate(date)}) is in the past. Slots cannot be booked or generated for historical dates.
                </p>
                <button
                  onClick={() => setDate(todayStr)}
                  className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Jump to Today ({formatDisplayDate(todayStr)})
                </button>
              </div>
            ) : availability?.available_slots.length === 0 && bookedSlots.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 bg-[#FAF8F3] dark:bg-[#172B52]/60 rounded-xl my-4">
                <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Doctor not scheduled on this day.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Dr. Sharma is available Monday to Friday (10:00 AM-1:00 PM & 4:00 PM-7:00 PM).
                </p>
              </div>
            ) : (
              <div className="space-y-6 mt-6">
                {/* Morning Slots */}
                {morningSlots.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C43D27] dark:text-[#E05A44]" />
                      <span>Morning Shift (10:00 AM - 1:00 PM)</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {morningSlots.map((slot) => (
                        <button
                          key={slot}
                          id={`avail-slot-${slot.replace(':', '-')}`}
                          onClick={() => onBookSlot(selectedDoctorId, date, slot)}
                          className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] hover:border-[#C43D27] border border-slate-200 dark:border-[#243B53] rounded-xl text-center group transition-all shadow-2xs cursor-pointer"
                        >
                          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {formatTo12Hour(slot)}
                          </div>
                          <span className="text-2xs text-[#C43D27] dark:text-[#E05A44] font-bold">
                            Available • Book
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evening Slots */}
                {eveningSlots.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C43D27] dark:text-[#E05A44]" />
                      <span>Evening Shift (4:00 PM - 7:00 PM)</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {eveningSlots.map((slot) => (
                        <button
                          key={slot}
                          id={`avail-slot-${slot.replace(':', '-')}`}
                          onClick={() => onBookSlot(selectedDoctorId, date, slot)}
                          className="p-3 bg-[#FAF8F3] dark:bg-[#172B52] hover:border-[#C43D27] border border-slate-200 dark:border-[#243B53] rounded-xl text-center group transition-all shadow-2xs cursor-pointer"
                        >
                          <div className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {formatTo12Hour(slot)}
                          </div>
                          <span className="text-2xs text-[#C43D27] dark:text-[#E05A44] font-bold">
                            Available • Book
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Booked Slots summary */}
                {bookedSlots.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-[#1C2E4C]">
                    <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Occupied / Booked Slots ({bookedSlots.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {bookedSlots.map((slot) => (
                        <span
                          key={slot}
                          className="px-3 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-[#172B52] text-slate-500 dark:text-slate-400 line-through border border-slate-200 dark:border-[#243B53]"
                        >
                          {formatTo12Hour(slot)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Future AI Agent API Response Inspector */}
        <div className="space-y-4">
          <div className="bg-[#101F3D] text-slate-200 rounded-2xl p-5 border border-[#1C2E4C] shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-[#1C2E4C]">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#E05A44]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  AI Agent API Response
                </span>
              </div>
              <button
                onClick={handleCopyJson}
                className="p-1.5 rounded-lg bg-[#172B52] hover:bg-[#243B53] text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-2xs text-slate-400 mt-2">
              Exact JSON payload structure returned by <code className="text-[#E05A44] font-mono">getAvailableSlots(doctor_id, date)</code> for conversational LLMs & AI voice receptionists.
            </p>

            <pre className="mt-3 p-3 bg-[#0B1528] rounded-xl text-2xs font-mono text-slate-300 overflow-x-auto border border-[#1C2E4C]">
              {apiJsonPayload || '// Querying availability...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
