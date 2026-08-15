import React, { useState } from 'react';
import {
  Calendar,
  Search,
  Filter,
  PlusCircle,
  XCircle,
  CheckCircle2,
  Phone,
  User,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Doctor, AppointmentStatus, AppointmentWithDetails } from '../types/database';
import { formatTo12Hour, formatDisplayDate } from '../utils/timeUtils';

interface AppointmentsPageProps {
  doctors: Doctor[];
  appointments: AppointmentWithDetails[];
  onOpenBooking: () => void;
  onCancelAppointment: (appointmentId: string) => void;
  onUpdateStatus: (appointmentId: string, status: AppointmentStatus) => void;
  onRefresh: () => void;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  doctors,
  appointments,
  onOpenBooking,
  onCancelAppointment,
  onUpdateStatus,
  onRefresh,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = appointments.filter((apt) => {
    if (selectedStatus !== 'all' && apt.status !== selectedStatus) return false;
    if (selectedDoctor !== 'all' && apt.doctor_id !== selectedDoctor) return false;
    if (selectedDate && apt.appointment_date !== selectedDate) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPatient = apt.patient_name?.toLowerCase().includes(q);
      const matchPhone = apt.patient_phone?.toLowerCase().includes(q);
      const matchDoctor = apt.doctor_name?.toLowerCase().includes(q);
      if (!matchPatient && !matchPhone && !matchDoctor) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Clinic Appointments</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage all booked, completed, and cancelled patient appointments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            title="Refresh list"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Table</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search patient, phone, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(selectedStatus !== 'all' || selectedDoctor !== 'all' || selectedDate || searchQuery) && (
          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              Showing {filtered.length} of {appointments.length} appointments
            </span>
            <button
              onClick={() => {
                setSelectedStatus('all');
                setSelectedDoctor('all');
                setSelectedDate('');
                setSearchQuery('');
              }}
              className="theme-text-primary hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-500 dark:text-slate-400">
            <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No appointments found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try adjusting your filters or book a new appointment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 uppercase text-2xs tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Patient</th>
                  <th className="py-3.5 px-4 font-semibold">Doctor</th>
                  <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Source</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((apt) => (
                  <tr key={apt.id} id={`apt-row-${apt.id}`} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Patient Column */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{apt.patient_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{apt.patient_phone}</span>
                      </div>
                    </td>

                    {/* Doctor Column */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{apt.doctor_name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{apt.doctor_specialty}</div>
                    </td>

                    {/* Date & Time Column */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">{formatDisplayDate(apt.appointment_date)}</div>
                      <div className="text-xs font-mono font-bold theme-text-primary flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTo12Hour(apt.start_time)} - {formatTo12Hour(apt.end_time)}
                        </span>
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider font-mono ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : apt.status === 'cancelled'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            : apt.status === 'completed'
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-sky-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>

                    {/* Source Column */}
                    <td className="py-3.5 px-4">
                      <span className="text-2xs font-mono uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {apt.source}
                      </span>
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      {apt.status === 'confirmed' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            id={`cancel-btn-${apt.id}`}
                            onClick={() => onCancelAppointment(apt.id)}
                            className="px-2.5 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
                          >
                            Cancel Slot
                          </button>
                          <button
                            onClick={() => onUpdateStatus(apt.id, 'completed')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
                          >
                            Complete
                          </button>
                        </div>
                      ) : (
                        <span className="text-2xs text-slate-400 font-mono">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
