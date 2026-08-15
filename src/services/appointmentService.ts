import {
  Appointment,
  AppointmentFilter,
  AppointmentWithDetails,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  GetAvailabilityResponse,
} from '../types/database';
import { StorageAdapter } from './storageAdapter';
import { getDoctorById, getDoctorAvailability } from './doctorService';
import { createPatient } from './patientService';
import {
  normalizeTime,
  calculateEndTime,
  generateSlots,
  getDayOfWeekFromDate,
  timeToMinutes,
  doIntervalsOverlap,
  isDateInPast,
  isSlotInPast,
  getTodayDateString,
} from '../utils/timeUtils';

/**
 * Appointment Engine Service
 * Implements business logic for slot calculations, double-booking prevention, and booking workflow.
 */

/**
 * 1. GET Availability
 * Returns only genuinely available slots for a given doctor and date.
 */
export async function getAvailableSlots(
  doctorId: string,
  date: string
): Promise<GetAvailabilityResponse> {
  if (!doctorId) {
    throw new Error('doctor_id is required');
  }
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Valid date in YYYY-MM-DD format is required');
  }

  // 1. Validate doctor
  const doctor = await getDoctorById(doctorId);
  if (!doctor || !doctor.active) {
    throw new Error(`Doctor with ID ${doctorId} not found or is inactive`);
  }

  // 2. Validate date is not in the past
  if (isDateInPast(date)) {
    return {
      doctor: doctor.name,
      doctor_id: doctorId,
      date,
      available_slots: [],
      booked_slots: [],
      total_slots: 0,
    };
  }

  // 2. Determine day of week
  const dayOfWeek = getDayOfWeekFromDate(date);

  // 3. Fetch doctor's availability schedules for this day of week
  const allAvailability = await getDoctorAvailability(doctorId);
  const daySchedules = allAvailability.filter(
    (s) => s.day_of_week === dayOfWeek && s.active
  );

  if (daySchedules.length === 0) {
    return {
      doctor: doctor.name,
      doctor_id: doctor.id,
      date,
      available_slots: [],
      booked_slots: [],
      total_slots: 0,
    };
  }

  // 4. Generate all possible working slots for the day
  const candidateSlots: { startTime: string; endTime: string; duration: number }[] = [];
  for (const schedule of daySchedules) {
    const slots = generateSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.slot_duration_minutes
    );
    for (const slot of slots) {
      candidateSlots.push({
        startTime: slot,
        endTime: calculateEndTime(slot, schedule.slot_duration_minutes),
        duration: schedule.slot_duration_minutes,
      });
    }
  }

  // Sort candidate slots chronologically
  candidateSlots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  // 5. Fetch existing active (non-cancelled) appointments on that date
  const activeAppointments = await StorageAdapter.getActiveAppointmentsForDoctorOnDate(
    doctorId,
    date
  );

  const bookedSlots: string[] = [];
  const availableSlots: string[] = [];

  // 6. Check each candidate slot against active appointments
  for (const candidate of candidateSlots) {
    const isBooked = activeAppointments.some((apt) => {
      if (apt.start_time === candidate.startTime) {
        return true;
      }
      return doIntervalsOverlap(
        candidate.startTime,
        candidate.endTime,
        apt.start_time,
        apt.end_time
      );
    });

    if (isBooked) {
      bookedSlots.push(candidate.startTime);
    } else if (isSlotInPast(date, candidate.startTime)) {
      // Slot has already elapsed today in clinic timezone
      bookedSlots.push(candidate.startTime);
    } else {
      availableSlots.push(candidate.startTime);
    }
  }

  return {
    doctor: doctor.name,
    doctor_id: doctor.id,
    date,
    available_slots: availableSlots,
    booked_slots: bookedSlots,
    total_slots: candidateSlots.length,
  };
}

/**
 * 2. POST Appointment
 * Creates an appointment with strict validation and double-booking prevention.
 */
export async function createAppointment(
  request: CreateAppointmentRequest
): Promise<CreateAppointmentResponse> {
  const { doctor_id, patient_name, patient_phone, appointment_date, start_time, source = 'dashboard' } = request;

  // Step 1: Validate input presence
  if (!doctor_id) {
    return { success: false, error: 'doctor_id is required', code: 'INVALID_INPUT' };
  }
  if (!patient_name || patient_name.trim().length === 0) {
    return { success: false, error: 'patient_name is required', code: 'INVALID_PATIENT_NAME' };
  }
  if (!patient_phone || patient_phone.trim().length === 0) {
    return { success: false, error: 'patient_phone is required', code: 'INVALID_PATIENT_PHONE' };
  }
  if (!appointment_date || !/^\d{4}-\d{2}-\d{2}$/.test(appointment_date)) {
    return { success: false, error: 'Valid appointment_date in YYYY-MM-DD format is required', code: 'INVALID_DATE' };
  }

  // Reject back-dated appointments
  if (isDateInPast(appointment_date)) {
    return {
      success: false,
      error: `Back-dated booking is not permitted. ${appointment_date} is in the past.`,
      code: 'BACKDATED_BOOKING_NOT_ALLOWED',
    };
  }

  if (!start_time) {
    return { success: false, error: 'start_time is required', code: 'INVALID_TIME' };
  }

  const normalizedStartTime = normalizeTime(start_time);
  if (!normalizedStartTime || !/^\d{2}:\d{2}$/.test(normalizedStartTime)) {
    return { success: false, error: 'Invalid time format. Please provide a valid time like "10:00" or "4:00 PM"', code: 'INVALID_TIME_FORMAT' };
  }

  // Reject past time slots on today's date
  if (isSlotInPast(appointment_date, normalizedStartTime)) {
    return {
      success: false,
      error: `Slot ${normalizedStartTime} on ${appointment_date} has already passed. Please select an upcoming time slot.`,
      code: 'PAST_SLOT_NOT_ALLOWED',
    };
  }

  // Step 2: Validate doctor existence and active status
  const doctor = await getDoctorById(doctor_id);
  if (!doctor || !doctor.active) {
    return { success: false, error: `Doctor with ID ${doctor_id} not found or inactive`, code: 'DOCTOR_NOT_FOUND' };
  }

  const clinicId = request.clinic_id || doctor.clinic_id;

  // Step 3: Check doctor's working hours & availability for that day
  const dayOfWeek = getDayOfWeekFromDate(appointment_date);
  const allAvailability = await getDoctorAvailability(doctor_id);
  const daySchedules = allAvailability.filter((s) => s.day_of_week === dayOfWeek && s.active);

  if (daySchedules.length === 0) {
    return {
      success: false,
      error: `${doctor.name} is not available on this day (${appointment_date}).`,
      code: 'OUTSIDE_WORKING_HOURS',
    };
  }

  // Find matching shift schedule that covers this slot
  const reqStartMins = timeToMinutes(normalizedStartTime);
  const matchingSchedule = daySchedules.find((s) => {
    const sStart = timeToMinutes(s.start_time);
    const sEnd = timeToMinutes(s.end_time);
    // The requested start time must fall exactly on a slot boundary within [sStart, sEnd)
    if (reqStartMins < sStart || reqStartMins + s.slot_duration_minutes > sEnd) {
      return false;
    }
    // Check if slot aligns with slot duration step
    return (reqStartMins - sStart) % s.slot_duration_minutes === 0;
  });

  if (!matchingSchedule) {
    return {
      success: false,
      error: `Requested time ${normalizedStartTime} is outside ${doctor.name}'s scheduled working hours.`,
      code: 'OUTSIDE_WORKING_HOURS',
    };
  }

  const slotDuration = matchingSchedule.slot_duration_minutes;
  const calculatedEndTime = calculateEndTime(normalizedStartTime, slotDuration);

  // Step 4: Concurrency and existing appointment check (Double Booking Prevention)
  const activeAppointments = await StorageAdapter.getActiveAppointmentsForDoctorOnDate(
    doctor_id,
    appointment_date
  );

  const hasConflict = activeAppointments.some((apt) => {
    if (apt.start_time === normalizedStartTime) {
      return true;
    }
    return doIntervalsOverlap(
      normalizedStartTime,
      calculatedEndTime,
      apt.start_time,
      apt.end_time
    );
  });

  if (hasConflict) {
    return {
      success: false,
      error: `Slot ${normalizedStartTime} on ${appointment_date} is already booked for ${doctor.name}. Please select another time.`,
      code: 'SLOT_ALREADY_BOOKED',
    };
  }

  try {
    // Step 5: Create or reuse patient
    const patient = await createPatient(clinicId, patient_name, patient_phone);

    // Step 6: Create appointment with status 'confirmed'
    const newAppointment = await StorageAdapter.insertAppointment({
      clinic_id: clinicId,
      doctor_id: doctor.id,
      patient_id: patient.id,
      appointment_date,
      start_time: normalizedStartTime,
      end_time: calculatedEndTime,
      status: 'confirmed',
      source,
    });

    const appointmentWithDetails: AppointmentWithDetails = {
      ...newAppointment,
      doctor_name: doctor.name,
      doctor_specialty: doctor.specialty,
      patient_name: patient.name,
      patient_phone: patient.phone,
    };

    return {
      success: true,
      appointment: appointmentWithDetails,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown booking error';
    return {
      success: false,
      error: message,
      code: 'BOOKING_FAILED',
    };
  }
}

/**
 * 3. Cancel Appointment
 * Cancels an appointment and immediately releases the slot.
 */
export async function cancelAppointment(
  appointmentId: string
): Promise<Appointment> {
  if (!appointmentId) {
    throw new Error('appointmentId is required to cancel an appointment');
  }

  return await StorageAdapter.updateAppointmentStatus(appointmentId, 'cancelled');
}

/**
 * 4. Get Appointments
 * Fetches appointments matching optional filters with enriched doctor and patient info.
 */
export async function getAppointments(
  filters?: AppointmentFilter
): Promise<AppointmentWithDetails[]> {
  return await StorageAdapter.getAppointments(filters);
}

/**
 * 5. Update Appointment Status
 */
export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment['status']
): Promise<Appointment> {
  return await StorageAdapter.updateAppointmentStatus(appointmentId, status);
}
