import React, { useState, useEffect } from 'react';
import { Stethoscope, Clock, Calendar, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';
import { Doctor, DoctorAvailability } from '../types/database';
import { getDoctorAvailability } from '../services/doctorService';
import { formatTo12Hour, getDayName } from '../utils/timeUtils';

interface DoctorsPageProps {
  doctors: Doctor[];
  onOpenBooking: (doctorId: string) => void;
  onExploreAvailability: (doctorId: string) => void;
}

export const DoctorsPage: React.FC<DoctorsPageProps> = ({
  doctors,
  onOpenBooking,
  onExploreAvailability,
}) => {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || '');
  const [schedules, setSchedules] = useState<DoctorAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedDoctorId) return;
    setLoading(true);
    getDoctorAvailability(selectedDoctorId)
      .then((data) => setSchedules(data))
      .finally(() => setLoading(false));
  }, [selectedDoctorId]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Clinic Doctors & Working Schedules</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configured physician shifts, working hours, and slot durations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Doctors List */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Active Physicians</h2>
          {doctors.map((doc) => {
            const isSelected = doc.id === selectedDoctorId;
            return (
              <div
                key={doc.id}
                id={`doctor-card-${doc.id}`}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'theme-hero-gradient text-white border-slate-700/50 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'theme-bg-light theme-text-primary'
                      }`}
                    >
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">{doc.name}</h3>
                      <p className={`text-xs ${isSelected ? 'text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {doc.specialty}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold uppercase ${
                      doc.active
                        ? isSelected
                          ? 'bg-white/20 text-white border border-white/30'
                          : 'theme-badge'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    Active
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/20 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBooking(doc.id);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 hover:bg-slate-100'
                        : 'theme-btn-primary'
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
                        ? 'border-white/30 hover:bg-white/10 text-white'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
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
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 transition-colors">
          <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedDoctor?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold theme-badge">
                  {selectedDoctor?.specialty}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Standard recurring weekly availability rules for slot calculation
              </p>
            </div>

            <button
              onClick={() => onOpenBooking(selectedDoctor?.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 theme-btn-primary text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Book Appointment</span>
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Configured Shifts & Slot Breakdown
            </h3>

            {loading ? (
              <div className="py-12 text-center text-slate-400">Loading schedules...</div>
            ) : schedules.length === 0 ? (
              <div className="p-6 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                No active availability schedules found for this doctor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {schedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{getDayName(sch.day_of_week)}</span>
                      <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                        {sch.slot_duration_minutes} min slots
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
                      <Clock className="w-4 h-4 theme-text-primary" />
                      <span className="font-bold text-slate-900 dark:text-white">
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
    </div>
  );
};
