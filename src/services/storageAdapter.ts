import {
  Workspace,
  Clinic,
  Doctor,
  DoctorAvailability,
  Patient,
  Contact,
  Appointment,
  AppointmentFilter,
  AppointmentWithDetails,
  AIAgent,
  CallRecord,
  CallFilter,
  CallMetrics,
  CallStatus,
} from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getDateStringOffset, calculateEndTime, doIntervalsOverlap } from '../utils/timeUtils';

const STORAGE_KEYS = {
  CLINICS: 'clinic_engine_clinics',
  ACTIVE_WORKSPACE: 'clinic_engine_active_workspace',
  DOCTORS: 'clinic_engine_doctors',
  AVAILABILITY: 'clinic_engine_availability',
  PATIENTS: 'clinic_engine_patients',
  APPOINTMENTS: 'clinic_engine_appointments',
  AGENTS: 'clinic_engine_agents',
  CALLS: 'clinic_engine_calls',
};

// Initial Seed Data
export const DEFAULT_WORKSPACE_ID = 'clinic-demo-001';
export const SECONDARY_WORKSPACE_ID = 'clinic-apex-002';
export const DEFAULT_DOCTOR_ID = 'doc-sharma-001';
export const SECOND_DOCTOR_ID = 'doc-patel-002';

const SEED_WORKSPACES: Workspace[] = [
  {
    id: DEFAULT_WORKSPACE_ID,
    name: 'Demo Clinic',
    timezone: 'Asia/Kolkata',
    phone: '+91 9876543210',
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: SECONDARY_WORKSPACE_ID,
    name: 'Apex Health Global',
    timezone: 'America/New_York',
    phone: '+1 555-019-2831',
    created_at: new Date('2026-01-02T00:00:00Z').toISOString(),
  },
];

const SEED_DOCTORS: Doctor[] = [
  {
    id: DEFAULT_DOCTOR_ID,
    clinic_id: DEFAULT_WORKSPACE_ID,
    name: 'Dr. Sharma',
    specialty: 'General Physician',
    active: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: SECOND_DOCTOR_ID,
    clinic_id: DEFAULT_WORKSPACE_ID,
    name: 'Dr. Priya Patel',
    specialty: 'Pediatrician',
    active: true,
    created_at: new Date('2026-01-01T00:00:00Z').toISOString(),
  },
  {
    id: 'doc-apex-003',
    clinic_id: SECONDARY_WORKSPACE_ID,
    name: 'Dr. Marcus Vance',
    specialty: 'Cardiology Specialist',
    active: true,
    created_at: new Date('2026-01-02T00:00:00Z').toISOString(),
  },
];

const SEED_AVAILABILITY: DoctorAvailability[] = [];

// Monday (1) to Friday (5) for Dr. Sharma
for (let day = 1; day <= 5; day++) {
  SEED_AVAILABILITY.push({
    id: `avail-sharma-m-${day}`,
    doctor_id: DEFAULT_DOCTOR_ID,
    day_of_week: day,
    start_time: '10:00',
    end_time: '13:00',
    slot_duration_minutes: 30,
    active: true,
  });
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

// Availability for Dr. Priya Patel
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

const SEED_CONTACTS: Patient[] = [
  {
    id: 'pat-aarav-001',
    clinic_id: DEFAULT_WORKSPACE_ID,
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: 'Aarav Mehta',
    phone: '+91 9820123456',
    email: 'aarav.mehta@example.com',
    status: 'active',
    created_at: new Date('2026-08-01T10:00:00Z').toISOString(),
  },
  {
    id: 'pat-ananya-002',
    clinic_id: DEFAULT_WORKSPACE_ID,
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: 'Ananya Iyer',
    phone: '+91 9811223344',
    email: 'ananya.iyer@example.com',
    status: 'active',
    created_at: new Date('2026-08-05T11:30:00Z').toISOString(),
  },
  {
    id: 'pat-rajesh-003',
    clinic_id: DEFAULT_WORKSPACE_ID,
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: 'Rajesh Kumar',
    phone: '+91 9899001122',
    email: 'rajesh.k@example.com',
    status: 'active',
    created_at: new Date('2026-08-10T14:00:00Z').toISOString(),
  },
  {
    id: 'pat-emily-004',
    clinic_id: SECONDARY_WORKSPACE_ID,
    workspace_id: SECONDARY_WORKSPACE_ID,
    name: 'Emily Watson',
    phone: '+1 555-234-5678',
    email: 'emily.w@example.com',
    status: 'active',
    created_at: new Date('2026-08-12T09:15:00Z').toISOString(),
  },
];

const SEED_AGENTS: AIAgent[] = [
  {
    id: 'agent-reception-001',
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: 'Dr. Sharma OPD Voice Assistant',
    description: 'Handles patient inquiries, triage, and scheduling for Dr. Sharma general medicine OPD.',
    system_prompt: 'You are CLINICFIRST AI Assistant for Dr. Sharma Clinic. Assist callers with appointment scheduling, general clinic questions, and consultation slots. Always maintain a polite, clear, and reassuring tone.',
    greeting_message: 'Hello! This is Dr. Sharma Clinic AI voice assistant. How can I assist you with your appointment today?',
    voice: 'Zephyr',
    language: 'English (India)',
    active: true,
    created_at: new Date('2026-08-01T08:00:00Z').toISOString(),
    updated_at: new Date('2026-08-01T08:00:00Z').toISOString(),
  },
  {
    id: 'agent-scheduler-002',
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: 'Appointment Booking Specialist',
    description: 'Specialized agent for outbound appointment confirmation and rescheduling calls.',
    system_prompt: 'You are an outbound booking confirmation specialist calling patients to confirm their appointment times or offer convenient alternative slots.',
    greeting_message: 'Namaste, I am calling from CLINICFIRST regarding your upcoming medical appointment.',
    voice: 'Aoede',
    language: 'Hinglish',
    active: true,
    created_at: new Date('2026-08-02T10:30:00Z').toISOString(),
    updated_at: new Date('2026-08-02T10:30:00Z').toISOString(),
  },
  {
    id: 'agent-postcare-003',
    workspace_id: DEFAULT_WORKSPACE_ID,
    name: 'Post-Care Follow-up Agent',
    description: 'Follows up with patients 48 hours after consultation to check recovery and medication adherence.',
    system_prompt: 'You are a caring follow-up agent. Check in on the patient symptoms, ensure prescriptions were filled, and offer follow-up booking if needed.',
    greeting_message: 'Hello, this is CLINICFIRST checking in on how you are feeling following your recent consultation.',
    voice: 'Puck',
    language: 'English (US)',
    active: false,
    created_at: new Date('2026-08-03T14:00:00Z').toISOString(),
    updated_at: new Date('2026-08-03T14:00:00Z').toISOString(),
  },
  {
    id: 'agent-apex-001',
    workspace_id: SECONDARY_WORKSPACE_ID,
    name: 'Apex Triage Concierge',
    description: 'General concierge for Apex Health Global inquiries.',
    system_prompt: 'You are Apex Health Global voice assistant. Assist patients with finding specialists and facility hours.',
    greeting_message: 'Thank you for calling Apex Health Global. How can I direct your call today?',
    voice: 'Zephyr',
    language: 'English (US)',
    active: true,
    created_at: new Date('2026-08-04T09:00:00Z').toISOString(),
    updated_at: new Date('2026-08-04T09:00:00Z').toISOString(),
  },
];

const SEED_CALLS: CallRecord[] = [
  {
    id: 'call-seed-001',
    workspace_id: DEFAULT_WORKSPACE_ID,
    agent_id: 'agent-reception-001',
    contact_id: 'pat-aarav-001',
    phone_number: '+91 9820123456',
    status: 'COMPLETED',
    started_at: new Date(Date.now() - 7200000).toISOString(),
    connected_at: new Date(Date.now() - 7195000).toISOString(),
    ended_at: new Date(Date.now() - 7055000).toISOString(),
    duration: 140,
    provider_call_id: 'prov-call-demo-01',
    transcript: [
      { speaker: 'agent', text: 'Hello! This is Dr. Sharma Clinic AI voice assistant. How can I assist you with your appointment today?', timestamp: '00:02' },
      { speaker: 'user', text: 'Hi, I wanted to check if Dr. Sharma is available tomorrow for a cough checkup.', timestamp: '00:07' },
      { speaker: 'agent', text: 'Dr. Sharma is available tomorrow at 10:30 AM and 4:30 PM. Would you like me to book the 10:30 AM slot?', timestamp: '00:15' },
      { speaker: 'user', text: 'Yes, 10:30 AM works great for Aarav Mehta.', timestamp: '00:20' },
      { speaker: 'agent', text: 'Your appointment is confirmed for tomorrow at 10:30 AM. You will receive an SMS reminder. Have a great day!', timestamp: '00:28' },
    ],
    summary: 'Patient inquired about Dr. Sharma availability for tomorrow. Confirmed appointment for 10:30 AM slot for cough checkup.',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7055000).toISOString(),
  },
  {
    id: 'call-seed-002',
    workspace_id: DEFAULT_WORKSPACE_ID,
    agent_id: 'agent-scheduler-002',
    contact_id: 'pat-rajesh-003',
    phone_number: '+91 9899001122',
    status: 'FAILED',
    started_at: new Date(Date.now() - 14400000).toISOString(),
    ended_at: new Date(Date.now() - 14380000).toISOString(),
    duration: 0,
    provider_call_id: 'prov-call-demo-02',
    transcript: [
      { speaker: 'system', text: 'Call initiated to carrier network for +91 9899001122', timestamp: '00:01' },
      { speaker: 'system', text: 'Carrier returned error: Line busy / User rejected call', timestamp: '00:20' },
    ],
    failure_reason: 'User busy / No answer on destination line',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14380000).toISOString(),
  },
];

const SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-seed-001',
    clinic_id: DEFAULT_WORKSPACE_ID,
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
    clinic_id: DEFAULT_WORKSPACE_ID,
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
  clinics: Workspace[] = [];
  activeWorkspaceId: string = DEFAULT_WORKSPACE_ID;
  doctors: Doctor[] = [];
  availability: DoctorAvailability[] = [];
  patients: Patient[] = [];
  appointments: Appointment[] = [];
  agents: AIAgent[] = [];
  calls: CallRecord[] = [];
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
      const storedActiveWs = localStorage.getItem(STORAGE_KEYS.ACTIVE_WORKSPACE);
      const storedDoctors = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      const storedAvail = localStorage.getItem(STORAGE_KEYS.AVAILABILITY);
      const storedPatients = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      const storedAppointments = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      const storedAgents = localStorage.getItem(STORAGE_KEYS.AGENTS);
      const storedCalls = localStorage.getItem(STORAGE_KEYS.CALLS);

      this.clinics = storedClinics ? JSON.parse(storedClinics) : [...SEED_WORKSPACES];
      this.activeWorkspaceId = storedActiveWs || this.clinics[0]?.id || DEFAULT_WORKSPACE_ID;
      this.doctors = storedDoctors ? JSON.parse(storedDoctors) : [...SEED_DOCTORS];
      this.availability = storedAvail ? JSON.parse(storedAvail) : [...SEED_AVAILABILITY];
      this.patients = storedPatients ? JSON.parse(storedPatients) : [...SEED_CONTACTS];
      this.appointments = storedAppointments ? JSON.parse(storedAppointments) : [...SEED_APPOINTMENTS];
      this.agents = storedAgents ? JSON.parse(storedAgents) : [...SEED_AGENTS];
      this.calls = storedCalls ? JSON.parse(storedCalls) : [...SEED_CALLS];
    } catch {
      this.resetToSeed();
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CLINICS, JSON.stringify(this.clinics));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WORKSPACE, this.activeWorkspaceId);
      localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(this.doctors));
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(this.availability));
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(this.patients));
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(this.appointments));
      localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(this.agents));
      localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(this.calls));
      this.notify();
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  resetToSeed() {
    this.clinics = [...SEED_WORKSPACES];
    this.activeWorkspaceId = DEFAULT_WORKSPACE_ID;
    this.doctors = [...SEED_DOCTORS];
    this.availability = [...SEED_AVAILABILITY];
    this.patients = [...SEED_CONTACTS];
    this.appointments = [...SEED_APPOINTMENTS];
    this.agents = [...SEED_AGENTS];
    this.calls = [...SEED_CALLS];
    this.saveToStorage();
  }
}

export const localDb = new LocalDatabase();

/**
 * Storage Adapter - delegates seamlessly between Supabase and High-Performance Local DB
 */
export const StorageAdapter = {
  // ==========================================
  // Workspace & Clinic Management
  // ==========================================
  async getWorkspaces(): Promise<Workspace[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('clinics').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) return data as Workspace[];
    }
    return localDb.clinics;
  },

  async getClinics(): Promise<Clinic[]> {
    return this.getWorkspaces();
  },

  getActiveWorkspaceId(): string {
    return localDb.activeWorkspaceId;
  },

  setActiveWorkspaceId(workspaceId: string) {
    const ws = localDb.clinics.find((c) => c.id === workspaceId);
    if (ws) {
      localDb.activeWorkspaceId = workspaceId;
      localDb.saveToStorage();
    }
  },

  async createWorkspace(name: string, timezone: string = 'Asia/Kolkata', phone?: string): Promise<Workspace> {
    const newWs: Workspace = {
      id: `clinic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      timezone: timezone.trim() || 'Asia/Kolkata',
      phone: phone?.trim(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('clinics').insert(newWs).select().single();
        if (!error && data) {
          localDb.clinics.push(data as Workspace);
          localDb.saveToStorage();
          return data as Workspace;
        }
      } catch (err) {
        console.warn('Supabase createWorkspace error:', err);
      }
    }

    localDb.clinics.push(newWs);
    localDb.saveToStorage();
    return newWs;
  },

  // ==========================================
  // AI Agent Management (M3)
  // ==========================================
  async getAgents(workspaceId?: string): Promise<AIAgent[]> {
    const targetWsId = workspaceId || localDb.activeWorkspaceId;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('workspace_id', targetWsId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as AIAgent[];
    }
    return localDb.agents.filter((a) => a.workspace_id === targetWsId);
  },

  async getAgentById(agentId: string): Promise<AIAgent | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('agents').select('*').eq('id', agentId).single();
      if (!error && data) return data as AIAgent;
    }
    return localDb.agents.find((a) => a.id === agentId) || null;
  },

  async createAgent(agentData: Omit<AIAgent, 'id' | 'created_at' | 'updated_at'>): Promise<AIAgent> {
    if (!agentData.workspace_id) {
      throw new Error('MISSING_WORKSPACE: Cannot create an agent without a valid workspace ID.');
    }
    if (!agentData.name?.trim()) {
      throw new Error('VALIDATION_ERROR: Agent name is required.');
    }
    if (!agentData.system_prompt?.trim()) {
      throw new Error('VALIDATION_ERROR: System prompt instructions are required.');
    }
    if (!agentData.greeting_message?.trim()) {
      throw new Error('VALIDATION_ERROR: Greeting message is required.');
    }

    const now = new Date().toISOString();
    const newAgent: AIAgent = {
      ...agentData,
      id: `agent-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: agentData.name.trim(),
      description: agentData.description?.trim() || '',
      system_prompt: agentData.system_prompt.trim(),
      greeting_message: agentData.greeting_message.trim(),
      voice: agentData.voice || 'Zephyr',
      language: agentData.language || 'English (India)',
      active: agentData.active ?? true,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('agents').insert(newAgent).select().single();
        if (!error && data) {
          localDb.agents.unshift(data as AIAgent);
          localDb.saveToStorage();
          return data as AIAgent;
        }
      } catch (err) {
        console.warn('Supabase createAgent error:', err);
      }
    }

    localDb.agents.unshift(newAgent);
    localDb.saveToStorage();
    return newAgent;
  },

  async updateAgent(agentId: string, updates: Partial<Omit<AIAgent, 'id' | 'workspace_id' | 'created_at'>>): Promise<AIAgent> {
    const agentIndex = localDb.agents.findIndex((a) => a.id === agentId);
    if (agentIndex === -1) {
      throw new Error(`AGENT_NOT_FOUND: Agent with ID ${agentId} does not exist.`);
    }

    const now = new Date().toISOString();
    const updatedAgent: AIAgent = {
      ...localDb.agents[agentIndex],
      ...updates,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('agents')
          .update({ ...updates, updated_at: now })
          .eq('id', agentId)
          .select()
          .single();
        if (!error && data) {
          localDb.agents[agentIndex] = data as AIAgent;
          localDb.saveToStorage();
          return data as AIAgent;
        }
      } catch (err) {
        console.warn('Supabase updateAgent error:', err);
      }
    }

    localDb.agents[agentIndex] = updatedAgent;
    localDb.saveToStorage();
    return updatedAgent;
  },

  async deleteAgent(agentId: string): Promise<boolean> {
    const agent = localDb.agents.find((a) => a.id === agentId);
    if (!agent) return false;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('agents').delete().eq('id', agentId);
      } catch (err) {
        console.warn('Supabase deleteAgent error:', err);
      }
    }

    localDb.agents = localDb.agents.filter((a) => a.id !== agentId);
    localDb.saveToStorage();
    return true;
  },

  // ==========================================
  // Contact & Patient Management
  // ==========================================
  async getContacts(workspaceId?: string): Promise<Contact[]> {
    const targetWsId = workspaceId || localDb.activeWorkspaceId;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', targetWsId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Contact[];
    }
    return localDb.patients.filter((p) => p.workspace_id === targetWsId || p.clinic_id === targetWsId);
  },

  async getPatients(clinicId?: string): Promise<Patient[]> {
    return this.getContacts(clinicId) as unknown as Promise<Patient[]>;
  },

  async getContactById(contactId: string): Promise<Contact | null> {
    return localDb.patients.find((p) => p.id === contactId) || null;
  },

  async findContactByPhone(workspaceId: string, phone: string): Promise<Contact | null> {
    const cleanPhone = phone.trim();
    return (
      localDb.patients.find(
        (p) => (p.workspace_id === workspaceId || p.clinic_id === workspaceId) && p.phone === cleanPhone
      ) || null
    );
  },

  async findPatientByPhone(clinicId: string, phone: string): Promise<Patient | null> {
    return (await this.findContactByPhone(clinicId, phone)) as Patient | null;
  },

  async createContact(workspaceId: string, name: string, phone: string, email?: string): Promise<Contact> {
    if (!workspaceId) {
      throw new Error('MISSING_WORKSPACE: Workspace ID is required to create a contact.');
    }
    const cleanName = name?.trim();
    const cleanPhone = phone?.trim();
    if (!cleanName) {
      throw new Error('VALIDATION_ERROR: Contact name is required.');
    }
    if (!cleanPhone || cleanPhone.length < 5) {
      throw new Error('VALIDATION_ERROR: Valid phone number is required.');
    }

    const existing = await this.findContactByPhone(workspaceId, cleanPhone);
    if (existing) {
      return existing;
    }

    const newContact: Patient = {
      id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      clinic_id: workspaceId,
      workspace_id: workspaceId,
      name: cleanName,
      phone: cleanPhone,
      email: email?.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('patients').insert(newContact).select().single();
        if (!error && data) return data as Contact;
      } catch (err) {
        console.warn('Supabase createContact error:', err);
      }
    }

    localDb.patients.unshift(newContact);
    localDb.saveToStorage();
    return newContact;
  },

  async createPatient(clinicId: string, name: string, phone: string): Promise<Patient> {
    return (await this.createContact(clinicId, name, phone)) as Patient;
  },

  async updateContact(contactId: string, updates: Partial<Omit<Contact, 'id' | 'workspace_id' | 'created_at'>>): Promise<Contact> {
    const index = localDb.patients.findIndex((p) => p.id === contactId);
    if (index === -1) {
      throw new Error(`CONTACT_NOT_FOUND: Contact with ID ${contactId} does not exist.`);
    }

    const updated: Patient = {
      ...localDb.patients[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    localDb.patients[index] = updated;
    localDb.saveToStorage();
    return updated;
  },

  async deleteContact(contactId: string): Promise<boolean> {
    const exists = localDb.patients.some((p) => p.id === contactId);
    if (!exists) return false;
    localDb.patients = localDb.patients.filter((p) => p.id !== contactId);
    localDb.saveToStorage();
    return true;
  },

  // ==========================================
  // Call Engine & Call Records (M3)
  // ==========================================
  async getCalls(filter?: CallFilter): Promise<CallRecord[]> {
    const targetWsId = filter?.workspace_id || localDb.activeWorkspaceId;
    let callsList = localDb.calls.filter((c) => c.workspace_id === targetWsId);

    if (filter?.agent_id) {
      callsList = callsList.filter((c) => c.agent_id === filter.agent_id);
    }
    if (filter?.contact_id) {
      callsList = callsList.filter((c) => c.contact_id === filter.contact_id);
    }
    if (filter?.status && filter.status !== 'ALL') {
      callsList = callsList.filter((c) => c.status === filter.status);
    }
    if (filter?.date_from) {
      callsList = callsList.filter((c) => c.started_at >= filter.date_from!);
    }
    if (filter?.date_to) {
      callsList = callsList.filter((c) => c.started_at <= filter.date_to!);
    }

    // Enrich with agent and contact details
    const enriched: CallRecord[] = callsList.map((call) => {
      const agent = localDb.agents.find((a) => a.id === call.agent_id);
      const contact = localDb.patients.find((p) => p.id === call.contact_id);
      const ws = localDb.clinics.find((w) => w.id === call.workspace_id);

      return {
        ...call,
        agent_name: agent?.name || 'AI Voice Agent',
        agent_voice: agent?.voice || 'Zephyr',
        contact_name: contact?.name || 'Contact',
        contact_email: contact?.email || '',
        workspace_name: ws?.name || 'Current Workspace',
      };
    });

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      return enriched.filter(
        (c) =>
          c.contact_name?.toLowerCase().includes(q) ||
          c.phone_number?.toLowerCase().includes(q) ||
          c.agent_name?.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.summary?.toLowerCase().includes(q)
      );
    }

    return enriched.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
  },

  async getCallById(callId: string): Promise<CallRecord | null> {
    const call = localDb.calls.find((c) => c.id === callId);
    if (!call) return null;

    const agent = localDb.agents.find((a) => a.id === call.agent_id);
    const contact = localDb.patients.find((p) => p.id === call.contact_id);
    const ws = localDb.clinics.find((w) => w.id === call.workspace_id);

    return {
      ...call,
      agent_name: agent?.name || 'AI Voice Agent',
      agent_voice: agent?.voice || 'Zephyr',
      contact_name: contact?.name || 'Contact',
      contact_email: contact?.email || '',
      workspace_name: ws?.name || 'Current Workspace',
    };
  },

  async createCallRecord(callData: Omit<CallRecord, 'id' | 'created_at' | 'updated_at'>): Promise<CallRecord> {
    if (!callData.workspace_id) {
      throw new Error('MISSING_WORKSPACE: Cannot create call without a valid workspace.');
    }
    if (!callData.agent_id) {
      throw new Error('MISSING_AGENT: Cannot start call without a selected agent.');
    }
    if (!callData.contact_id) {
      throw new Error('MISSING_CONTACT: Cannot start call without a selected contact.');
    }

    const now = new Date().toISOString();
    const newCall: CallRecord = {
      ...callData,
      id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('calls').insert(newCall).select().single();
        if (!error && data) {
          localDb.calls.unshift(data as CallRecord);
          localDb.saveToStorage();
          return data as CallRecord;
        }
      } catch (err) {
        console.warn('Supabase createCallRecord error:', err);
      }
    }

    localDb.calls.unshift(newCall);
    localDb.saveToStorage();
    return newCall;
  },

  async updateCallRecord(callId: string, updates: Partial<CallRecord>): Promise<CallRecord> {
    const index = localDb.calls.findIndex((c) => c.id === callId);
    if (index === -1) {
      throw new Error(`CALL_NOT_FOUND: Call with ID ${callId} does not exist.`);
    }

    const updated: CallRecord = {
      ...localDb.calls[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('calls')
          .update({ ...updates, updated_at: updated.updated_at })
          .eq('id', callId)
          .select()
          .single();
        if (!error && data) {
          localDb.calls[index] = data as CallRecord;
          localDb.saveToStorage();
          return data as CallRecord;
        }
      } catch (err) {
        console.warn('Supabase updateCallRecord error:', err);
      }
    }

    localDb.calls[index] = updated;
    localDb.saveToStorage();
    return updated;
  },

  async getCallMetrics(workspaceId?: string): Promise<CallMetrics> {
    const targetWsId = workspaceId || localDb.activeWorkspaceId;
    const wsCalls = localDb.calls.filter((c) => c.workspace_id === targetWsId);

    const total = wsCalls.length;
    const completed = wsCalls.filter((c) => c.status === 'COMPLETED').length;
    const failed = wsCalls.filter((c) => c.status === 'FAILED' || c.status === 'CANCELLED').length;
    const active = wsCalls.filter((c) => c.status === 'QUEUED' || c.status === 'RINGING' || c.status === 'CONNECTED').length;

    const completedCalls = wsCalls.filter((c) => c.status === 'COMPLETED' && c.duration > 0);
    const totalDuration = completedCalls.reduce((acc, c) => acc + c.duration, 0);
    const avgDuration = completedCalls.length > 0 ? Math.round(totalDuration / completedCalls.length) : 0;

    return {
      total_calls: total,
      completed_calls: completed,
      failed_calls: failed,
      active_calls: active,
      average_duration_seconds: avgDuration,
    };
  },

  // ==========================================
  // Doctors & Scheduling (Preserved M1/M2)
  // ==========================================
  async getDoctors(clinicId?: string): Promise<Doctor[]> {
    const targetId = clinicId || localDb.activeWorkspaceId;
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('doctors').select('*').eq('active', true);
      if (targetId) query = query.eq('clinic_id', targetId);
      const { data, error } = await query.order('name');
      if (!error && data && data.length > 0) return data as Doctor[];
    }
    return localDb.doctors.filter((d) => d.active && (!targetId || d.clinic_id === targetId));
  },

  async getAllDoctorsForClinic(clinicId?: string): Promise<Doctor[]> {
    const targetId = clinicId || localDb.activeWorkspaceId;
    return localDb.doctors.filter((d) => !targetId || d.clinic_id === targetId);
  },

  async getDoctorById(doctorId: string): Promise<Doctor | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('doctors').select('*').eq('id', doctorId).single();
      if (!error && data) return data as Doctor;
    }
    return localDb.doctors.find((d) => d.id === doctorId) || null;
  },

  async createDoctor(
    doctorData: Omit<Doctor, 'id' | 'created_at'>,
    shiftsConfig?: {
      morningStart?: string;
      morningEnd?: string;
      eveningStart?: string;
      eveningEnd?: string;
      slotDurationMinutes?: number;
      workingDays?: number[]; // [1, 2, 3, 4, 5]
    }
  ): Promise<Doctor> {
    const targetClinicId = doctorData.clinic_id || localDb.activeWorkspaceId;
    if (!doctorData.name?.trim()) {
      throw new Error('VALIDATION_ERROR: Doctor name is required.');
    }

    const doctorId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newDoc: Doctor = {
      id: doctorId,
      clinic_id: targetClinicId,
      name: doctorData.name.trim(),
      specialty: doctorData.specialty?.trim() || 'General Physician',
      active: doctorData.active ?? true,
      created_at: new Date().toISOString(),
    };

    localDb.doctors.push(newDoc);

    // Create default availability schedules
    const days = shiftsConfig?.workingDays || [1, 2, 3, 4, 5]; // Mon - Fri
    const slotDuration = shiftsConfig?.slotDurationMinutes || 30;
    const morningStart = shiftsConfig?.morningStart || '10:00';
    const morningEnd = shiftsConfig?.morningEnd || '13:00';
    const eveningStart = shiftsConfig?.eveningStart || '16:00';
    const eveningEnd = shiftsConfig?.eveningEnd || '19:00';

    days.forEach((day) => {
      if (morningStart && morningEnd) {
        localDb.availability.push({
          id: `avail-${doctorId}-m-${day}`,
          doctor_id: doctorId,
          day_of_week: day,
          start_time: morningStart,
          end_time: morningEnd,
          slot_duration_minutes: slotDuration,
          active: true,
        });
      }
      if (eveningStart && eveningEnd) {
        localDb.availability.push({
          id: `avail-${doctorId}-e-${day}`,
          doctor_id: doctorId,
          day_of_week: day,
          start_time: eveningStart,
          end_time: eveningEnd,
          slot_duration_minutes: slotDuration,
          active: true,
        });
      }
    });

    localDb.saveToStorage();
    return newDoc;
  },

  async deleteDoctor(doctorId: string): Promise<boolean> {
    const exists = localDb.doctors.some((d) => d.id === doctorId);
    if (!exists) return false;
    localDb.doctors = localDb.doctors.filter((d) => d.id !== doctorId);
    localDb.availability = localDb.availability.filter((a) => a.doctor_id !== doctorId);
    localDb.saveToStorage();
    return true;
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

  async getAppointments(filters?: AppointmentFilter): Promise<AppointmentWithDetails[]> {
    const targetClinicId = filters?.clinic_id || localDb.activeWorkspaceId;
    let appointmentsList: Appointment[] = [...localDb.appointments];

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('appointments').select('*');
      if (filters?.doctor_id) query = query.eq('doctor_id', filters.doctor_id);
      if (targetClinicId) query = query.eq('clinic_id', targetClinicId);
      if (filters?.date) query = query.eq('appointment_date', filters.date);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query.order('appointment_date', { ascending: false }).order('start_time');
      if (!error && data) {
        appointmentsList = data as Appointment[];
      }
    } else {
      if (targetClinicId) {
        appointmentsList = appointmentsList.filter((a) => a.clinic_id === targetClinicId);
      }
      if (filters?.doctor_id) {
        appointmentsList = appointmentsList.filter((a) => a.doctor_id === filters.doctor_id);
      }
      if (filters?.date) {
        appointmentsList = appointmentsList.filter((a) => a.appointment_date === filters.date);
      }
      if (filters?.status) {
        appointmentsList = appointmentsList.filter((a) => a.status === filters.status);
      }
    }

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

  async insertAppointment(appointment: Omit<Appointment, 'id' | 'created_at'>): Promise<Appointment> {
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
