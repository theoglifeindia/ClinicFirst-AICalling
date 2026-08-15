import React, { useState, useEffect, useCallback } from 'react';
import { AppLayout, AppTab } from './components/layout/AppLayout';
import { BookingModal } from './components/BookingModal';
import { BrandFooter } from './components/brand/BrandFooter';
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { PatientsPage } from './pages/PatientsPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { TestSuitePage } from './pages/TestSuitePage';
import { DatabaseSchemaPage } from './pages/DatabaseSchemaPage';
import { HelpPage } from './pages/public/Help';
import { ContactPage } from './pages/public/Contact';
import { AboutPage } from './pages/public/About';

import { Doctor, AppointmentWithDetails, AppointmentStatus } from './types/database';
import { getDoctors } from './services/doctorService';
import {
  getAppointments,
  cancelAppointment,
  updateAppointmentStatus,
} from './services/appointmentService';
import { localDb } from './services/storageAdapter';
import { getDateStringOffset } from './utils/timeUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [modalDoctorId, setModalDoctorId] = useState<string | undefined>(undefined);
  const [modalDate, setModalDate] = useState<string | undefined>(undefined);
  const [modalTime, setModalTime] = useState<string | undefined>(undefined);

  // Today ISO Date string (YYYY-MM-DD)
  const todayStr = getDateStringOffset(0);

  // Load doctors and appointments
  const refreshData = useCallback(async () => {
    try {
      const [docs, apts] = await Promise.all([getDoctors(), getAppointments()]);
      setDoctors(docs);
      setAppointments(apts);
    } catch (err) {
      console.error('Failed to load clinic data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
    // Subscribe to local storage changes so tests and bookings trigger immediate UI updates
    const unsubscribe = localDb.subscribe(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Open booking modal helper
  const handleOpenBooking = (doctorId?: string, date?: string, slot?: string) => {
    setModalDoctorId(doctorId || doctors[0]?.id);
    setModalDate(date || todayStr);
    setModalTime(slot || '');
    setIsBookingOpen(true);
  };

  // Cancel appointment helper
  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment(appointmentId);
      await refreshData();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
    }
  };

  // Update status helper
  const handleUpdateStatus = async (appointmentId: string, status: AppointmentStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      await refreshData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onOpenBooking={() => handleOpenBooking()}
    >
      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#008768] dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Booting CLINICFIRST Engine...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {activeTab === 'dashboard' && (
            <DashboardPage
              doctors={doctors}
              appointments={appointments}
              todayStr={todayStr}
              onOpenBooking={handleOpenBooking}
              onCancelAppointment={handleCancelAppointment}
              onNavigateToTab={(tab) => setActiveTab(tab as AppTab)}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsPage
              doctors={doctors}
              appointments={appointments}
              onOpenBooking={() => handleOpenBooking()}
              onCancelAppointment={handleCancelAppointment}
              onUpdateStatus={handleUpdateStatus}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'doctors' && (
            <DoctorsPage
              doctors={doctors}
              onOpenBooking={(docId) => handleOpenBooking(docId)}
              onExploreAvailability={(docId) => {
                setModalDoctorId(docId);
                setActiveTab('availability');
              }}
            />
          )}

          {activeTab === 'patients' && (
            <PatientsPage
              appointments={appointments}
              onOpenBooking={(docId, date, slot) => handleOpenBooking(docId, date, slot)}
            />
          )}

          {activeTab === 'availability' && (
            <AvailabilityPage
              doctors={doctors}
              initialDoctorId={modalDoctorId}
              onBookSlot={(docId, date, slot) => handleOpenBooking(docId, date, slot)}
            />
          )}

          {activeTab === 'testsuite' && (
            <TestSuitePage onResetDatabase={refreshData} />
          )}

          {activeTab === 'schema' && <DatabaseSchemaPage />}

          {activeTab === 'help' && (
            <HelpPage
              onNavigateToBooking={() => handleOpenBooking()}
              onNavigateToTab={(tab) => setActiveTab(tab as AppTab)}
            />
          )}

          {activeTab === 'contact' && <ContactPage />}

          {activeTab === 'about' && (
            <AboutPage
              onNavigateToBooking={() => handleOpenBooking()}
              onNavigateToTab={(tab) => setActiveTab(tab as AppTab)}
            />
          )}

          {/* Minimal functional footer */}
          <BrandFooter onNavigate={(tab) => setActiveTab(tab as AppTab)} />
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        doctors={doctors}
        initialDoctorId={modalDoctorId}
        initialDate={modalDate}
        initialTime={modalTime}
        onBookingSuccess={() => {
          refreshData();
        }}
      />
    </AppLayout>
  );
}
