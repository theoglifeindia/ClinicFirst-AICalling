import { Doctor, DoctorAvailability } from '../types/database';
import { StorageAdapter } from './storageAdapter';

/**
 * Doctor Service
 * Provides functions to fetch active doctors and their configured weekly availability schedules.
 */
export async function getDoctors(clinicId?: string): Promise<Doctor[]> {
  return await StorageAdapter.getDoctors(clinicId);
}

export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  return await StorageAdapter.getDoctorById(doctorId);
}

export async function getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
  return await StorageAdapter.getDoctorAvailability(doctorId);
}
