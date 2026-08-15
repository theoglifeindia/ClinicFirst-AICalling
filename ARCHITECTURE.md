# Clinic AI Platform — Product Architecture & Roadmap

This document defines the architectural blueprint for scaling from the core appointment engine (Step 1) into a multi-agent clinic communication platform without breaking core business logic.

---

## 🏛️ Layered System Architecture

```
                    COMMUNICATION CHANNELS
      (Browser Voice | Indian Telephony Exotel | WhatsApp | SMS)
                               │
                               ▼
                    CLINIC ORCHESTRATION LAYER
      ┌────────────────────────┬────────────────────────┐
      │                        │                        │
   AI AGENTS               WORKFLOWS                CAMPAIGNS
  (Receptionist,          (Triggers,               (Reminders,
   Reminders,              Delays,                  Recall,
   Information)            Branches)                Feedback)
      │                        │                        │
      └────────────────────────┼────────────────────────┘
                               │
                               ▼
                    CORE APPOINTMENT ENGINE
             (The authoritative business logic layer)
      ┌────────────────────────┬────────────────────────┐
      │                        │                        │
  PATIENTS & CONTACTS     SCHEDULING & SLOTS       KNOWLEDGE BASE
 (Phone index, prefs)     (Conflict checks,       (Clinic FAQs,
                           Doctor shifts)          Doctor profiles)
                               │
                               ▼
                   DATABASE & STORAGE LAYER
            (PostgreSQL / Supabase + Partial Indexes)
```

---

## 🔒 Core Invariant: Separation of Concerns

1. **Appointment Engine is Authoritative**:
   - Voice, Telephony, WhatsApp, and AI Agents are **communication channels**, not owners of business logic.
   - All booking, rescheduling, cancellation, and slot inquiries MUST route through `getAvailableSlots()`, `createAppointment()`, and `cancelAppointment()`.
   - Never duplicate slot math or booking constraints inside agent prompts or workflow nodes.

2. **Extensibility Points for Future Modules**:
   - `Appointment`: supports `source: 'dashboard' | 'api' | 'ai_call'` and optional `agent_id`, `call_id`, or `campaign_id` metadata.
   - `Patient`: phone-indexed master entity ready to link interaction logs and communication history.
   - `DoctorAvailability`: supports multi-doctor schedules and variable slot durations.

---

## 🗺️ Progressive Phased Roadmap

| Phase | Milestone | Focus Area |
|---|---|---|
| **Step 1 (Current)** | **Core Booking Engine** | Doctor shifts, slot math, double-booking prevention, acceptance tests. |
| **Phase 2** | **AI Receptionist Agent** | LLM tool-calling bindings to `getAvailableSlots` & `createAppointment`. |
| **Phase 3** | **Voice & Telephony** | WebRTC browser voice followed by Indian Telephony (Exotel) adapter. |
| **Phase 4** | **Messaging & Confirmations** | WhatsApp & SMS booking confirmations and calendar invites. |
| **Phase 5** | **Knowledge Base** | Clinic-isolated FAQs, doctor fees, and service directories for AI context. |
| **Phase 6** | **Test Center** | Scenario simulator for voice/text agent regression testing. |
| **Phase 7** | **Workflows & Automation** | Event-driven appointment triggers, reminders, and follow-up sequences. |
| **Phase 8** | **Outbound Campaigns** | Automated reminder, recall, and feedback voice/WhatsApp calls. |
| **Phase 9** | **Multi-Agent Squads** | Agent delegation (Reception → Information → Reminder). |
| **Phase 10** | **Integrations & Analytics** | HMS/EMR adapters, Google Calendar sync, and call analytics. |
