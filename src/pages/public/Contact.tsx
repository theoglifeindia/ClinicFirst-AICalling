import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Building2,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Headphones,
  Handshake,
  ShieldCheck,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    email: '',
    phone: '',
    subject: 'Sales Enquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      clinicName: '',
      email: '',
      phone: '',
      subject: 'Sales Enquiry',
      message: '',
    });
    setSubmitted(false);
  };

  return (
    <div className="space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#003865] via-[#005080] to-[#008768] dark:from-[#0B1C2D] dark:via-[#092B3A] dark:to-[#09352A] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-md border border-slate-700/50 dark:border-slate-800 transition-colors">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-white/90 border border-white/20 mb-4">
            <Mail className="w-3.5 h-3.5 text-emerald-300" />
            <span>Clinic Inquiries</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Contact CLINICFIRST
          </h1>
          <p className="text-sm sm:text-base text-cyan-100 dark:text-slate-200 mt-2 leading-relaxed">
            Have a question or need help setting up your clinic? Our team is dedicated to supporting doctors and healthcare practices across India.
          </p>
        </div>
      </div>

      {/* 3 Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sales */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#008768] dark:text-emerald-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinic Sales & Demos</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              For doctors, multi-specialty clinics, and OPD centres evaluating AI receptionist & booking capabilities.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
            sales@clinicfirst.in
          </div>
        </div>

        {/* Support */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-4">
              <Headphones className="w-5 h-5 text-[#003865] dark:text-sky-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Clinic Support</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              For active clinics needing assistance with doctor shift setups, availability adjustments, or troubleshooting.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
            support@clinicfirst.in
          </div>
        </div>

        {/* Partnership */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center mb-4">
              <Handshake className="w-5 h-5 text-[#008768] dark:text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Partnerships & Telephony</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              For HMS/EMR vendors, telecom providers (Exotel/Airtel), and healthcare network integrators.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-600 dark:text-slate-300">
            partners@clinicfirst.in
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs max-w-3xl mx-auto transition-colors">
        <div className="text-center max-w-md mx-auto mb-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Send us a Message</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill out the details below and a healthcare representative will respond within 24 business hours.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-white">Inquiry Received Successfully</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 max-w-md mx-auto">
                Thank you for contacting CLINICFIRST, {formData.name || 'Doctor'}. Our team will review your inquiry regarding{' '}
                <span className="font-semibold">{formData.clinicName || 'your clinic'}</span> and connect with you at{' '}
                <span className="font-mono">{formData.email || formData.phone}</span>.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Send Another Message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Rajesh Mehra"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008768] dark:focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinic / Hospital Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Apollo Clinic / Mehra Eye Care"
                  value={formData.clinicName}
                  onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008768] dark:focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rajesh@ehr.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008768] dark:focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008768] dark:focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Inquiry Type</label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008768] dark:focus:ring-emerald-500"
              >
                <option value="Sales Enquiry">Book a Product Demo (AI Reception & Telephony)</option>
                <option value="Integration Support">HMS / EMR API Integration</option>
                <option value="Custom Availability Rules">Custom Doctor Shift Rules</option>
                <option value="General Feedback">General Feedback & Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Message or Requirement</label>
              <textarea
                rows={4}
                placeholder="Describe your clinic's OPD volume, number of practicing doctors, or telephony requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008768] dark:focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#008768] hover:bg-[#007055] active:bg-[#005842] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Clinic Inquiry</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
