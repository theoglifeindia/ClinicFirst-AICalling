import { Patient } from '../types/database';
import { StorageAdapter } from './storageAdapter';

/**
 * Patient Service
 * Handles patient lookup, creation, and reuse.
 */
export async function createPatient(
  clinicId: string,
  name: string,
  phone: string
): Promise<Patient> {
  if (!clinicId) {
    throw new Error('clinicId is required to create or get a patient');
  }
  if (!name || name.trim().length === 0) {
    throw new Error('Patient name is required');
  }
  if (!phone || phone.trim().length === 0) {
    throw new Error('Patient phone number is required');
  }

  return await StorageAdapter.createPatient(clinicId, name, phone);
}

export async function getPatientByPhone(
  clinicId: string,
  phone: string
): Promise<Patient | null> {
  return await StorageAdapter.findPatientByPhone(clinicId, phone);
}

export async function getPatients(clinicId?: string): Promise<Patient[]> {
  return await StorageAdapter.getPatients(clinicId);
}
