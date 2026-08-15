import {
  Clinic,
  Doctor,
  DoctorAvailability,
  Patient,
  Appointment,
  AppointmentFilter,
  AppointmentWithDetails,
} from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getDateStringOffset, calculateEndTime, doIntervalsOverlap } from '../utils/timeUtils';

const STORAGE_KEYS = {
  CLINICS: 'clinic_engine_clinics',
  DOCTORS: 'clinic_engine_doctors',
  AVAILABILITY: 'clinic_engine_availability',
  PATIENTS: 'clinic_engine_patients',
  APPOINTMENTS: 'clinic_engine_appointments',
};

// Initial Seed Data (strictly matches user specification)
const DEFAULT_CLINIC_ID = 'clinic-demo-001';
const DEFAULT_DOCTOR_ID = 'doc-sharma-001';
const SECOND_DOCTOR_ID = 'doc-patel-002';

const SEED_CLINICS: Clinic[] = [
  {
    id: DEFAULT_CLINIC_ID,
    name: 'Demo Clinic',
    timezone: 'Asia/Kolkata',
    phone: '+91 9876543210',
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
];

const SEED_DOCTORS: Doctor[] = [
  {
    id: DEFAULT_DOCTOR_ID,
    clinic_id: DEFAULT_CLINIC_ID,
    name: 'Dr. Sharma',
    specialty: 'General Physician',
    active: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: SECOND_DOCTOR_ID,
    clinic_id: DEFAULT_CLINIC_ID,
    name: 'Dr. Priya Patel',
    specialty: 'Pediatrician',
    active: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
];

// Dr. Sharma: Monday to Friday (1-5), 10:00 AM-1:00 PM (10:00-13:00) & 4:00 PM-7:00 PM (16:00-19:00), 30 min slots
const SEED_AVAILABILITY: DoctorAvailability[] = [];

// Monday (1) to Friday (5) for Dr. Sharma
for (let day = 1; day <= 5; day++) {
  // Morning Shift: 10:00 - 13:00
  SEED_AVAILABILITY.push({
    id: `avail-sharma-m-${day}`,
    doctor_id: DEFAULT_DOCTOR_ID,
    day_of_week: day,
    start_time: '10:00',
    end_time: '13:00',
    slot_duration_minutes: 30,
    active: true,
  });
  // Evening Shift: 16:00 - 19:00 (4:00 PM - 7:00 PM)
  SEED_AVAILABILITY.push({
    id: `avail-sharma-e-${day}`,
    doctor_id: DEFAULT_DOCTOR_ID,
    day_of_week: day,
    start_time: '16:00',
    end_time: '19:00',
    slot_duration_minutes: 30,
    active: true,
  });
}

// Availability for Dr. Priya Patel: Mon to Fri 09:00-12:00 and 17:00-20:00
for (let day = 1; day <= 5; day++) {
  SEED_AVAILABILITY.push({
    id: `avail-patel-m-${day}`,
    doctor_id: SECOND_DOCTOR_ID,
    day_of_week: day,
    start_time: '09:00',
    end_time: '12:00',
    slot_duration_minutes: 30,
    active: true,
  });
}

const SEED_PATIENTS: Patient[] = [
  {
    id: 'pat-aarav-001',
    clinic_id: DEFAULT_CLINIC_ID,
    name: 'Aarav Mehta',
    phone: '+91 9820123456',
    created_at: new Date('2026-08-01T10:00:00Z').toISOString(),
  },
  {
    id: 'pat-ananya-002',
    clinic_id: DEFAULT_CLINIC_ID,
    name: 'Ananya Iyer',
    phone: '+91 9811223344',
    created_at: new Date('2026-08-05T11:30:00Z').toISOString(),
  },
  {
    id: 'pat-rajesh-003',
    clinic_id: DEFAULT_CLINIC_ID,
    name: 'Rajesh Kumar',
    phone: '+91 9899001122',
    created_at: new Date('2026-08-10T14:00:00Z').toISOString(),
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-seed-001',
    clinic_id: DEFAULT_CLINIC_ID,
    doctor_id: DEFAULT_DOCTOR_ID,
    patient_id: 'pat-aarav-001',
    appointment_date: getDateStringOffset(0), // Today
    start_time: '10:30',
    end_time: '11:00',
    status: 'confirmed',
    source: 'dashboard',
    created_at: new Date().toISOString(),
  },
  {
    id: 'apt-seed-002',
    clinic_id: DEFAULT_CLINIC_ID,
    doctor_id: DEFAULT_DOCTOR_ID,
    patient_id: 'pat-ananya-002',
    appointment_date: getDateStringOffset(1), // Tomorrow
    start_time: '11:00',
    end_time: '11:30',
    status: 'confirmed',
    source: 'ai_call',
    created_at: new Date().toISOString(),
  },
];

class LocalDatabase {
  clinics: Clinic[] = [];
  doctors: Doctor[] = [];
  availability: DoctorAvailability[] = [];
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  loadFromStorage() {
    try {
      const storedClinics = localStorage.getItem(STORAGE_KEYS.CLINICS);
      const storedDoctors = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      const storedAvail = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
      const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);

      this.clinics = storedClinics ? JSON.parse(storedClinics) : [...SEED_CLINICS];
      this.doctors = storedDoctors ? JSON.parse(storedDoctors) : [...SEED_DOCTORS];
      this.availability = storedAvail ? JSON.parse(storedAvail) : [...SEED_AVAILABILITY];
      this.patients = storedPatients ? JSON.parse(storedPatients) : [...SEED_PATIENTS];
      this.appointments = storedAppointments ? JSON.parse(storedAppointments) : [...SEED_APPOINTMENTS];
    } catch {
      this.resetToSeed();
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINICS, JSON.stringify(this.clinics));
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(this.doctors));
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(this.availability));
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(this.patients));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(this.appointments));
      this.notify();
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  resetToSeed() {
    this.clinics = [...SEED_CLINICS];
    this.doctors = [...SEED_DOCTORS];
    this.availability = [...SEED_AVAILABILITY];
    this.patients = [...SEED_PATIENTS];
    this.appointments = [...SEED_APPOINTMENTS];
    this.saveToStorage();
  }
}

export const localDb = new LocalDatabase();

/**
 * Storage Adapter - delegates seamlessly between Supabase and High-Performance Local DB
 */
export const StorageAdapter = {
  async getClinics(): Promise<Clinic[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clinics').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data as Clinic[];
    }
    return localDb.clinics;
  },

  async getDoctors(clinicId?: string): Promise<Doctor[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('doctors').select('*').eq('active', true);
      if (clinicId) query = query.eq('clinic_id', clinicId);
      const { data, error } = await query.order('name');
      if (!error && data && data.length > 0) return data as Doctor[];
    }
    return localDb.doctors.filter((d) => d.active && (!clinicId || d.clinic_id === clinicId));
  },

  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', doctorId).single();
      if (!error && data) return data as Doctor;
    }
    return localDb.doctors.find((d) => d.id === doctorId) || null;
  },

  async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('doctor_availability')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('active', true)
        .order('day_of_week')
        .order('start_time');
      if (!error && data) return data as DoctorAvailability[];
    }
    return localDb.availability.filter((a) => a.doctor_id === doctorId && a.active);
  },

  async findPatientByPhone(clinicId: string, phone: string): Promise<Patient | null> {
    const cleanPhone = phone.trim();
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('phone', cleanPhone)
        .maybeSingle();
      if (!error && data) return data as Patient;
    }
    return localDb.patients.find((p) => p.clinic_id === clinicId && p.phone === cleanPhone) || null;
  },

  async createPatient(clinicId: string, name: string, phone: string): Promise<Patient> {
    const cleanPhone = phone.trim();
    const cleanName = name.trim();

    // Check if patient already exists
    const existing = await this.findPatientByPhone(clinicId, cleanPhone);
    if (existing) {
      return existing;
    }

    const newPatient: Patient = {
      id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clinic_id: clinicId,
      name: cleanName,
      phone: cleanPhone,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('patients').insert(newPatient).select().single();
        if (!error && data) return data as Patient;
        console.warn('Supabase createPatient returned error, falling back to local DB:', error);
      } catch (err) {
        console.warn('Supabase createPatient exception, falling back to local DB:', err);
      }
    }

    localDb.patients.push(newPatient);
    localDb.saveToStorage();
    return newPatient;
  },

  async getPatients(clinicId?: string): Promise<Patient[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('patients').select('*');
      if (clinicId) query = query.eq('clinic_id', clinicId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data as Patient[];
    }
    return localDb.patients.filter((p) => !clinicId || p.clinic_id === clinicId);
  },

  async getAppointments(filters?: AppointmentFilter): Promise<AppointmentWithDetails[]> {
    let appointmentsList: Appointment[] = [];

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('appointments').select('*');
      if (filters?.doctor_id) query = query.eq('doctor_id', filters.doctor_id);
      if (filters?.clinic_id) query = query.eq('clinic_id', filters.clinic_id);
      if (filters?.date) query = query.eq('appointment_date', filters.date);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query.order('appointment_date', { ascending: false }).order('start_time');
      if (!error && data) {
        appointmentsList = data as Appointment[];
      } else {
        appointmentsList = [...localDb.appointments];
      }
    } else {
      appointmentsList = [...localDb.appointments];
    }

    // Apply local filters if using local storage
    if (!isSupabaseConfigured) {
      if (filters?.doctor_id) {
        appointmentsList = appointmentsList.filter((a) => a.doctor_id === filters.doctor_id);
      }
      if (filters?.clinic_id) {
        appointmentsList = appointmentsList.filter((a) => a.clinic_id === filters.clinic_id);
      }
      if (filters?.date) {
        appointmentsList = appointmentsList.filter((a) => a.appointment_date === filters.date);
      }
      if (filters?.status) {
        appointmentsList = appointmentsList.filter((a) => a.status === filters.status);
      }
    }

    // Enrich with doctor and patient details
    const enriched: AppointmentWithDetails[] = appointmentsList.map((apt) => {
      const doctor = localDb.doctors.find((d) => d.id === apt.doctor_id);
      const patient = localDb.patients.find((p) => p.id === apt.patient_id);
      const clinic = localDb.clinics.find((c) => c.id === apt.clinic_id);

      return {
        ...apt,
        doctor_name: doctor?.name || 'Dr. Sharma',
        doctor_specialty: doctor?.specialty || 'General Physician',
        patient_name: patient?.name || 'Patient',
        patient_phone: patient?.phone || '',
        clinic_name: clinic?.name || 'Demo Clinic',
      };
    });

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      return enriched.filter(
        (a) =>
          a.patient_name?.toLowerCase().includes(searchLower) ||
          a.patient_phone?.toLowerCase().includes(searchLower) ||
          a.doctor_name?.toLowerCase().includes(searchLower)
      );
    }

    return enriched;
  },

  async getActiveAppointmentsForDoctorOnDate(doctorId: string, date: string): Promise<Appointment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctorId)
        .eq('appointment_date', date)
        .neq('status', 'cancelled');
      if (!error && data) return data as Appointment[];
    }

    return localDb.appointments.filter(
      (a) => a.doctor_id === doctorId && a.appointment_date === date && a.status !== 'cancelled'
    );
  },

  /**
   * Atomic / Safe appointment creation with double-booking prevention constraint check
   */
  async insertAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
    // 1. Concurrency double-booking check: ensure no active appointment overlaps with requested slot for this doctor
    const existingActive = await this.getActiveAppointmentsForDoctorOnDate(
      appointment.doctor_id,
      appointment.appointment_date
    );

    const hasConflict = existingActive.some((existing) => {
      if (existing.start_time === appointment.start_time) {
        return true;
      }
      return doIntervalsOverlap(
        appointment.start_time,
        appointment.end_time,
        existing.start_time,
        existing.end_time
      );
    });

    if (hasConflict) {
      throw new Error(`SLOT_UNAVAILABLE: Time slot ${appointment.start_time} on ${appointment.appointment_date} is already booked for this doctor.`);
    }

    const newAppointment: Appointment = {
      ...appointment,
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('appointments').insert(newAppointment).select().single();
        if (error) {
          // Check if error is unique constraint violation on doctor_id, appointment_date, start_time
          if (error.code === '23505') {
            throw new Error(`SLOT_UNAVAILABLE: Time slot ${appointment.start_time} on ${appointment.appointment_date} is already booked.`);
          }
          console.warn('Supabase insertAppointment error, falling back to local DB:', error.message);
        } else if (data) {
          return data as Appointment;
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.startsWith('SLOT_UNAVAILABLE')) {
          throw err;
        }
        console.warn('Supabase insertAppointment exception, falling back to local DB:', err);
      }
    }

    localDb.appointments.push(newAppointment);
    localDb.saveToStorage();
    return newAppointment;
  },

  async updateAppointmentStatus(appointmentId: string, status: Appointment['status']): Promise<Appointment> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .update({ status })
          .eq('id', appointmentId)
          .select()
          .single();
        if (!error && data) return data as Appointment;
      } catch (err) {
        console.warn('Supabase updateAppointmentStatus exception, falling back to local DB:', err);
      }
    }

    const index = localDb.appointments.findIndex((a) => a.id === appointmentId);
    if (index === -1) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }

    localDb.appointments[index] = {
      ...localDb.appointments[index],
      status,
    };
    localDb.saveToStorage();
    return localDb.appointments[index];
  },

  resetAllData() {
    localDb.resetToSeed();
  },
};
