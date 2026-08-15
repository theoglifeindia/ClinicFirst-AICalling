import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Doctor, AppointmentSource, AppointmentWithDetails } from '../types/database';
import { getAvailableSlots, createAppointment } from '../services/appointmentService';
import { formatTo12Hour, formatDisplayDate, getDateStringOffset, getTodayDateString, isDateInPast, isSlotInPast } from '../utils/timeUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: Doctor[];
  initialDoctorId?: string;
  initialDate?: string;
  initialTime?: string;
  onBookingSuccess: (appointment: AppointmentWithDetails) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  doctors,
  initialDoctorId,
  initialDate,
  initialTime,
  onBookingSuccess,
}) => {
  const [doctorId, setDoctorId] = useState<string>(initialDoctorId || (doctors[0]?.id || ''));
  const [date, setDate] = useState<string>(initialDate || getDateStringOffset(0));
  const [selectedSlot, setSelectedSlot] = useState<string>(initialTime || '');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [source, setSource] = useState<AppointmentSource>('dashboard');

  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<AppointmentWithDetails | null>(null);

  // Sync initial props
  useEffect(() => {
    if (initialDoctorId) setDoctorId(initialDoctorId);
    if (initialDate) setDate(initialDate);
    if (initialTime) setSelectedSlot(initialTime);
  }, [initialDoctorId, initialDate, initialTime]);

  // If no doctor selected yet, default to first
  useEffect(() => {
    if (!doctorId && doctors.length > 0) {
      setDoctorId(doctors[0].id);
    }
  }, [doctors, doctorId]);

  // Load available slots whenever doctorId or date changes
  useEffect(() => {
    if (!isOpen || !doctorId || !date) return;

    let isMounted = true;
    setLoadingSlots(true);
    setErrorMsg(null);

    getAvailableSlots(doctorId, date)
      .then((res) => {
        if (!isMounted) return;
        setAvailableSlots(res.available_slots);
        setBookedSlots(res.booked_slots || []);
        if (selectedSlot && !res.available_slots.includes(selectedSlot)) {
          if (selectedSlot !== initialTime) {
            setSelectedSlot('');
          }
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setAvailableSlots([]);
        setBookedSlots([]);
        setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch availability');
      })
      .finally(() => {
        if (isMounted) setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, doctorId, date]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z\s.']/g, '');
    setPatientName(val);
    if (errorMsg) setErrorMsg(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPatientPhone(digits);
    if (errorMsg) setErrorMsg(null);
  };

  const todayStr = getTodayDateString();
  const isPastSelectedDate = isDateInPast(date);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isDateInPast(date)) {
      setErrorMsg(`Back-dated booking is not permitted. Please select today (${todayStr}) or a future date.`);
      return;
    }

    if (!selectedSlot) {
      setErrorMsg('Please select an available appointment time slot.');
      return;
    }

    if (isSlotInPast(date, selectedSlot)) {
      setErrorMsg(`The selected time slot (${formatTo12Hour(selectedSlot)}) has already passed.`);
      return;
    }

    const trimmedName = patientName.trim();
    if (!trimmedName) {
      setErrorMsg('Please enter the patient’s full name.');
      return;
    }

    if (!/^[a-zA-Z\s.']{2,60}$/.test(trimmedName)) {
      setErrorMsg('Patient name must contain characters only (minimum 2 letters).');
      return;
    }

    if (patientPhone.length !== 10) {
      setErrorMsg('Patient phone number must be exactly 10 digits (e.g. 9876543210).');
      return;
    }

    setSubmitting(true);

    try {
      const fullPhone = `+91 ${patientPhone}`;
      const result = await createAppointment({
        doctor_id: doctorId,
        patient_name: trimmedName,
        patient_phone: fullPhone,
        appointment_date: date,
        start_time: selectedSlot,
        source,
      });

      if (!result.success || !result.appointment) {
        setErrorMsg(result.error || 'Booking could not be completed.');
        setSubmitting(false);
        return;
      }

      setSuccessResult(result.appointment);
      onBookingSuccess(result.appointment);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected booking error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSuccessResult(null);
    setErrorMsg(null);
    setPatientName('');
    setPatientPhone('');
    setSelectedSlot('');
    onClose();
  };

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="booking-modal-container"
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors"
      >
        {/* Header */}
        <div className="px-6 py-4 theme-hero-gradient text-white flex justify-between items-center border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Book Clinic Appointment</h3>
              <p className="text-xs text-slate-200">Patient Appointment System</p>
            </div>
          </div>
          <button
            id="close-booking-modal-btn"
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Confirmation State */}
        {successResult ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full theme-bg-light theme-text-primary flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Appointment Confirmed!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Booking Reference: <span className="font-mono font-medium text-slate-700 dark:text-slate-300">{successResult.id}</span>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Doctor:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {successResult.doctor_name} ({successResult.doctor_specialty})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Date:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formatDisplayDate(successResult.appointment_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Time Slot:</span>
                <span className="font-bold theme-text-primary">
                  {formatTo12Hour(successResult.start_time)} - {formatTo12Hour(successResult.end_time)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Patient:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {successResult.patient_name} ({successResult.patient_phone})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Source:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                  {successResult.source}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                id="book-another-appointment-btn"
                onClick={() => {
                  setSuccessResult(null);
                  setSelectedSlot('');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
              >
                Book Another Slot
              </button>
              <button
                id="close-success-modal-btn"
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 px-4 rounded-xl theme-btn-primary text-sm font-bold transition-colors shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message Banner */}
            {errorMsg && (
              <div
                id="booking-error-banner"
                className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-start gap-2.5 text-xs sm:text-sm animate-shake"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Booking Rejected</p>
                  <p className="text-rose-700 dark:text-rose-300 mt-0.5">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Doctor & Date Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Doctor</label>
                <select
                  id="booking-doctor-select"
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    setSelectedSlot('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {d.name} ({d.specialty})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Appointment Date</label>
                  {isPastSelectedDate && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-0.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Past date not allowed
                    </span>
                  )}
                </div>
                <input
                  id="booking-date-input"
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setDate(newDate);
                    setSelectedSlot('');
                    if (isDateInPast(newDate)) {
                      setErrorMsg(`Back-dated booking is not permitted. Please select today (${todayStr}) or a future date.`);
                    } else if (errorMsg && errorMsg.includes('Back-dated')) {
                      setErrorMsg(null);
                    }
                  }}
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 ${
                    isPastSelectedDate
                      ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                      : 'border-slate-300 dark:border-slate-700 focus:ring-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* Slot Picker Grid */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Available Time Slots ({selectedDoctor?.name})</span>
                </label>
                <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">
                  {loadingSlots ? 'Calculating...' : `${availableSlots.length} available`}
                </span>
              </div>

              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-900 dark:border-slate-100 border-t-transparent mb-1" />
                  <p>Calculating genuine availability...</p>
                </div>
              ) : isPastSelectedDate ? (
                <div className="p-4 text-center text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                  <p className="font-semibold flex items-center justify-center gap-1.5 text-rose-800 dark:text-rose-300">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    Back-Dated Booking Prohibited
                  </p>
                  <p className="text-2xs text-rose-600 dark:text-rose-400 mt-1">
                    The selected date ({formatDisplayDate(date)}) is in the past. Please select today or an upcoming clinic working day.
                  </p>
                </div>
              ) : availableSlots.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                  <p className="font-medium text-amber-800 dark:text-amber-300">No working slots available on this date.</p>
                  <p className="text-2xs text-amber-700 dark:text-amber-400 mt-0.5">
                    {selectedDoctor?.name} is only scheduled Monday to Friday (10:00 AM-1:00 PM & 4:00 PM-7:00 PM).
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          id={`slot-btn-${slot.replace(':', '-')}`}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'theme-btn-primary shadow-xs font-bold scale-[1.02]'
                              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                          }`}
                        >
                          {formatTo12Hour(slot)}
                        </button>
                      );
                    })}
                  </div>

                  {bookedSlots.length > 0 && (
                    <p className="text-2xs text-slate-500 dark:text-slate-400 italic">
                      {bookedSlots.length} slot(s) already booked ({bookedSlots.map(formatTo12Hour).join(', ')})
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Patient Name and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Letters only</span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    id="patient-name-input"
                    type="text"
                    required
                    placeholder="e.g. Rohan Gupta"
                    value={patientName}
                    onChange={handleNameChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Patient Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      patientPhone.length === 10
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : patientPhone.length > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {patientPhone.length}/10 digits
                  </span>
                </div>
                <div className="relative flex rounded-lg border border-slate-300 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-slate-400">
                  <div className="flex items-center gap-1 px-2.5 bg-slate-100 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 select-none">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>+91</span>
                  </div>
                  <input
                    id="patient-phone-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    placeholder="9876543210"
                    value={patientPhone}
                    onChange={handlePhoneChange}
                    className="w-full px-3 py-2 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Source */}
            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Booking Channel / Source</label>
              <div className="flex gap-2">
                {(['dashboard', 'api', 'ai_call'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSource(s)}
                    className={`px-2.5 py-1 text-2xs font-mono uppercase rounded-md border transition-all cursor-pointer ${
                      source === s
                        ? 'theme-btn-primary font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                id="cancel-booking-form-btn"
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="submit-create-appointment-btn"
                disabled={submitting || !selectedSlot}
                className={`flex-1 py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                  submitting || !selectedSlot
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                    : 'theme-btn-primary'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirm & Book</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
