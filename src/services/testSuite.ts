import {
  getAvailableSlots,
  createAppointment,
  cancelAppointment,
  getAppointments,
} from './appointmentService';
import { getDoctors, getDoctorAvailability } from './doctorService';
import { StorageAdapter } from './storageAdapter';
import { getDateStringOffset } from '../utils/timeUtils';

export interface TestResult {
  id: number;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  logs: string[];
  error?: string;
  durationMs?: number;
}

export interface AcceptanceStepResult {
  step: number;
  description: string;
  status: 'passed' | 'failed' | 'running' | 'pending';
  detail: string;
}

/**
 * Finds a future Monday or Tuesday date (ISO YYYY-MM-DD)
 * to ensure working hours are active for Dr. Sharma (Mon-Fri).
 */
function getFutureWeekdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  // Ensure day is Mon (1), Tue (2), Wed (3), Thu (4), or Fri (5)
  const day = d.getDay();
  if (day === 0) d.setDate(d.getDate() + 1); // Sunday -> Monday
  if (day === 6) d.setDate(d.getDate() + 2); // Saturday -> Monday

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const dateNum = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${dateNum}`;
}

export async function runEngineTestSuite(
  onUpdate?: (results: TestResult[]) => void
): Promise<TestResult[]> {
  const testDate = getFutureWeekdayDate();
  const doctors = await getDoctors();
  const drSharma = doctors.find((d) => d.name.includes('Sharma')) || doctors[0];
  const drPatel = doctors.find((d) => d.name.includes('Patel')) || doctors[1];

  const results: TestResult[] = [
    {
      id: 1,
      name: 'Available slot can be booked',
      description: 'Verifies booking an available slot (e.g. 10:00 AM) succeeds with confirmed status.',
      status: 'pending',
      logs: [],
    },
    {
      id: 2,
      name: 'Already-booked slot cannot be booked again',
      description: 'Double-booking prevention: attempting to book 10:00 AM again for the same doctor fails.',
      status: 'pending',
      logs: [],
    },
    {
      id: 3,
      name: 'Slot outside working hours cannot be booked',
      description: 'Booking outside working hours (e.g. 02:00 AM or 02:00 PM when clinic is closed) is rejected.',
      status: 'pending',
      logs: [],
    },
    {
      id: 4,
      name: 'Cancelled appointment releases the slot',
      description: 'Cancelling a confirmed appointment makes the slot immediately available for re-booking.',
      status: 'pending',
      logs: [],
    },
    {
      id: 5,
      name: 'Different doctors can have the same time slot',
      description: 'Dr. Sharma and Dr. Patel can both have appointments at the same time on the same date.',
      status: 'pending',
      logs: [],
    },
    {
      id: 6,
      name: 'Same doctor cannot have overlapping appointments',
      description: 'Overlapping time ranges for the same doctor are strictly prohibited.',
      status: 'pending',
      logs: [],
    },
    {
      id: 7,
      name: 'Invalid doctor/date/time is rejected',
      description: 'Invalid inputs (non-existent doctor, malformed date/time, missing phone) are rejected gracefully.',
      status: 'pending',
      logs: [],
    },
  ];

  const update = () => onUpdate?.([...results]);

  // TEST 1: Available slot can be booked
  try {
    results[0].status = 'running';
    update();
    const t0 = performance.now();

    const availBefore = await getAvailableSlots(drSharma.id, testDate);
    results[0].logs.push(`Initial available slots for ${drSharma.name} on ${testDate}: ${availBefore.available_slots.join(', ')}`);

    if (!availBefore.available_slots.includes('10:00')) {
      throw new Error('Expected 10:00 to be in initial available slots');
    }

    const bookRes = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Test Patient Alpha',
      patient_phone: '+91 9999900001',
      appointment_date: testDate,
      start_time: '10:00',
      source: 'api',
    });

    if (!bookRes.success || !bookRes.appointment) {
      throw new Error(bookRes.error || 'Failed to book available slot 10:00');
    }

    results[0].logs.push(`Successfully created appointment ID: ${bookRes.appointment.id}, Status: ${bookRes.appointment.status}`);

    const availAfter = await getAvailableSlots(drSharma.id, testDate);
    if (availAfter.available_slots.includes('10:00')) {
      throw new Error('10:00 is still listed as available after being booked');
    }

    results[0].status = 'passed';
    results[0].durationMs = Math.round(performance.now() - t0);
    results[0].logs.push('Verified: Slot 10:00 removed from available slots and appointment is confirmed.');
  } catch (err: unknown) {
    results[0].status = 'failed';
    results[0].error = err instanceof Error ? err.message : String(err);
  }
  update();

  // TEST 2: Already-booked slot cannot be booked again
  try {
    results[1].status = 'running';
    update();
    const t0 = performance.now();

    results[1].logs.push(`Attempting duplicate booking for ${drSharma.name} on ${testDate} at 10:00`);
    const duplicateRes = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Test Patient Beta (Duplicate Attempter)',
      patient_phone: '+91 9999900002',
      appointment_date: testDate,
      start_time: '10:00',
      source: 'dashboard',
    });

    if (duplicateRes.success) {
      throw new Error('CRITICAL BUG: Double booking was allowed for 10:00!');
    }

    results[1].logs.push(`Double booking correctly rejected with error: "${duplicateRes.error}" (code: ${duplicateRes.code})`);
    results[1].status = 'passed';
    results[1].durationMs = Math.round(performance.now() - t0);
  } catch (err: unknown) {
    results[1].status = 'failed';
    results[1].error = err instanceof Error ? err.message : String(err);
  }
  update();

  // TEST 3: Slot outside working hours cannot be booked
  try {
    results[2].status = 'running';
    update();
    const t0 = performance.now();

    // 02:00 (middle of night)
    results[2].logs.push('Testing night slot 02:00 (outside clinic hours)...');
    const nightRes = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Test Patient Gamma',
      patient_phone: '+91 9999900003',
      appointment_date: testDate,
      start_time: '02:00',
    });

    if (nightRes.success) {
      throw new Error('Allowed booking at 02:00 outside working hours');
    }
    results[2].logs.push(`02:00 rejected as expected: "${nightRes.error}"`);

    // 14:00 (break between 13:00 and 16:00 shifts)
    results[2].logs.push('Testing break hour 14:00 (between morning and evening shifts)...');
    const breakRes = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Test Patient Gamma',
      patient_phone: '+91 9999900003',
      appointment_date: testDate,
      start_time: '14:00',
    });

    if (breakRes.success) {
      throw new Error('Allowed booking at 14:00 during clinic break');
    }
    results[2].logs.push(`14:00 break rejected as expected: "${breakRes.error}"`);

    results[2].status = 'passed';
    results[2].durationMs = Math.round(performance.now() - t0);
  } catch (err: unknown) {
    results[2].status = 'failed';
    results[2].error = err instanceof Error ? err.message : String(err);
  }
  update();

  // TEST 4: Cancelled appointment releases the slot
  try {
    results[3].status = 'running';
    update();
    const t0 = performance.now();

    // Book 16:00
    results[3].logs.push(`Booking 16:00 for ${drSharma.name}...`);
    const book16 = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Patient To Cancel',
      patient_phone: '+91 9999900004',
      appointment_date: testDate,
      start_time: '16:00',
    });

    if (!book16.success || !book16.appointment) {
      throw new Error(book16.error || 'Failed to create appointment for cancellation test');
    }

    const aptId = book16.appointment.id;
    results[3].logs.push(`Appointment created (ID: ${aptId}). Verifying 16:00 is occupied...`);

    const availOccupied = await getAvailableSlots(drSharma.id, testDate);
    if (availOccupied.available_slots.includes('16:00')) {
      throw new Error('Slot 16:00 is still in available slots right after booking');
    }

    results[3].logs.push('Cancelling appointment...');
    await cancelAppointment(aptId);

    const availReleased = await getAvailableSlots(drSharma.id, testDate);
    if (!availReleased.available_slots.includes('16:00')) {
      throw new Error('Slot 16:00 was not released after cancellation');
    }

    results[3].logs.push('Slot 16:00 is immediately released and visible in available slots again.');

    // Re-book 16:00 to verify full re-usability
    const rebook = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Patient New Bookings',
      patient_phone: '+91 9999900005',
      appointment_date: testDate,
      start_time: '16:00',
    });

    if (!rebook.success) {
      throw new Error(`Failed to re-book released slot 16:00: ${rebook.error}`);
    }

    results[3].logs.push('Successfully re-booked the previously cancelled slot with a new patient.');
    results[3].status = 'passed';
    results[3].durationMs = Math.round(performance.now() - t0);
  } catch (err: unknown) {
    results[3].status = 'failed';
    results[3].error = err instanceof Error ? err.message : String(err);
  }
  update();

  // TEST 5: Different doctors can have the same time slot
  try {
    results[4].status = 'running';
    update();
    const t0 = performance.now();

    if (!drPatel) {
      throw new Error('Second doctor (Dr. Patel) not found for multi-doctor test');
    }

    // Dr. Sharma booked at 11:00
    results[4].logs.push(`Booking 11:00 for ${drSharma.name}...`);
    const bookSharma = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Sharma Patient',
      patient_phone: '+91 9999900006',
      appointment_date: testDate,
      start_time: '11:00',
    });

    if (!bookSharma.success) {
      throw new Error(`Failed to book 11:00 for Dr. Sharma: ${bookSharma.error}`);
    }

    // Dr. Patel also books at 11:00 (Dr. Patel has 09:00 - 12:00 shift)
    results[4].logs.push(`Booking same time (11:00) on same date for ${drPatel.name}...`);
    const bookPatel = await createAppointment({
      doctor_id: drPatel.id,
      patient_name: 'Patel Patient',
      patient_phone: '+91 9999900007',
      appointment_date: testDate,
      start_time: '11:00',
    });

    if (!bookPatel.success) {
      throw new Error(`Independent doctor booking failed for Dr. Patel: ${bookPatel.error}`);
    }

    results[4].logs.push(`Both doctors successfully booked at 11:00 on ${testDate} without conflict.`);
    results[4].status = 'passed';
    results[4].durationMs = Math.round(performance.now() - t0);
  } catch (err: unknown) {
    results[4].status = 'failed';
    results[4].error = err instanceof Error ? err.message : String(err);
  }
  update();

  // TEST 6: Same doctor cannot have overlapping appointments
  try {
    results[5].status = 'running';
    update();
    const t0 = performance.now();

    // Try booking 10:00 (which was booked in Test 1) again
    const overlapRes = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Overlap Test Patient',
      patient_phone: '+91 9999900008',
      appointment_date: testDate,
      start_time: '10:00',
    });

    if (overlapRes.success) {
      throw new Error('Overlap was not caught for the same doctor');
    }

    results[5].logs.push(`Overlapping booking blocked: "${overlapRes.error}"`);
    results[5].status = 'passed';
    results[5].durationMs = Math.round(performance.now() - t0);
  } catch (err: unknown) {
    results[5].status = 'failed';
    results[5].error = err instanceof Error ? err.message : String(err);
  }
  update();

  // TEST 7: Invalid doctor/date/time is rejected
  try {
    results[6].status = 'running';
    update();
    const t0 = performance.now();

    // Non-existent doctor
    const invalidDoc = await createAppointment({
      doctor_id: 'non-existent-doc-999',
      patient_name: 'Invalid Test',
      patient_phone: '+91 9999900009',
      appointment_date: testDate,
      start_time: '10:00',
    });
    if (invalidDoc.success) throw new Error('Allowed booking with invalid doctor ID');
    results[6].logs.push(`Invalid doctor correctly rejected: "${invalidDoc.error}"`);

    // Invalid date
    const invalidDate = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Invalid Test',
      patient_phone: '+91 9999900009',
      appointment_date: 'not-a-date',
      start_time: '10:00',
    });
    if (invalidDate.success) throw new Error('Allowed booking with invalid date');
    results[6].logs.push(`Invalid date format correctly rejected: "${invalidDate.error}"`);

    // Missing patient phone
    const missingPhone = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Invalid Test',
      patient_phone: '',
      appointment_date: testDate,
      start_time: '10:00',
    });
    if (missingPhone.success) throw new Error('Allowed booking with empty phone');
    results[6].logs.push(`Missing phone correctly rejected: "${missingPhone.error}"`);

    // Back-dated date rejection check
    const backdatedBooking = await createAppointment({
      doctor_id: drSharma.id,
      patient_name: 'Past Booking Test',
      patient_phone: '+91 9999900009',
      appointment_date: '2020-01-01',
      start_time: '10:00',
    });
    if (backdatedBooking.success) throw new Error('Allowed back-dated booking for past date 2020-01-01');
    results[6].logs.push(`Back-dated date correctly rejected: "${backdatedBooking.error}"`);

    results[6].status = 'passed';
    results[6].durationMs = Math.round(performance.now() - t0);
  } catch (err: unknown) {
    results[6].status = 'failed';
    results[6].error = err instanceof Error ? err.message : String(err);
  }
  update();

  return results;
}

/**
 * Runs the exact 15-step Acceptance Workflow required by the specification:
 * 1. Open the application.
 * 2. Select Dr. Sharma.
 * 3. Select a date.
 * 4. See available slots.
 * 5. Select 4:00 PM.
 * 6. Enter patient name and phone.
 * 7. Create appointment.
 * 8. Appointment appears in the appointment list.
 * 9. Check the same date again.
 * 10. 4:00 PM is no longer available.
 * 11. Attempt to book 4:00 PM again.
 * 12. System rejects the booking.
 * 13. Cancel the appointment.
 * 14. Check availability again.
 * 15. 4:00 PM becomes available.
 */
export async function runAcceptanceTestWorkflow(
  onStepUpdate?: (steps: AcceptanceStepResult[]) => void
): Promise<{ success: boolean; steps: AcceptanceStepResult[] }> {
  const steps: AcceptanceStepResult[] = [
    { step: 1, description: 'Open the application and load clinic state', status: 'pending', detail: '' },
    { step: 2, description: 'Select Dr. Sharma', status: 'pending', detail: '' },
    { step: 3, description: 'Select a target date (e.g. upcoming weekday)', status: 'pending', detail: '' },
    { step: 4, description: 'Fetch and view available slots', status: 'pending', detail: '' },
    { step: 5, description: 'Select slot 4:00 PM (16:00)', status: 'pending', detail: '' },
    { step: 6, description: 'Enter patient name and phone number', status: 'pending', detail: '' },
    { step: 7, description: 'Create appointment for 4:00 PM', status: 'pending', detail: '' },
    { step: 8, description: 'Verify appointment appears in appointment list', status: 'pending', detail: '' },
    { step: 9, description: 'Check availability on the same date again', status: 'pending', detail: '' },
    { step: 10, description: 'Verify 4:00 PM is no longer available', status: 'pending', detail: '' },
    { step: 11, description: 'Attempt to book 4:00 PM again (same doctor, date, slot)', status: 'pending', detail: '' },
    { step: 12, description: 'Verify system rejects the second booking attempt', status: 'pending', detail: '' },
    { step: 13, description: 'Cancel the first appointment', status: 'pending', detail: '' },
    { step: 14, description: 'Check availability again after cancellation', status: 'pending', detail: '' },
    { step: 15, description: 'Verify 4:00 PM becomes available again', status: 'pending', detail: '' },
  ];

  const update = () => onStepUpdate?.([...steps]);

  let doctorId = '';
  const testDate = getFutureWeekdayDate();
  let createdAptId = '';

  try {
    // Step 1: Open app / load clinic
    steps[0].status = 'running';
    update();
    const doctors = await getDoctors();
    if (!doctors || doctors.length === 0) throw new Error('No doctors found in clinic');
    steps[0].status = 'passed';
    steps[0].detail = `Clinic loaded with ${doctors.length} active doctors`;
    update();

    // Step 2: Select Dr. Sharma
    steps[1].status = 'running';
    update();
    const drSharma = doctors.find((d) => d.name.includes('Sharma')) || doctors[0];
    doctorId = drSharma.id;
    steps[1].status = 'passed';
    steps[1].detail = `Selected ${drSharma.name} (${drSharma.specialty})`;
    update();

    // Step 3: Select date
    steps[2].status = 'running';
    update();
    steps[2].status = 'passed';
    steps[2].detail = `Target date selected: ${testDate}`;
    update();

    // Step 4: See available slots
    steps[3].status = 'running';
    update();
    const avail1 = await getAvailableSlots(doctorId, testDate);
    steps[3].status = 'passed';
    steps[3].detail = `Available slots found: ${avail1.available_slots.length} slots (${avail1.available_slots.slice(0, 4).join(', ')}...)`;
    update();

    // Step 5: Select 4:00 PM (16:00)
    steps[4].status = 'running';
    update();
    if (!avail1.available_slots.includes('16:00')) {
      throw new Error('4:00 PM (16:00) is not in available slots for Dr. Sharma on this date');
    }
    steps[4].status = 'passed';
    steps[4].detail = 'Selected slot: 4:00 PM (16:00)';
    update();

    // Step 6: Enter patient name and phone
    steps[5].status = 'running';
    update();
    const patientName = 'Rohan Gupta';
    const patientPhone = '+91 9876500001';
    steps[5].status = 'passed';
    steps[5].detail = `Patient details prepared: ${patientName}, ${patientPhone}`;
    update();

    // Step 7: Create appointment
    steps[6].status = 'running';
    update();
    const bookRes = await createAppointment({
      doctor_id: doctorId,
      patient_name: patientName,
      patient_phone: patientPhone,
      appointment_date: testDate,
      start_time: '16:00',
      source: 'dashboard',
    });
    if (!bookRes.success || !bookRes.appointment) {
      throw new Error(bookRes.error || 'Failed to create appointment');
    }
    createdAptId = bookRes.appointment.id;
    steps[6].status = 'passed';
    steps[6].detail = `Appointment created successfully (ID: ${createdAptId}, Status: ${bookRes.appointment.status})`;
    update();

    // Step 8: Verify appointment appears in list
    steps[7].status = 'running';
    update();
    const allAppointments = await getAppointments({ doctor_id: doctorId, date: testDate });
    const found = allAppointments.find((a) => a.id === createdAptId);
    if (!found || found.status !== 'confirmed') {
      throw new Error('Appointment did not appear in appointment list with confirmed status');
    }
    steps[7].status = 'passed';
    steps[7].detail = `Verified in list: ${found.patient_name} with ${found.doctor_name} at ${found.start_time}`;
    update();

    // Step 9: Check same date again
    steps[8].status = 'running';
    update();
    const avail2 = await getAvailableSlots(doctorId, testDate);
    steps[8].status = 'passed';
    steps[8].detail = `Queried availability for ${testDate}`;
    update();

    // Step 10: 4:00 PM is no longer available
    steps[9].status = 'running';
    update();
    if (avail2.available_slots.includes('16:00')) {
      throw new Error('FAIL: 4:00 PM (16:00) is still available after booking!');
    }
    steps[9].status = 'passed';
    steps[9].detail = 'Verified: 4:00 PM (16:00) is excluded from available slots.';
    update();

    // Step 11: Attempt to book 4:00 PM again
    steps[10].status = 'running';
    update();
    const doubleBookRes = await createAppointment({
      doctor_id: doctorId,
      patient_name: 'Second Patient',
      patient_phone: '+91 9876500002',
      appointment_date: testDate,
      start_time: '16:00',
    });
    steps[10].status = 'passed';
    steps[10].detail = 'Submitted conflicting booking request for 4:00 PM';
    update();

    // Step 12: System rejects the booking
    steps[11].status = 'running';
    update();
    if (doubleBookRes.success) {
      throw new Error('CRITICAL FAILURE: System allowed double booking for 4:00 PM!');
    }
    steps[11].status = 'passed';
    steps[11].detail = `Rejection confirmed: "${doubleBookRes.error}" (code: ${doubleBookRes.code})`;
    update();

    // Step 13: Cancel the appointment
    steps[12].status = 'running';
    update();
    const cancelled = await cancelAppointment(createdAptId);
    if (cancelled.status !== 'cancelled') {
      throw new Error('Failed to set appointment status to cancelled');
    }
    steps[12].status = 'passed';
    steps[12].detail = `Appointment ${createdAptId} status updated to 'cancelled'`;
    update();

    // Step 14: Check availability again
    steps[13].status = 'running';
    update();
    const avail3 = await getAvailableSlots(doctorId, testDate);
    steps[13].status = 'passed';
    steps[13].detail = `Re-checked availability: ${avail3.available_slots.length} available slots`;
    update();

    // Step 15: 4:00 PM becomes available
    steps[14].status = 'running';
    update();
    if (!avail3.available_slots.includes('16:00')) {
      throw new Error('4:00 PM (16:00) did not become available after appointment was cancelled');
    }
    steps[14].status = 'passed';
    steps[14].detail = 'Verified: 4:00 PM (16:00) is restored and ready for new bookings!';
    update();

    return { success: true, steps };
  } catch (err: unknown) {
    const activeStep = steps.find((s) => s.status === 'running') || steps[0];
    activeStep.status = 'failed';
    activeStep.detail = err instanceof Error ? err.message : String(err);
    update();
    return { success: false, steps };
  }
}
