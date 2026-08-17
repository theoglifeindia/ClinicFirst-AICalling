export type AppointmentStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentSource = 'dashboard' | 'api' | 'ai_call';

// Workspace (Aliased with Clinic for multi-tenant and clinical compatibility)
export interface Workspace {
  id: string;
  name: string;
  timezone: string;
  phone?: string;
  created_at: string;
}

export type Clinic = Workspace;

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

// Contact model (Extending Patient for unified multi-workspace address book)
export type ContactStatus = 'active' | 'archived';

export interface Contact {
  id: string;
  workspace_id: string; // or clinic_id
  name: string;
  phone: string;
  email?: string;
  status: ContactStatus;
  created_at: string;
  updated_at?: string;
}

export type Patient = Contact & {
  clinic_id: string;
};

// AI Agent Model
export interface AIAgent {
  id: string;
  workspace_id: string;
  name: string;
  description: string;
  system_prompt: string;
  greeting_message: string;
  voice: string;
  language: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Call Status Lifecycle
export type CallStatus =
  | 'QUEUED'
  | 'RINGING'
  | 'CONNECTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TranscriptMessage {
  id?: string;
  speaker: 'agent' | 'user' | 'system';
  text: string;
  timestamp: string;
}

// Call Record Model
export interface CallRecord {
  id: string;
  workspace_id: string;
  agent_id: string;
  contact_id: string;
  phone_number: string;
  status: CallStatus;
  started_at: string;
  connected_at?: string;
  ended_at?: string;
  duration: number; // in seconds
  provider_call_id: string;
  transcript: TranscriptMessage[];
  summary?: string;
  failure_reason?: string;
  created_at: string;
  updated_at: string;

  // Joined presentation fields
  agent_name?: string;
  agent_voice?: string;
  contact_name?: string;
  contact_email?: string;
  workspace_name?: string;
}

export interface CallFilter {
  workspace_id?: string;
  agent_id?: string;
  contact_id?: string;
  status?: CallStatus | 'ALL';
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface CallMetrics {
  total_calls: number;
  completed_calls: number;
  failed_calls: number;
  active_calls: number;
  average_duration_seconds: number;
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

