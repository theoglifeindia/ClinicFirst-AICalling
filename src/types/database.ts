export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentSource = 'dashboard' | 'api' | 'ai_call';

export interface Clinic {
  id: string;
  name: string;
  timezone: string;
  phone: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  clinic_id: string;
  name: string;
  specialty: string;
  active: boolean;
  created_at: string;
}

export interface DoctorAvailability {
  id: string;
  doctor_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  start_time: string;  // "10:00" (HH:MM in 24h format)
  end_time: string;    // "13:00" (HH:MM in 24h format)
  slot_duration_minutes: number; // e.g. 30
  active: boolean;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  phone: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  doctor_id: string;
  patient_id: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string;       // HH:MM (24h format)
  end_time: string;         // HH:MM (24h format)
  status: AppointmentStatus;
  source: AppointmentSource;
  created_at: string;
}

export interface AppointmentWithDetails extends Appointment {
  doctor_name?: string;
  doctor_specialty?: string;
  patient_name?: string;
  patient_phone?: string;
  clinic_name?: string;
}

export interface GetAvailabilityRequest {
  doctor_id: string;
  date: string; // YYYY-MM-DD
}

export interface GetAvailabilityResponse {
  doctor: string;
  doctor_id: string;
  date: string;
  available_slots: string[]; // ["10:00", "10:30", ...]
  booked_slots?: string[];
  total_slots?: number;
}

export interface CreateAppointmentRequest {
  doctor_id: string;
  patient_name: string;
  patient_phone: string;
  appointment_date: string; // YYYY-MM-DD
  start_time: string;       // "10:00" (or "10:00 AM" / "16:00")
  source?: AppointmentSource;
  clinic_id?: string;
}

export interface CreateAppointmentResponse {
  success: boolean;
  appointment?: AppointmentWithDetails;
  error?: string;
  code?: string;
}

export interface AppointmentFilter {
  clinic_id?: string;
  doctor_id?: string;
  date?: string;
  status?: AppointmentStatus;
  search?: string;
}
