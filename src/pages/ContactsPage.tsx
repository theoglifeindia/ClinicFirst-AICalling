import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  Phone,
  Mail,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { Contact } from '../types/database';
import { useWorkspace } from '../context/WorkspaceContext';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  validatePhoneNumber,
} from '../services/contactService';

interface ContactsPageProps {
  onStartCallWithContact: (contactId: string) => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({ onStartCallWithContact }) => {
  const { currentWorkspace, currentWorkspaceId } = useWorkspace();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const loadContactsList = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getContacts(currentWorkspaceId);
      setContacts(list);
    } catch (err) {
      console.error('Failed to load contacts', err);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    loadContactsList();
  }, [loadContactsList]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      phone: '+91 ',
      email: '',
      status: 'active',
    });
    setFormError(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      status: contact.status || 'active',
    });
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Contact name is required.');
      return;
    }

    const phoneCheck = validatePhoneNumber(formData.phone);
    if (!phoneCheck.valid) {
      setFormError(phoneCheck.error || 'Invalid phone number format.');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);

      if (editingContact) {
        await updateContact(
          editingContact.id,
          {
            name: formData.name.trim(),
            phone: phoneCheck.cleanPhone!,
            email: formData.email.trim() || undefined,
            status: formData.status,
          },
          currentWorkspaceId
        );
        setEditingContact(null);
      } else {
        await createContact(
          currentWorkspaceId,
          formData.name.trim(),
          phoneCheck.cleanPhone!,
          formData.email.trim() || undefined
        );
        setShowCreateModal(false);
      }

      await loadContactsList();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save contact.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingContact) return;
    try {
      await deleteContact(deletingContact.id, currentWorkspaceId);
      setDeletingContact(null);
      await loadContactsList();
    } catch (err) {
      console.error('Failed to delete contact', err);
    }
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-[#1C2E4C] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-[#FAF8F3] text-[#C43D27] border border-[#F2C4BC] dark:bg-[#C43D27]/20 dark:text-[#F2C4BC] dark:border-[#C43D27]/40">
              WORKSPACE: {currentWorkspace.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {contacts.length} Contact{contacts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Patients & Contacts Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Manage recipient contact numbers, verified medical records, and initiate outbound automated voice calls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="add-contact-btn"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Contact</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search contacts by name, phone (+91...), or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white dark:bg-[#101F3D] border border-slate-200 dark:border-[#1C2E4C] text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
          />
        </div>
      </div>

      {/* Contacts Table / Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 font-medium">
          <div className="w-7 h-7 border-2 border-[#C43D27] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading contacts directory...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-12 text-center border border-slate-200 dark:border-[#1C2E4C] shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No contacts in this workspace</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Add recipient contact numbers to initiate automated voice reminders, patient outreach, or scheduled consultation confirmations.
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C43D27] text-white rounded-xl text-xs font-bold hover:bg-[#B03420] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Contact</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#101F3D] rounded-3xl border border-slate-200 dark:border-[#1C2E4C] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] dark:bg-[#172B52] border-b border-slate-200 dark:border-[#243B53] text-slate-700 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">Contact Name</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1C2E4C]">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    id={`contact-row-${contact.id}`}
                    className="hover:bg-slate-50 dark:hover:bg-[#1C2E4C]/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#FAF8F3] dark:bg-[#172B52] text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-[#243B53]">
                          {contact.name.charAt(0)}
                        </div>
                        <span>{contact.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{contact.phone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                      {contact.email ? (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ACTIVE
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onStartCallWithContact(contact.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C43D27] hover:bg-[#B03420] text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                          title="Start Call to this Contact"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </button>
                        <button
                          onClick={() => handleOpenEdit(contact)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172B52] transition-colors cursor-pointer"
                          title="Edit Contact"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingContact(contact)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete Contact"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Contact Modal */}
      {(showCreateModal || editingContact) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1C2E4C] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C43D27]/10 dark:bg-[#C43D27]/20 text-[#C43D27] dark:text-[#E05A44] flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Workspace: <strong className="text-slate-800 dark:text-slate-200">{currentWorkspace.name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingContact(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-900">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Contact / Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Mehta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (with Country Code) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 9820123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] font-mono text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
                <p className="text-2xs text-slate-400 mt-1 font-mono">
                  Supported formats: +91 9820123456, +1 555-123-4567 (7-15 digits)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="patient@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#243B53] bg-[#FAF8F3] dark:bg-[#172B52] text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-[#C43D27]"
                />
              </div>

              <div className="pt-2 flex items-center gap-2.5 border-t border-slate-100 dark:border-[#1C2E4C]">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingContact(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-[#C43D27] hover:bg-[#B03420] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingContact ? 'Update Contact' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101F3D] rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-[#1C2E4C] shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Contact?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Are you sure you want to delete <strong>{deletingContact.name}</strong> ({deletingContact.phone})?
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setDeletingContact(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#172B52] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Delete Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
