import React from 'react';
import {
  Clock,
  PhoneCall,
  MessageSquare,
  Users,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HeartHandshake,
  Stethoscope,
} from 'lucide-react';
import { ClinicFirstLogo } from '../../components/brand/ClinicFirstLogo';

interface AboutPageProps {
  onNavigateToBooking?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateToBooking, onNavigateToTab }) => {
  const pillars = [
    {
      icon: Clock,
      title: 'Respond to Patients Faster',
      description:
        'Patients calling during rush hours get instant, automated responses rather than endless busy signals or unanswered rings.',
    },
    {
      icon: PhoneCall,
      title: 'Reduce Missed Appointment Calls',
      description:
        'Capture appointment inquiries even during off-hours, peak OPD crowds, and when front-desk staff are attending to in-person patients.',
    },
    {
      icon: MessageSquare,
      title: 'Automate Repetitive Communication',
      description:
        'Routine questions regarding clinic timings, doctor availability, appointment cancellations, and doctor fees are answered accurately.',
    },
    {
      icon: Users,
      title: 'Give Clinic Staff More Time',
      description:
        'Free receptionists and healthcare assistants from phone fatigue so they can focus on in-clinic patient care and clinical operations.',
    },
    {
      icon: HeartHandshake,
      title: 'Improve the Patient Experience',
      description:
        'Provide seamless booking in English, Hindi, and regional languages with instant WhatsApp confirmations and scheduled reminders.',
    },
    {
      icon: ShieldCheck,
      title: 'Built on Reliable Scheduling Architecture',
      description:
        'Every booking is protected by an ACID-compliant concurrency engine that guarantees zero overlapping or double-booked slots.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-[#003865] via-[#005080] to-[#008768] dark:from-[#0B1C2D] dark:via-[#092B3A] dark:to-[#09352A] text-white rounded-3xl p-8 sm:p-14 relative overflow-hidden shadow-md border border-slate-700/50 dark:border-slate-800 transition-colors">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl">
          <div className="mb-6">
            <ClinicFirstLogo size="lg" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Technology that puts clinics first.
          </h1>
          <p className="text-base sm:text-lg text-cyan-100 dark:text-slate-200 mt-4 leading-relaxed max-w-2xl">
            CLINICFIRST is an AI reception and patient communication platform built specifically for Indian doctors, specialists, and modern clinics.
          </p>
        </div>
      </div>

      {/* Mission & Purpose */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xs transition-colors">
        <div className="max-w-3xl">
          <span className="text-xs font-bold font-mono text-[#008768] dark:text-emerald-400 uppercase tracking-wider">
            Our Purpose
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Bridging the Communication Gap in Indian Outpatient Clinics
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mt-4">
            Indian clinics handle hundreds of patient inquiries every single day. Reception desks struggle to balance in-person patient registration, payments, doctor coordination, and constantly ringing landlines.
          </p>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mt-3">
            CLINICFIRST was conceived to solve this specific operational bottleneck. By combining a reliable doctor availability engine with conversational AI, clinics can deliver 24/7 patient support without increasing administrative burden.
          </p>
        </div>
      </div>

      {/* 6 Key Pillars */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Why Modern Clinics Choose CLINICFIRST</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Practical operational efficiency engineered for healthcare workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#008768] dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{pillar.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">{pillar.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Disclaimer & Trust */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-4 transition-colors">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">Healthcare Scope & Boundaries</h4>
          <p>
            CLINICFIRST is an administrative, communication, and scheduling platform. It does not provide medical diagnoses, clinical triage advice, or replace direct physician consultations. All medical assessments and treatments remain the sole responsibility of licensed medical practitioners.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-[#003865] to-[#008768] dark:from-[#0B1C2D] dark:to-[#09352A] rounded-2xl p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-xs border border-slate-700/50 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white">Ready to test the Appointment & Concurrency Engine?</h3>
          <p className="text-xs text-cyan-100 dark:text-slate-300 mt-1">Explore real-time slot generation, double-booking rejection, and calendar management.</p>
        </div>
        {onNavigateToBooking && (
          <button
            onClick={onNavigateToBooking}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-[#003865] font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Launch Clinic Portal
          </button>
        )}
      </div>
    </div>
  );
};
