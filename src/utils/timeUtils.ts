/**
 * Time and Date utilities for appointment slot calculations
 */

/**
 * Normalizes any time string (e.g. "16:00", "4:00 PM", "04:00 PM", "10:00:00") to HH:MM (24-hour format).
 */
export function normalizeTime(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();

  // Check if 12h format like "4:00 PM" or "10:30 am"
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2];
    const modifier = match12[3].toUpperCase();

    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  // Check if 24h format like "16:00" or "09:30"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = match24[2];
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return trimmed;
}

/**
 * Formats a 24-hour time (e.g. "16:00") to a readable 12-hour string (e.g. "4:00 PM").
 */
export function formatTo12Hour(time24: string): string {
  if (!time24) return '';
  const normalized = normalizeTime(time24);
  const [hStr, mStr] = normalized.split(':');
  const hours = parseInt(hStr, 10);
  const minutes = mStr || '00';

  if (isNaN(hours)) return time24;

  const modifier = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;

  return `${hours12}:${minutes} ${modifier}`;
}

/**
 * Converts HH:MM to total minutes from midnight (e.g. "10:30" -> 630).
 */
export function timeToMinutes(timeStr: string): number {
  const normalized = normalizeTime(timeStr);
  const [hStr, mStr] = normalized.split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  return h * 60 + m;
}

/**
 * Converts total minutes from midnight to HH:MM (e.g. 630 -> "10:30").
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Calculates the end time by adding duration minutes to a start time.
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + durationMinutes;
  return minutesToTime(endMins);
}

/**
 * Generates all discrete time slots between start_time and end_time for a given duration.
 * e.g., start: "10:00", end: "13:00", duration: 30
 * => ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30"]
 */
export function generateSlots(startTime: string, endTime: string, slotDurationMinutes: number): string[] {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  const slots: string[] = [];

  for (let current = startMins; current + slotDurationMinutes <= endMins; current += slotDurationMinutes) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

/**
 * Checks if two time intervals [startA, endA) and [startB, endB) overlap.
 */
export function doIntervalsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);

  return Math.max(sA, sB) < Math.min(eA, eB);
}

/**
 * Gets day of week for a given date string (YYYY-MM-DD).
 * Returns 0 (Sunday) to 6 (Saturday).
 */
export function getDayOfWeekFromDate(dateStr: string): number {
  // Parse date safely without timezone shifting issues by appending noon UTC or split
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day, 12, 0, 0);
  return d.getDay();
}

/**
 * Returns name of the day (e.g. "Monday", "Tuesday")
 */
export function getDayName(dayOfWeek: number): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
}

/**
 * Formats a YYYY-MM-DD date into human friendly string (e.g. "Mon, 17 Aug 2026")
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day, 12, 0, 0);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Helper to get today's date in YYYY-MM-DD format for a given timezone (defaults to Asia/Kolkata).
 */
export function getTodayDateString(timeZone = 'Asia/Kolkata'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

/**
 * Checks if a given date (YYYY-MM-DD) is in the past relative to today in the clinic timezone.
 */
export function isDateInPast(dateStr: string, timeZone = 'Asia/Kolkata'): boolean {
  if (!dateStr) return false;
  const today = getTodayDateString(timeZone);
  return dateStr < today;
}

/**
 * Checks if a specific date and time slot has already passed in the clinic timezone.
 */
export function isSlotInPast(dateStr: string, timeStr: string, timeZone = 'Asia/Kolkata'): boolean {
  if (!dateStr || !timeStr) return false;
  const today = getTodayDateString(timeZone);
  if (dateStr < today) return true;
  if (dateStr > today) return false;

  // Same day: check if time has passed
  try {
    const now = new Date();
    const timeParts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const h = parseInt(timeParts.find((p) => p.type === 'hour')?.value || '0', 10);
    const m = parseInt(timeParts.find((p) => p.type === 'minute')?.value || '0', 10);
    const currentMins = h * 60 + m;

    const slotMins = timeToMinutes(timeStr);
    return slotMins <= currentMins;
  } catch {
    return false;
  }
}

/**
 * Helper to get formatted today or future offset date (YYYY-MM-DD)
 */
export function getDateStringOffset(daysOffset = 0, timeZone = 'Asia/Kolkata'): string {
  const baseToday = getTodayDateString(timeZone);
  const [y, m, d] = baseToday.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + daysOffset);
  const year = dateObj.getFullYear();
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObj.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

