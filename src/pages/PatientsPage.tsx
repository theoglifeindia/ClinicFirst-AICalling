import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Phone,
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Patient, AppointmentWithDetails } from '../types/database';
import { getPatients } from '../services/patientService';

interface PatientsPageProps {
  appointments: AppointmentWithDetails[];
  onOpenBooking: (doctorId?: string, date?: string, slot?: string) => void;
}

export const PatientsPage: React.FC<PatientsPageProps> = ({ appointments, onOpenBooking }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPatients = async () => {
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [appointments]);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#101F3D] p-5 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Patients & Clinic Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-semibold bg-[#FAF8F3] text-slate-800 border border-slate-200 dark:bg-[#172B52] dark:text-slate-200 dark:border-[#243B53]">
              {patients.length} Registered Patients
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Phone-indexed patient master records with linked appointment histories
          </p>
        </div>

        <button
          onClick={() => onOpenBooking()}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#C43D27] hover:bg-[#B03420] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white dark:bg-[#101F3D] p-4 rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex items-center gap-3 transition-colors">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by patient name or phone number (+91...)"
          className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-900 dark:text-white"
        />
      </div>

      {/* Patients Table */}
      <div className="bg-white dark:bg-[#101F3D] rounded-2xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden transition-colors">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">Loading patient directory...</div>
        ) : filteredPatients.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <Users className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">No patients found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Patients are automatically registered when their first appointment is booked.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#FAF8F3] dark:bg-[#172B52]/60 border-b border-slate-200 dark:border-[#1C2E4C] text-slate-500 dark:text-slate-400 font-mono">
                  <th className="py-3 px-4 font-semibold">Patient Name</th>
                  <th className="py-3 px-4 font-semibold">Phone Number</th>
                  <th className="py-3 px-4 font-semibold">Total Appointments</th>
                  <th className="py-3 px-4 font-semibold">Registered Date</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
                {filteredPatients.map((patient) => {
                  const patientAppointments = appointments.filter(
                    (a) => a.patient_id === patient.id || a.patient?.phone === patient.phone
                  );

                  return (
                    <tr key={patient.id} className="hover:bg-[#FAF8F3]/70 dark:hover:bg-[#172B52]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF8F3] text-[#C43D27] dark:bg-[#172B52] dark:text-[#E05A44] border border-slate-200 dark:border-[#243B53] font-bold flex items-center justify-center text-xs">
                            {patient.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block">
                              {patient.name}
                            </span>
                            <span className="text-2xs font-mono text-slate-400">ID: {patient.id.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{patient.phone}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#FAF8F3] dark:bg-[#172B52] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-[#243B53]">
                          {patientAppointments.length} Bookings
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-2xs">
                        {patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-IN') : 'Standard'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onOpenBooking()}
                          className="px-2.5 py-1 text-2xs font-semibold text-[#C43D27] dark:text-[#E05A44] hover:bg-[#FAF8F3] dark:hover:bg-[#172B52] border border-slate-200 dark:border-[#243B53] rounded-lg transition-colors cursor-pointer"
                        >
                          Book Visit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
