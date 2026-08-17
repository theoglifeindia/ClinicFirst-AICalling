import { Contact, Patient } from '../types/database';
import { StorageAdapter } from './storageAdapter';

export function validatePhoneNumber(phone: string): { valid: boolean; error?: string; cleanPhone?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required.' };
  }

  const trimmed = phone.trim();
  // Strip spaces, dashes, parentheses
  const digitsOnly = trimmed.replace(/[\s\-()]/g, '');

  if (digitsOnly.length < 7 || digitsOnly.length > 16) {
    return { valid: false, error: 'Phone number must contain between 7 and 15 digits.' };
  }

  const phoneRegex = /^(\+?\d{1,4})?[\d\s\-()]{7,16}$/;
  if (!phoneRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid phone number format. Example: +91 9820123456 or +1 555-123-4567.' };
  }

  return { valid: true, cleanPhone: trimmed };
}

export async function getContacts(workspaceId?: string): Promise<Contact[]> {
  return StorageAdapter.getContacts(workspaceId);
}

export async function getContactById(contactId: string, expectedWorkspaceId?: string): Promise<Contact | null> {
  const contact = await StorageAdapter.getContactById(contactId);
  if (!contact) return null;

  if (
    expectedWorkspaceId &&
    contact.workspace_id !== expectedWorkspaceId &&
    (contact as Patient).clinic_id !== expectedWorkspaceId
  ) {
    throw new Error(`UNAUTHORIZED_ACCESS: Contact does not belong to the active workspace (${expectedWorkspaceId}).`);
  }

  return contact;
}

export async function createContact(
  workspaceId: string,
  name: string,
  phone: string,
  email?: string
): Promise<Contact> {
  if (!workspaceId) {
    throw new Error('MISSING_WORKSPACE: Workspace ID is required to create a contact.');
  }
  if (!name || !name.trim()) {
    throw new Error('VALIDATION_ERROR: Contact name is required.');
  }

  const phoneCheck = validatePhoneNumber(phone);
  if (!phoneCheck.valid) {
    throw new Error(`VALIDATION_ERROR: ${phoneCheck.error}`);
  }

  return StorageAdapter.createContact(workspaceId, name.trim(), phoneCheck.cleanPhone!, email?.trim());
}

export async function updateContact(
  contactId: string,
  updates: Partial<Omit<Contact, 'id' | 'workspace_id' | 'created_at'>>,
  expectedWorkspaceId?: string
): Promise<Contact> {
  const contact = await getContactById(contactId, expectedWorkspaceId);
  if (!contact) {
    throw new Error(`CONTACT_NOT_FOUND: Contact with ID ${contactId} not found.`);
  }

  if (updates.phone) {
    const phoneCheck = validatePhoneNumber(updates.phone);
    if (!phoneCheck.valid) {
      throw new Error(`VALIDATION_ERROR: ${phoneCheck.error}`);
    }
    updates.phone = phoneCheck.cleanPhone!;
  }

  return StorageAdapter.updateContact(contactId, updates);
}

export async function deleteContact(contactId: string, expectedWorkspaceId?: string): Promise<boolean> {
  const contact = await getContactById(contactId, expectedWorkspaceId);
  if (!contact) {
    throw new Error(`CONTACT_NOT_FOUND: Contact with ID ${contactId} not found.`);
  }

  return StorageAdapter.deleteContact(contactId);
}
