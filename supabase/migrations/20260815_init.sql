-- ==============================================================================
-- Clinic Appointment Engine - Database Schema & Constraints
-- ==============================================================================

-- 1. Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Clinics Table
CREATE TABLE IF NOT EXISTS clinics (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on clinic_id for fast doctor lookups
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);

-- 4. Doctor Availability Table
CREATE TABLE IF NOT EXISTS doctor_availability (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday ... 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (slot_duration_minutes > 0),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT check_start_before_end CHECK (start_time < end_time)
);

-- Index on doctor_id and day_of_week for schedule queries
CREATE INDEX IF NOT EXISTS idx_doctor_availability_lookup 
ON doctor_availability(doctor_id, day_of_week, active);

-- 5. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_patient_clinic_phone UNIQUE (clinic_id, phone)
);

CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(clinic_id, phone);

-- 6. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    clinic_id TEXT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    source TEXT NOT NULL DEFAULT 'dashboard' CHECK (source IN ('dashboard', 'api', 'ai_call')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT check_apt_time CHECK (start_time < end_time)
);

-- Core Indexes
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);

-- ==============================================================================
-- CRITICAL INVARIANT: Double-Booking Prevention at Database Level
-- A partial unique index guarantees that for any given doctor on a given date,
-- only ONE non-cancelled appointment can occupy the same start_time.
-- When an appointment is cancelled, this constraint immediately releases the slot.
-- ==============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_unique_active_slot
ON appointments (doctor_id, appointment_date, start_time)
WHERE status != 'cancelled';

-- Enable Row Level Security (RLS) Foundations
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Allow public read access for demo / receptionist client with anon key
CREATE POLICY "Allow anon read clinics" ON clinics FOR SELECT USING (true);
CREATE POLICY "Allow anon read doctors" ON doctors FOR SELECT USING (true);
CREATE POLICY "Allow anon read availability" ON doctor_availability FOR SELECT USING (true);
CREATE POLICY "Allow anon all patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow anon all appointments" ON appointments FOR ALL USING (true);
