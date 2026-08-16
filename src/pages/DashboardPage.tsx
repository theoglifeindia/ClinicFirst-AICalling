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
  Mic,
  Bot,
} from 'lucide-react';
import { Doctor, AppointmentWithDetails } from '../types/database';
import { formatTo12Hour, formatDisplayDate } from '../utils/timeUtils';

interface DashboardPageProps {
  doctors: Doctor[];
  appointments: AppointmentWithDetails[];
  todayStr: string;
  onOpenBooking: (doctorId?: string, date?: string, slot?: string) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onNavigateToTab: (tab: 'appointments' | 'doctors' | 'availability' | 'testsuite' | 'schema' | 'receptionist') => void;
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
      {/* Clean Minimalist White Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left 2 Cols: Main Banner */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101F3D] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#1C2E4C] shadow-xs relative overflow-hidden flex flex-col justify-between transition-colors">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#FAF8F3] text-[#C43D27] border border-[#F2C4BC] dark:bg-[#C43D27]/20 dark:text-[#F2C4BC] dark:border-[#C43D27]/40">
                CLINICFIRST ENGINE
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Asia/Kolkata (IST)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              India's fastest growing clinic network
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium mt-1 max-w-xl">
              Trusted across India for safe, double-booking protected healthcare appointments.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                id="dashboard-test-ai-receptionist-btn"
                onClick={() => onNavigateToTab('receptionist')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-white/90" />
                <span>Test AI Receptionist (Voice)</span>
              </button>
              <button
                onClick={() => onNavigateToTab('testsuite')}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#243B53] text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#1C2E4C] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-[#C43D27] dark:text-[#E05A44]" />
                <span>Engine Tests</span>
              </button>
            </div>
          </div>

          {/* Stats Floating Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-[#1C2E4C] relative z-10">
            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <UserCheck className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <span className="text-xs font-bold font-mono">2,000+</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Patients Served</p>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <Stethoscope className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <span className="text-xs font-bold font-mono">100%</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Verified Slots</p>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold font-mono">0 Conflict</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Atomic Concurrency</p>
            </div>

            <div className="bg-[#FAF8F3] dark:bg-[#172B52]/50 rounded-2xl p-3 border border-slate-200 dark:border-[#243B53]">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
                <Clock className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
                <span className="text-xs font-bold font-mono">30 Min</span>
              </div>
              <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium">Fixed Duration</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Consultation Card */}
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Book consultation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select doctor and get instant confirmed slot
            </p>

            <div className="mt-4 space-y-3">
              <div className="p-2.5 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53] text-xs">
                <span className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">Select Doctor</span>
                <span className="font-bold text-slate-900 dark:text-white">{drSharma?.name || 'All Doctors'}</span>
              </div>

              <div className="p-2.5 bg-[#FAF8F3] dark:bg-[#172B52] rounded-xl border border-slate-200 dark:border-[#243B53] text-xs">
                <span className="text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold block">Clinic Location</span>
                <span className="font-bold text-slate-900 dark:text-white">Nagpur (OPD Block A)</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#1C2E4C] space-y-2">
            <button
              id="hero-quick-book-btn"
              onClick={() => onOpenBooking(drSharma?.id, todayStr)}
              className="w-full py-3 bg-[#C43D27] hover:bg-[#B03420] text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[10px] text-center text-slate-500 dark:text-slate-400">
              Guaranteed atomic slot reservation
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Schedule</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{todayAppointments.length}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{confirmedToday.length} confirmed active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Upcoming</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{upcomingAppointments.length}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Across all doctors</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Doctors</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{doctors.length}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Available for bookings</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex items-center justify-between transition-colors">
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Double-Booking Guard</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">100% Guaranteed</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Real-Time Slot Lock</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments & Doctor Shift Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Appointments Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1C2E4C] flex justify-between items-center bg-[#FAF8F3] dark:bg-[#172B52]">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Today's Appointments</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{formatDisplayDate(todayStr)}</p>
            </div>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs font-bold text-[#C43D27] dark:text-[#E05A44] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              View All ({appointments.length}) <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4">
            {todayAppointments.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900 dark:text-white">No appointments scheduled for today.</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Use the button below to book a patient slot.</p>
                <button
                  onClick={() => onOpenBooking(drSharma?.id, todayStr)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book for Today</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    id={`dashboard-apt-${apt.id}`}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F3] dark:hover:bg-[#172B52]/50 p-2.5 rounded-xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52] border border-slate-200 dark:border-[#243B53] text-slate-900 dark:text-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold font-mono">
                          {apt.start_time}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{apt.patient_name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-2xs font-bold uppercase font-mono ${
                              apt.status === 'confirmed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                                : apt.status === 'cancelled'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
                                : 'bg-[#FAF8F3] text-slate-700 dark:bg-[#172B52] dark:text-slate-300'
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
                      <span className="text-2xs font-mono uppercase bg-[#FAF8F3] dark:bg-[#172B52] text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-[#243B53]">
                        {apt.source}
                      </span>
                      {apt.status === 'confirmed' && (
                        <button
                          id={`cancel-apt-btn-${apt.id}`}
                          onClick={() => onCancelAppointment(apt.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
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
          <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs p-5 transition-colors">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#C43D27] dark:text-[#E05A44]" />
              <span>Doctor Shifts & Working Hours</span>
            </h3>

            <div className="space-y-3">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl bg-[#FAF8F3] dark:bg-[#172B52]/60 border border-slate-200 dark:border-[#243B53] space-y-2 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{doc.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{doc.specialty}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold bg-white dark:bg-[#101F3D] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-[#243B53]">
                      Active
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-200/60 dark:border-[#243B53] font-mono">
                    {doc.name.includes('Sharma') ? (
                      <>
                        <div className="flex justify-between">
                          <span>Mon - Fri:</span>
                          <span className="font-bold text-slate-900 dark:text-white">10:00 AM - 1:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Evening:</span>
                          <span className="font-bold text-slate-900 dark:text-white">4:00 PM - 7:00 PM</span>
                        </div>
                        <div className="flex justify-between text-slate-900 dark:text-white font-bold">
                          <span>Slot Duration:</span>
                          <span>30 mins</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span>Mon - Fri:</span>
                          <span className="font-bold text-slate-900 dark:text-white">09:00 AM - 12:00 PM</span>
                        </div>
                        <div className="flex justify-between text-slate-900 dark:text-white font-bold">
                          <span>Slot Duration:</span>
                          <span>30 mins</span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenBooking(doc.id, todayStr)}
                    className="w-full mt-2 py-1.5 text-xs font-bold bg-[#C43D27] hover:bg-[#B03420] text-white rounded-lg transition-colors text-center cursor-pointer shadow-2xs"
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

