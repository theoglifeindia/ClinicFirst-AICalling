# Clinic Appointment Engine (Step 1 Foundation)

A clean, production-ready appointment-booking engine built for Indian doctors and clinics, designed as the core foundation for an AI voice receptionist platform.

---

## 📋 Architectural Overview

The system strictly decouples the core appointment-booking and slot calculation engine from the user interface and future AI/telephony services.

```
┌────────────────────────────────────────────────────────┐
│  AI Receptionist / Voice / Dashboard / API Callers     │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Appointment Services                   │
│  - getDoctors()                                        │
│  - getDoctorAvailability(doctorId)                     │
│  - getAvailableSlots(doctorId, date)                   │
│  - createPatient(clinicId, name, phone)                │
│  - createAppointment(doctorId, patient, date, slot...) │
│  - cancelAppointment(appointmentId)                    │
│  - getAppointments(filters)                            │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│        Double-Booking Prevention Guard (ACID)          │
│  - Application-level Concurrency & Interval Checks     │
│  - PostgreSQL Partial Unique Constraint                │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│          PostgreSQL Database / Supabase                │
│  (clinics, doctors, doctor_availability, patients,     │
│   appointments)                                        │
└────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Tables & Schema

All migration files are located in `/supabase/migrations/20260815_init.sql`.

### 1. `clinics`
- `id` (TEXT / UUID PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `timezone` (TEXT NOT NULL DEFAULT 'Asia/Kolkata')
- `phone` (TEXT)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

### 2. `doctors`
- `id` (TEXT / UUID PRIMARY KEY)
- `clinic_id` (TEXT REFERENCES clinics(id) ON DELETE CASCADE)
- `name` (TEXT NOT NULL, e.g., 'Dr. Sharma')
- `specialty` (TEXT NOT NULL, e.g., 'General Physician')
- `active` (BOOLEAN NOT NULL DEFAULT true)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

### 3. `doctor_availability`
- `id` (TEXT / UUID PRIMARY KEY)
- `doctor_id` (TEXT REFERENCES doctors(id) ON DELETE CASCADE)
- `day_of_week` (INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6) — 0=Sun, 1=Mon... 6=Sat)
- `start_time` (TIME NOT NULL)
- `end_time` (TIME NOT NULL)
- `slot_duration_minutes` (INTEGER NOT NULL DEFAULT 30)
- `active` (BOOLEAN NOT NULL DEFAULT true)

### 4. `patients`
- `id` (TEXT / UUID PRIMARY KEY)
- `clinic_id` (TEXT REFERENCES clinics(id) ON DELETE CASCADE)
- `name` (TEXT NOT NULL)
- `phone` (TEXT NOT NULL)
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())
- Constraint: `UNIQUE (clinic_id, phone)`

### 5. `appointments`
- `id` (TEXT / UUID PRIMARY KEY)
- `clinic_id` (TEXT REFERENCES clinics(id) ON DELETE CASCADE)
- `doctor_id` (TEXT REFERENCES doctors(id) ON DELETE CASCADE)
- `patient_id` (TEXT REFERENCES patients(id) ON DELETE CASCADE)
- `appointment_date` (DATE NOT NULL)
- `start_time` (TIME NOT NULL)
- `end_time` (TIME NOT NULL)
- `status` (TEXT CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')) DEFAULT 'confirmed')
- `source` (TEXT CHECK (source IN ('dashboard', 'api', 'ai_call')) DEFAULT 'dashboard')
- `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

---

## 🛡️ Double Booking Prevention Invariant

Double booking is guaranteed to never occur at both the database level and the application logic level:

### PostgreSQL Level (Partial Unique Index)
```sql
CREATE UNIQUE INDEX idx_appointments_unique_active_slot
ON appointments (doctor_id, appointment_date, start_time)
WHERE status != 'cancelled';
```
* **Why it works:** Two active appointments cannot have the same `(doctor_id, appointment_date, start_time)`. When an appointment is marked `'cancelled'`, the index automatically releases the slot.

### Application Service Level
Prior to creating an appointment, `createAppointment()`:
1. Validates the doctor is active.
2. Validates the slot falls within scheduled working hours and adheres to `slot_duration_minutes`.
3. Checks for any active appointments that overlap with `[start_time, end_time)`.
4. Rejects conflicting requests immediately with `SLOT_ALREADY_BOOKED` and a clear error message.

---

## 🩺 Demo Seed Data

Pre-configured in `supabase/seed.sql` and initialized in local storage:

- **Clinic**: "Demo Clinic" (Timezone: `Asia/Kolkata`, Phone: `+91 9876543210`)
- **Doctor**: "Dr. Sharma" (Specialty: `General Physician`)
- **Working Hours**:
  - Monday to Friday:
    - Morning Shift: `10:00 AM - 1:00 PM` (`10:00` to `13:00`)
    - Evening Shift: `4:00 PM - 7:00 PM` (`16:00` to `19:00`)
  - Slot Duration: `30 minutes`
- **Secondary Doctor**: "Dr. Priya Patel" (Specialty: `Pediatrician`, Monday-Friday `09:00 - 12:00`)
- **Sample Patients**:
  - Aarav Mehta (`+91 9820123456`)
  - Ananya Iyer (`+91 9811223344`)
  - Rajesh Kumar (`+91 9899001122`)

---

## 🔌 API & Service Overview

All functions are located in `src/services/appointmentService.ts`, `src/services/doctorService.ts`, and `src/services/patientService.ts`:

### 1. `getAvailableSlots(doctorId: string, date: string)`
Returns genuinely available slots for a given doctor on a given date:
```json
{
  "doctor": "Dr. Sharma",
  "date": "2026-08-17",
  "available_slots": [
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30"
  ]
}
```

### 2. `createAppointment(request)`
Input:
- `doctor_id`
- `patient_name`
- `patient_phone`
- `appointment_date` (YYYY-MM-DD)
- `start_time` (e.g. "16:00" or "4:00 PM")
- `source` ("dashboard" | "api" | "ai_call")

Behavior:
1. Validates doctor & active status
2. Validates date/time format
3. Validates doctor working hours & shift window
4. Validates no existing active appointment occupies or overlaps the slot
5. Creates or reuses existing patient record by phone
6. Inserts confirmed appointment
7. Returns complete booking details

### 3. `cancelAppointment(appointmentId: string)`
Updates status to `'cancelled'`, which immediately frees the slot for other callers or dashboard users.

### 4. `getAppointments(filters)`
Returns appointment list with full patient and doctor metadata.

---

## ⚙️ Environment Variables & Setup

Declare in `.env`:

```env
# Optional Supabase connection (if omitted, high-performance local DB engine is used)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-public-key"
```

### Supabase Migration Steps:
1. Create a project in [Supabase](https://supabase.com).
2. Go to **SQL Editor** in Supabase Dashboard.
3. Paste and run `/supabase/migrations/20260815_init.sql`.
4. Paste and run `/supabase/seed.sql`.
5. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your `.env`.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite development server on port 3000
npm run dev

# Build for production
npm run build
```

---

## 🧪 Testing & Acceptance Verification

The application includes an automated test runner accessible in the **Engine Test Suite** tab:

1. **15-Step Final Acceptance Workflow**:
   - Executes the exact step-by-step verification:
     1. Open app & load clinic
     2. Select Dr. Sharma
     3. Select date
     4. Query available slots
     5. Select 4:00 PM
     6. Enter patient details
     7. Create appointment
     8. Verify in appointment list
     9. Query same date again
     10. Verify 4:00 PM is no longer available
     11. Attempt booking 4:00 PM again
     12. Verify system rejects second booking
     13. Cancel the first appointment
     14. Re-check availability
     15. Verify 4:00 PM is restored to available slots!
2. **7 Core Invariant Tests**:
   - Invariant 1: Available slot can be booked.
   - Invariant 2: Already-booked slot cannot be booked again.
   - Invariant 3: Slot outside working hours cannot be booked.
   - Invariant 4: Cancelled appointment releases the slot.
   - Invariant 5: Different doctors can have the same time slot.
   - Invariant 6: Same doctor cannot have overlapping appointments.
   - Invariant 7: Invalid doctor/date/time is rejected.
