import React from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  Play,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { Doctor, AppointmentWithDetails } from '../types/database';
import { formatTo12Hour, formatDisplayDate } from '../utils/timeUtils';

interface DashboardPageProps {
  doctors: Doctor[];
  appointments: AppointmentWithDetails[];
  todayStr: string;
  onOpenBooking: (doctorId?: string, date?: string, slot?: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onNavigateToTab: (tab: 'appointments' | 'doctors' | 'availability' | 'testsuite' | 'schema') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  doctors,
  appointments,
  todayStr,
  onOpenBooking,
  onCancelAppointment,
  onNavigateToTab,
}) => {
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);
  const confirmedToday = todayAppointments.filter((a) => a.status === 'confirmed');
  const upcomingAppointments = appointments.filter(
    (a) => a.appointment_date >= todayStr && a.status === 'confirmed'
  );

  const drSharma = doctors.find((d) => d.name.includes('Sharma')) || doctors[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Clinic Overview & Reception Header */}
      <div className="bg-[#FFFEFA] dark:bg-slate-900/90 rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-[#E8E3D7] dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors">
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#008768] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                CLINIC ENGINE ACTIVE
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Asia/Kolkata (IST)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Clinic Overview & Reception Core
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Reliable, double-booking-protected appointment scheduling for Indian clinics and OPD practices.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="dashboard-view-appointments-btn"
              onClick={() => onNavigateToTab('appointments')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5F2E9] hover:bg-[#EAE4D7] dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs sm:text-sm rounded-xl border border-[#E8E3D7] dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-4 h-4 text-[#008768] dark:text-cyan-400" />
              <span>View Appointments</span>
            </button>

            <button
              id="dashboard-run-tests-btn"
              onClick={() => onNavigateToTab('testsuite')}
              className="inline-flex items-center gap-2 px-4 py-2.5 theme-btn-primary font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Verify Core Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Schedule</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{todayAppointments.length}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{confirmedToday.length} confirmed active</p>
          </div>
          <div className="w-11 h-11 rounded-xl theme-bg-light theme-text-primary flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Upcoming</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{upcomingAppointments.length}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Across all doctors</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Doctors</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{doctors.length}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Available for bookings</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Double-Booking Guard</p>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">100% Guaranteed</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">Real-Time Slot Lock</p>
          </div>
          <div className="w-11 h-11 rounded-xl theme-bg-light text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Doctor Shift Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Appointments Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Today's Appointments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDisplayDate(todayStr)}</p>
            </div>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs font-bold theme-text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              View All ({appointments.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4">
            {todayAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No appointments scheduled for today.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use the button below to book a patient slot.</p>
                <button
                  onClick={() => onOpenBooking(drSharma?.id, todayStr)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl theme-btn-primary text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book for Today</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    id={`dashboard-apt-${apt.id}`}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {apt.start_time}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{apt.patient_name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase font-mono ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : apt.status === 'cancelled'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {apt.doctor_name} ({apt.doctor_specialty}) • {apt.patient_phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-2xs font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {apt.source}
                      </span>
                      {apt.status === 'confirmed' && (
                        <button
                          id={`cancel-apt-btn-${apt.id}`}
                          onClick={() => onCancelAppointment(apt.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Active Doctors & Working Hours Preview */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 theme-text-primary" />
              <span>Doctor Shifts & Working Hours</span>
            </h3>

            <div className="space-y-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 space-y-2 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialty}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold theme-badge">
                      Active
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50 font-mono">
                    {doc.name.includes('Sharma') ? (
                      <>
                        <div className="flex justify-between">
                          <span>Mon - Fri:</span>
                          <span className="font-medium text-slate-900 dark:text-white">10:00 AM - 1:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Evening:</span>
                          <span className="font-medium text-slate-900 dark:text-white">4:00 PM - 7:00 PM</span>
                        </div>
                        <div className="flex justify-between theme-text-primary font-semibold">
                          <span>Slot Duration:</span>
                          <span>30 mins</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Mon - Fri:</span>
                          <span className="font-medium text-slate-900 dark:text-white">09:00 AM - 12:00 PM</span>
                        </div>
                        <div className="flex justify-between theme-text-primary font-semibold">
                          <span>Slot Duration:</span>
                          <span>30 mins</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenBooking(doc.id, todayStr)}
                    className="w-full mt-2 py-1.5 text-xs font-bold theme-btn-primary rounded-lg transition-colors text-center cursor-pointer"
                  >
                    Check & Book Slot
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
