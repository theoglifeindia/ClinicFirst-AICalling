import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Bot,
  Calendar,
  MessageSquare,
  Shield,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HelpPageProps {
  onNavigateToBooking?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const HelpPage: React.FC<HelpPageProps> = ({ onNavigateToBooking, onNavigateToTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const categories = [
    {
      id: 'getting-started',
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Setting up your clinic profile, adding doctor shifts, and basic appointment workflows.',
      badge: 'Active Foundation',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      articles: [
        'Setting up your clinic and operating timezone (Asia/Kolkata)',
        'Adding doctors, specialties, and active statuses',
        'Configuring morning/evening shift windows and slot durations',
        'Creating manual and walk-in patient appointments',
      ],
    },
    {
      id: 'ai-receptionist',
      icon: Bot,
      title: 'AI Receptionist',
      description: 'How AI voice & conversational agents interact with callers and schedule appointments.',
      badge: 'Coming Soon (Phase 2)',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      articles: [
        'How AI reception verifies real-time slot availability',
        'Configuring agent conversation guidelines and triage rules',
        'Handling patient rescheduling, cancellations, and clinic queries',
        'Human transfer and emergency escalation protocols',
      ],
    },
    {
      id: 'appointments',
      icon: Calendar,
      title: 'Appointments & Engine',
      description: 'Slot calculation logic, double-booking prevention, and lifecycle state management.',
      badge: 'Active Foundation',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      articles: [
        'How CLINICFIRST guarantees zero double bookings (ACID Index)',
        'Cancelling an appointment and instant slot restoration',
        'Slot interval calculation with custom consultation lengths',
        'Filtering and exporting appointment records',
      ],
    },
    {
      id: 'patient-communication',
      icon: MessageSquare,
      title: 'Patient Communication',
      description: 'Automated SMS, WhatsApp booking confirmations, and appointment reminders.',
      badge: 'Coming Soon (Phase 4)',
      badgeColor: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      articles: [
        'Instant WhatsApp confirmation templates for Indian clinics',
        'SMS reminder scheduling (24 hours and 2 hours prior)',
        'Patient language preferences (Hindi, English, Marathi, Hinglish)',
        'Managing patient opt-outs and communication logs',
      ],
    },
    {
      id: 'account-security',
      icon: Shield,
      title: 'Account & Security',
      description: 'Data security, strict multi-tenant isolation, and privacy compliance.',
      badge: 'Active Foundation',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      articles: [
        'Clinic data isolation: one clinic never accesses another’s data',
        'Patient contact data encryption and access controls',
        'PostgreSQL database persistence and automated backups',
        'Role-based staff permissions and audit logging',
      ],
    },
  ];

  const faqs = [
    {
      question: 'How does CLINICFIRST prevent double-booking when multiple patients book at once?',
      answer:
        'CLINICFIRST enforces concurrency safety at both application and database levels. A PostgreSQL partial unique constraint (idx_appointments_unique_active_slot) strictly forbids two active records for the same doctor, date, and start_time. If two callers request the same 4:00 PM slot simultaneously, one transaction confirms while the other receives an instant atomic rejection.',
    },
    {
      question: 'What happens when an appointment is cancelled?',
      answer:
        'When an appointment is cancelled, its status updates to "cancelled". Because our database uniqueness constraint only applies to active slots (status != "cancelled"), the slot is immediately released and restored to available inventory for online callers, voice agents, and front-desk staff.',
    },
    {
      question: 'Will CLINICFIRST support regional Indian languages for voice calls?',
      answer:
        'Yes. In the upcoming Voice & AI Telephony phase, CLINICFIRST will support Hindi, English, Hinglish, Marathi, Gujarati, and Tamil speech models tuned for Indian clinical terms and patient colloquialisms.',
    },
    {
      question: 'Is patient data shared or used to train public AI models?',
      answer:
        'No. Every clinic’s database, patient list, and appointment records are strictly isolated. No patient health or personal contact data is ever used to train generic external AI models.',
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#003865] via-[#005080] to-[#008768] dark:from-[#0B1C2D] dark:via-[#092B3A] dark:to-[#09352A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-md border border-slate-700/50 dark:border-slate-800 transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-white/90 border border-white/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>Knowledge Base & Support</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            CLINICFIRST Help Center
          </h1>
          <p className="text-sm sm:text-base text-cyan-100 dark:text-slate-200 mt-2 leading-relaxed">
            How can we help your clinic run smoother? Search our guides, FAQs, and integration documentation.
          </p>

          {/* Search Input */}
          <div className="mt-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search help topics (e.g. shifts, cancellation, double-booking)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-md"
            />
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Help Topics & Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#008768] dark:text-emerald-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-2xs font-mono font-semibold border ${cat.badgeColor}`}>
                      {cat.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{cat.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{cat.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                    {cat.articles.map((art, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-[#008768] dark:hover:text-emerald-400 cursor-pointer">
                        <span className="text-[#008768] dark:text-emerald-400 font-bold">•</span>
                        <span>{art}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs transition-colors">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Key architectural and operational questions from doctors and clinic operators
          </p>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white pr-4">
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
