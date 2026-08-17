import { Doctor, DoctorAvailability } from '../types/database';
import { StorageAdapter } from './storageAdapter';

/**
 * Doctor Service
 * Provides functions to fetch active doctors and their configured weekly availability schedules.
 */
export async function getDoctors(clinicId?: string): Promise<Doctor[]> {
  return await StorageAdapter.getDoctors(clinicId);
}

export async function getAllDoctorsForClinic(clinicId?: string): Promise<Doctor[]> {
  return await StorageAdapter.getAllDoctorsForClinic(clinicId);
}

export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  return await StorageAdapter.getDoctorById(doctorId);
}

export async function getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
  return await StorageAdapter.getDoctorAvailability(doctorId);
}

export async function createDoctor(
  doctorData: Omit<Doctor, 'id' | 'created_at'>,
  shiftsConfig?: {
    morningStart?: string;
    morningEnd?: string;
    eveningStart?: string;
    eveningEnd?: string;
    slotDurationMinutes?: number;
    workingDays?: number[];
  }
): Promise<Doctor> {
  return await StorageAdapter.createDoctor(doctorData, shiftsConfig);
}

export async function deleteDoctor(doctorId: string): Promise<boolean> {
  return await StorageAdapter.deleteDoctor(doctorId);
}
