-- ==============================================================================
-- Clinic Appointment Engine - Demo & Seed Data
-- ==============================================================================

-- 1. Insert Demo Clinic
INSERT INTO clinics (id, name, timezone, phone)
VALUES ('clinic-demo-001', 'Demo Clinic', 'Asia/Kolkata', '+91 9876543210')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Dr. Sharma (General Physician) and Dr. Priya Patel
INSERT INTO doctors (id, clinic_id, name, specialty, active)
VALUES 
  ('doc-sharma-001', 'clinic-demo-001', 'Dr. Sharma', 'General Physician', true),
  ('doc-patel-002', 'clinic-demo-001', 'Dr. Priya Patel', 'Pediatrician', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Availability for Dr. Sharma
-- Monday to Friday: 10:00 AM - 1:00 PM (10:00-13:00) & 4:00 PM - 7:00 PM (16:00-19:00), 30 min duration
-- day_of_week: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
INSERT INTO doctor_availability (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, active)
VALUES
  -- Monday
  ('avail-sharma-m-1', 'doc-sharma-001', 1, '10:00', '13:00', 30, true),
  ('avail-sharma-e-1', 'doc-sharma-001', 1, '16:00', '19:00', 30, true),
  -- Tuesday
  ('avail-sharma-m-2', 'doc-sharma-001', 2, '10:00', '13:00', 30, true),
  ('avail-sharma-e-2', 'doc-sharma-001', 2, '16:00', '19:00', 30, true),
  -- Wednesday
  ('avail-sharma-m-3', 'doc-sharma-001', 3, '10:00', '13:00', 30, true),
  ('avail-sharma-e-3', 'doc-sharma-001', 3, '16:00', '19:00', 30, true),
  -- Thursday
  ('avail-sharma-m-4', 'doc-sharma-001', 4, '10:00', '13:00', 30, true),
  ('avail-sharma-e-4', 'doc-sharma-001', 4, '16:00', '19:00', 30, true),
  -- Friday
  ('avail-sharma-m-5', 'doc-sharma-001', 5, '10:00', '13:00', 30, true),
  ('avail-sharma-e-5', 'doc-sharma-001', 5, '16:00', '19:00', 30, true)
ON CONFLICT (id) DO NOTHING;

-- Availability for Dr. Priya Patel (Monday to Friday 09:00 - 12:00)
INSERT INTO doctor_availability (id, doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, active)
VALUES
  ('avail-patel-m-1', 'doc-patel-002', 1, '09:00', '12:00', 30, true),
  ('avail-patel-m-2', 'doc-patel-002', 2, '09:00', '12:00', 30, true),
  ('avail-patel-m-3', 'doc-patel-002', 3, '09:00', '12:00', 30, true),
  ('avail-patel-m-4', 'doc-patel-002', 4, '09:00', '12:00', 30, true),
  ('avail-patel-m-5', 'doc-patel-002', 5, '09:00', '12:00', 30, true)
ON CONFLICT (id) DO NOTHING;

-- 4. Sample Patients
INSERT INTO patients (id, clinic_id, name, phone)
VALUES
  ('pat-aarav-001', 'clinic-demo-001', 'Aarav Mehta', '+91 9820123456'),
  ('pat-ananya-002', 'clinic-demo-001', 'Ananya Iyer', '+91 9811223344'),
  ('pat-rajesh-003', 'clinic-demo-001', 'Rajesh Kumar', '+91 9899001122')
ON CONFLICT (id) DO NOTHING;

-- 5. Sample Initial Appointments
INSERT INTO appointments (id, clinic_id, doctor_id, patient_id, appointment_date, start_time, end_time, status, source)
VALUES
  ('apt-seed-001', 'clinic-demo-001', 'doc-sharma-001', 'pat-aarav-001', CURRENT_DATE, '10:30', '11:00', 'confirmed', 'dashboard'),
  ('apt-seed-002', 'clinic-demo-001', 'doc-sharma-001', 'pat-ananya-002', CURRENT_DATE + INTERVAL '1 day', '11:00', '11:30', 'confirmed', 'ai_call')
ON CONFLICT (id) DO NOTHING;
