import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Clock,
  Calendar,
  CheckCircle2,
  PlusCircle,
  Plus,
  ArrowRight,
  Trash2,
  X,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Doctor, DoctorAvailability } from '../types/database';
import { getDoctorAvailability, createDoctor, deleteDoctor } from '../services/doctorService';
import { formatTo12Hour, getDayName } from '../utils/timeUtils';
import { useWorkspace } from '../context/WorkspaceContext';

interface DoctorsPageProps {
  doctors: Doctor[];
  onOpenBooking: (doctorId: string) => void;
  onExploreAvailability: (doctorId: string) => void;
  onRefreshDoctors?: () => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  onOpenBooking,
  onExploreAvailability,
  onRefreshDoctors,
}) => {
  const { currentWorkspace } = useWorkspace();
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [schedules, setSchedules] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [docName, setDocName] = useState<string>('');
  const [docSpecialty, setDocSpecialty] = useState<string>('General Physician');
  const [morningStart, setMorningStart] = useState<string>('10:00');
  const [morningEnd, setMorningEnd] = useState<string>('13:00');
  const [hasEveningShift, setHasEveningShift] = useState<boolean>(true);
  const [eveningStart, setEveningStart] = useState<string>('16:00');
  const [eveningEnd, setEveningEnd] = useState<string>('19:00');
  const [slotDuration, setSlotDuration] = useState<number>(30);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon - Fri
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Keep selected doctor in sync if doctors list changes
  useEffect(() => {
    if (!selectedDoctorId && doctors.length > 0) {
      setSelectedDoctorId(doctors[0].id);
    } else if (selectedDoctorId && !doctors.some((d) => d.id === selectedDoctorId)) {
      setSelectedDoctorId(doctors[0]?.id || '');
    }
  }, [doctors, selectedDoctorId]);

  useEffect(() => {
    if (!selectedDoctorId) {
      setSchedules([]);
      return;
    }
    setLoading(true);
    getDoctorAvailability(selectedDoctorId)
      .then((data) => setSchedules(data))
      .finally(() => setLoading(false));
  }, [selectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  const handleToggleDay = (day: number) => {
    if (workingDays.includes(day)) {
      if (workingDays.length > 1) {
        setWorkingDays(workingDays.filter((d) => d !== day));
      }
    } else {
      setWorkingDays([...workingDays, day].sort());
    }
  };

  const handleCreateDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) {
      setModalError('Doctor name is required (e.g. Dr. Jane Smith).');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      const newDoc = await createDoctor(
        {
          clinic_id: currentWorkspace.id,
          name: docName.trim(),
          specialty: docSpecialty.trim() || 'General Physician',
          active: true,
        },
        {
          morningStart,
          morningEnd,
          eveningStart: hasEveningShift ? eveningStart : undefined,
          eveningEnd: hasEveningShift ? eveningEnd : undefined,
          slotDurationMinutes: slotDuration,
          workingDays,
        }
      );

      setShowAddModal(false);
      setDocName('');
      setSelectedDoctorId(newDoc.id);
      if (onRefreshDoctors) {
        onRefreshDoctors();
      }
    } catch (err: any) {
      setModalError(err?.message || 'Failed to create doctor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoctor = async (docId: string, docName: string) => {
    if (window.confirm(`Are you sure you want to remove ${docName}? This will remove their working schedules.`)) {
      try {
        await deleteDoctor(docId);
        if (onRefreshDoctors) {
          onRefreshDoctors();
        }
      } catch (err) {
        console.error('Failed to delete doctor', err);
      }
    }
  };

  const DAY_LABELS = [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
    { day: 6, label: 'Sat' },
    { day: 0, label: 'Sun' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Clinic Doctors & Working Schedules</h1>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider bg-[#C43D27]/10 text-[#C43D27] dark:bg-[#C43D27]/20 dark:text-[#E05A44]">
              {currentWorkspace.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure physician shifts, working hours, and slot durations for this clinic tenant
          </p>
        </div>

        <button
          id="btn-add-doctor-header"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Doctor</span>
        </button>
      </div>

      {doctors.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white dark:bg-[#101F3D] rounded-3xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center mx-auto">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Doctors Configured Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This clinic tenant ({currentWorkspace.name}) currently has no active doctors. Add your first physician to start generating bookable appointment slots.
            </p>
          </div>
          <button
            id="btn-add-doctor-empty-state"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Doctor to {currentWorkspace.name}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 1 Col: Doctors List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Physicians ({doctors.length})
              </h2>
              <button
                id="btn-add-doctor-list-action"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline cursor-pointer flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add Doctor</span>
              </button>
            </div>

            {doctors.map((doc) => {
              const isSelected = doc.id === selectedDoctorId;
              return (
                <div
                  key={doc.id}
                  id={`doctor-card-${doc.id}`}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C43D27] text-white border-[#C43D27] shadow-sm'
                      : 'bg-white dark:bg-[#101F3D] text-slate-900 dark:text-white border-slate-200 dark:border-[#1C2E4C] hover:border-[#C43D27]/40 hover:bg-[#FAF8F3]/60 dark:hover:bg-[#172B52]/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44]'
                        }`}
                      >
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base">{doc.name}</h3>
                        <p className={`text-xs ${isSelected ? 'text-white/85' : 'text-slate-500 dark:text-slate-400'}`}>
                          {doc.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold uppercase ${
                          doc.active
                            ? isSelected
                              ? 'bg-white/20 text-white border border-white/30'
                              : 'bg-[#FAF8F3] text-slate-800 border border-slate-200 dark:bg-[#172B52] dark:text-white dark:border-[#243B53]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        Active
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDoctor(doc.id, doc.name);
                        }}
                        title="Remove doctor"
                        className={`p-1 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/30 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBooking(doc.id);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white text-[#C43D27] hover:bg-slate-50'
                          : 'bg-[#C43D27] text-white hover:bg-[#B03420]'
                      }`}
                    >
                      Book Slot
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExploreAvailability(doc.id);
                      }}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-white/40 hover:bg-white/10 text-white'
                          : 'border-slate-200 dark:border-[#243B53] hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      View Slots
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Cols: Shift Schedule Details for Selected Doctor */}
          <div className="lg:col-span-2 bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs p-6 transition-colors">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-[#1C2E4C]">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedDoctor?.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF8F3] dark:bg-[#172B52] text-slate-800 dark:text-white border border-slate-200 dark:border-[#243B53]">
                    {selectedDoctor?.specialty}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Standard recurring weekly availability rules for slot calculation
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenBooking(selectedDoctor?.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Configured Shifts & Slot Breakdown ({schedules.length} Shifts)
                </h3>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 text-xs">Loading schedules...</div>
              ) : schedules.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 bg-[#FAF8F3] dark:bg-[#172B52]/60 rounded-xl border border-slate-200 dark:border-[#1C2E4C] text-xs">
                  No active availability schedules found for this doctor.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {schedules.map((sch) => (
                    <div
                      key={sch.id}
                      className="p-4 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52]/60 border border-slate-200 dark:border-[#243B53] space-y-2 hover:bg-[#F2ECE1] dark:hover:bg-[#172B52] transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{getDayName(sch.day_of_week)}</span>
                        <span className="text-2xs font-mono px-2 py-0.5 rounded bg-white dark:bg-[#101F3D] text-slate-800 dark:text-white border border-slate-200 dark:border-[#243B53] font-bold">
                          {sch.slot_duration_minutes} min slots
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-slate-900 dark:text-white">
                        <Clock className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                        <span className="font-bold">
                          {formatTo12Hour(sch.start_time)} - {formatTo12Hour(sch.end_time)}
                        </span>
                      </div>

                      <p className="text-2xs text-slate-500 dark:text-slate-400">
                        Calculated working interval: {sch.start_time} to {sch.end_time}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Doctor & Shift Schedule</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Scoped to {currentWorkspace.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172B52] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDoctorSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Doctor Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Verma"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Specialty / Department
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. General Physician"
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                  />
                </div>
              </div>

              {/* Working Days */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Working Days of Week
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DAY_LABELS.map(({ day, label }) => {
                    const isSelected = workingDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#C43D27] text-white shadow-2xs'
                            : 'bg-[#FAF8F3] dark:bg-[#172B52] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#243B53] hover:bg-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slot Duration */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Consultation Slot Duration
                </label>
                <select
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                >
                  <option value={15}>15 Minutes per Slot</option>
                  <option value={20}>20 Minutes per Slot</option>
                  <option value={30}>30 Minutes per Slot (Standard)</option>
                  <option value={45}>45 Minutes per Slot</option>
                  <option value={60}>60 Minutes per Slot</option>
                </select>
              </div>

              {/* Shift Hours */}
              <div className="p-3.5 rounded-2xl bg-[#FAF8F3] dark:bg-[#172B52]/50 border border-slate-200 dark:border-[#243B53] space-y-3">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C43D27]" />
                  <span>Morning Shift Hours</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={morningStart}
                      onChange={(e) => setMorningStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#243B53] bg-white dark:bg-[#101F3D] text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                    <input
                      type="time"
                      value={morningEnd}
                      onChange={(e) => setMorningEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#243B53] bg-white dark:bg-[#101F3D] text-xs font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-[#243B53]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C43D27]" />
                      <span>Evening Shift Hours</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasEveningShift}
                        onChange={(e) => setHasEveningShift(e.target.checked)}
                        className="rounded accent-[#C43D27]"
                      />
                      <span>Enable</span>
                    </label>
                  </div>

                  {hasEveningShift && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={eveningStart}
                          onChange={(e) => setEveningStart(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#243B53] bg-white dark:bg-[#101F3D] text-xs font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">End Time</label>
                        <input
                          type="time"
                          value={eveningEnd}
                          onChange={(e) => setEveningEnd(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#243B53] bg-white dark:bg-[#101F3D] text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-create-doctor"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving Doctor...' : 'Save & Configure Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
