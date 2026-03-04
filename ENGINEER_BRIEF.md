# HAKEEM — Engineering Brief
> AI-Powered Clinic Management & Booking SaaS | February 2026

---

## 1. What We're Building

A **multi-tenant SaaS** for doctors and clinics in the Arab world with three core user types:

- **Doctor**: Manages their clinic, patients, and appointments via a dashboard.
- **Patient**: Registers, browses clinics, and self-books appointments via a patient portal.
- **AI WhatsApp Bot**: Acts as a smart receptionist per clinic — answers questions and books appointments automatically.

---

## 2. Tech Stack

> ⚠️ **Use PostgreSQL, not MongoDB.** Data is relational by nature (Doctor → Appointment → Patient → MedicalRecord). MongoDB is the wrong tool here.

| Layer | Technology |
|---|---|
| Frontend + API | **Next.js 14** (App Router) |
| Database | **PostgreSQL** via Supabase |
| ORM | **Prisma** |
| Auth | **NextAuth.js v5** (multi-role: Doctor, Patient, Admin) |
| WhatsApp Engine | **@whiskeysockets/baileys** (multi-session, one per doctor) |
| AI | **Google Gemini 1.5 Flash** (best Arabic support, low cost) |
| Realtime | **Supabase Realtime** (instant notifications, no manual WebSocket) |
| File Storage | **Supabase Storage** (logos, PDFs) |
| Job Queue | **BullMQ + Redis** (async message processing, reminders) |
| PDF | **Puppeteer** (prescriptions, reports) |
| Deployment | **Vercel** (Next.js) + **Railway** (WhatsApp server — must be persistent) |

---

## 3. Architecture

```
┌─────────────────────┬──────────────────────┬──────────────────┐
│  Next.js (Vercel)   │  WhatsApp (Railway)  │  Workers (BullMQ)│
│  Doctor Dashboard   │  Baileys Sessions    │  Reminders       │
│  Patient Portal     │  AI Message Handler  │  PDF Generation  │
│  REST API Routes    │  Per-doctor sessions │  Msg Queue       │
└──────────┬──────────┴──────────┬───────────┴──────────────────┘
           └─────────────────────┘
                      │
           ┌──────────▼──────────┐
           │  Supabase           │
           │  PostgreSQL + Realtime + Storage │
           └─────────────────────┘
```

> **Critical**: WhatsApp (Baileys) needs a **persistent Node.js process**. It cannot run in serverless/Vercel. Deploy it separately on Railway or any VPS.

---

## 4. Database Schema (Prisma)

```prisma
model User {              // Doctor / Clinic
  id                  Int       @id @default(autoincrement())
  email               String    @unique
  passwordHash        String
  subscriptionTier    Tier      @default(FREE)
  subscriptionExpiry  DateTime?

  // Clinic Profile
  clinicName          String?
  clinicSpecialty     String?
  clinicAddress       String?
  clinicPhone         String?
  workingHoursStart   String?   // "09:00"
  workingHoursEnd     String?   // "21:00"
  appointmentDuration Int       @default(30)

  // AI Config
  geminiApiKey        String?
  aiSystemPrompt      String?
  aiEnabled           Boolean   @default(false)

  appointments        Appointment[]
  contacts            Contact[]
  services            Service[]
  knowledgeBase       KnowledgeItem[]
  notifications       Notification[]
}

model Patient {           // Portal user (platform-wide)
  id           Int     @id @default(autoincrement())
  email        String  @unique
  passwordHash String
  fullName     String
  phone        String  @unique
  dateOfBirth  DateTime?
  gender       String?
  bloodType    String?
  allergies    String?

  appointments Appointment[]
  notifications PatientNotification[]
}

model Contact {           // WhatsApp/walk-in patient (scoped per doctor)
  id       Int    @id @default(autoincrement())
  doctorId Int
  name     String?
  phone    String
  source   String  @default("whatsapp")
  doctor   User    @relation(fields: [doctorId], references: [id])
  appointments Appointment[]
  @@unique([doctorId, phone])
}

model Appointment {
  id              Int      @id @default(autoincrement())
  doctorId        Int
  patientUserId   Int?     // Portal patient
  contactId       Int?     // WhatsApp / walk-in
  patientName     String
  patientPhone    String
  scheduledAt     DateTime
  durationMinutes Int      @default(30)
  status          Status   @default(PENDING)
  source          Source   @default(MANUAL)
  notes           String?
  confirmedAt     DateTime?
  cancelledAt     DateTime?
  cancellationReason String?

  medicalRecord   MedicalRecord?
  notifications   Notification[]
  patientNotifications PatientNotification[]
}

model MedicalRecord {
  id            Int        @id @default(autoincrement())
  appointmentId Int        @unique
  diagnosis     String?
  treatment     String?
  pdfUrl        String?
  feeAmount     Decimal?
  recordType    RecordType @default(PRESCRIPTION)
}

model KnowledgeItem {     // AI Q&A pairs per doctor
  id       Int    @id @default(autoincrement())
  doctorId Int
  trigger  String
  response String
}

model Notification {      // For doctors
  id            Int      @id @default(autoincrement())
  doctorId      Int
  type          String
  title         String
  message       String
  isRead        Boolean  @default(false)
  appointmentId Int?
  createdAt     DateTime @default(now())
}

model PatientNotification { // For patients
  id            Int      @id @default(autoincrement())
  patientId     Int
  type          String
  title         String
  message       String
  isRead        Boolean  @default(false)
  appointmentId Int?
  createdAt     DateTime @default(now())
}

enum Status     { PENDING CONFIRMED COMPLETED CANCELLED NO_SHOW }
enum Source     { MANUAL BOT PORTAL }
enum Tier       { FREE TRIAL BASIC PRO }
enum RecordType { PRESCRIPTION LAB_REPORT SICK_LEAVE REFERRAL }
```

---

## 5. API Endpoints

### Auth
```
POST /api/auth/doctor/register
POST /api/auth/doctor/login
POST /api/auth/patient/register
POST /api/auth/patient/login
GET  /api/auth/me
```

### Doctor — Clinic & Settings
```
GET|PUT  /api/doctor/profile
PUT      /api/doctor/ai-settings
GET|POST /api/doctor/services
GET|POST /api/doctor/knowledge-base
```

### Appointments (Doctor)
```
GET   /api/appointments               (filters: date, status, source)
POST  /api/appointments               Manual booking
GET   /api/appointments/today
GET   /api/appointments/slots?date=
PATCH /api/appointments/:id/confirm
PATCH /api/appointments/:id/cancel
PATCH /api/appointments/:id/complete
POST  /api/appointments/:id/record    Save diagnosis + treatment
POST  /api/appointments/:id/prescription  Generate PDF
```

### Patient Portal
```
GET    /api/patient/clinics           Browse all registered clinics
GET    /api/patient/clinics/:id       Clinic detail + available slots
POST   /api/patient/appointments      Self-book (status: PENDING)
GET    /api/patient/appointments      My history
DELETE /api/patient/appointments/:id  Cancel
GET    /api/patient/notifications
GET    /api/patient/medical-records
```

### WhatsApp Microservice
```
POST /ws/session/start     Start session → returns QR code
GET  /ws/session/status    Check QR / connected status
POST /ws/session/logout
GET  /ws/chats
POST /ws/send              Manual message from doctor UI
```

---

## 6. AI Bot Flow

```
Patient sends WhatsApp message
        ↓
AI disabled? → Store only, show in chat UI
        ↓
Build context: clinic info + services + Q&A + available slots (real-time) + last 10 messages
        ↓
Call Gemini 1.5 Flash
        ↓
Parse response for: [[BOOK: YYYY-MM-DD | HH:MM | Patient Name | Notes]]
        ├── Tag found + slot available → Create Appointment (CONFIRMED, source: BOT) + notify doctor
        ├── Tag found + slot taken    → Replace tag with apology + suggest alternative
        └── No tag                   → Send plain text reply
```

### AI System Prompt (Template)
```
You are the AI receptionist for "{clinicName}" (Dr. {doctorName}, {specialty}).
Reply in Arabic. Be warm, professional, and concise.

Clinic: {address} | Hours: {workStart}–{workEnd} | Phone: {clinicPhone}
Services: {servicesList}
Q&A Knowledge: {knowledgeBase}

Available slots TODAY ({today}): {todaySlots}
Available slots TOMORROW ({tomorrow}): {tomorrowSlots}
DO NOT suggest any time outside these lists.

Booking Protocol:
1. Ask for patient's full name if not known.
2. Once name + time confirmed, append this tag on its own line:
   [[BOOK: YYYY-MM-DD | HH:MM | Full Name | Notes]]
3. Use 24-hour format in the tag.
4. The tag IS the confirmation — do not ask again.

Custom instructions: {aiSystemPrompt}
Current time: {now}
```

---

## 7. Booking Rules

| Source | Auto-Status | Reason |
|---|---|---|
| **AI WhatsApp Bot** | `CONFIRMED` | AI verified slot availability before booking |
| **Patient Portal** | `PENDING` | Requires doctor review and confirmation |
| **Doctor (Manual)** | `CONFIRMED` | Doctor is doing it themselves |

---

## 8. Slot Availability Logic

```typescript
async function getAvailableSlots(doctorId, date) {
  const { workingHoursStart, workingHoursEnd, appointmentDuration } = await getDoctor(doctorId);
  const allSlots = generateSlots(workingHoursStart, workingHoursEnd, appointmentDuration, date);
  const existing = await getAppointmentsForDay(doctorId, date); // exclude CANCELLED, NO_SHOW

  return allSlots.filter(slot => {
    const slotEnd = slot + appointmentDuration;
    return !existing.some(apt => slot < apt.end && slotEnd > apt.start); // no overlap
  });
}
```

---

## 9. Realtime Notifications

Using Supabase Realtime — no manual WebSocket needed:

```typescript
// Doctor
supabase.channel('doctor-notifs')
  .on('postgres_changes', { table: 'Notification', filter: `doctorId=eq.${id}` }, showAlert)
  .subscribe();

// Patient
supabase.channel('patient-notifs')
  .on('postgres_changes', { table: 'PatientNotification', filter: `patientId=eq.${id}` }, showAlert)
  .subscribe();
```

---

## 10. Subscription Tiers

| Tier | Price | Appointments/mo | AI Bot |
|---|---|---|---|
| FREE | $0 | 30 | ❌ |
| TRIAL | $0 (14 days) | Unlimited | ✅ |
| BASIC | $19 | 200 | ✅ |
| PRO | $49 | Unlimited | ✅ |

Implement a `SubscriptionGuard` that checks `user.subscriptionTier` and `user.subscriptionExpiry` on every protected route.

---

## 11. Key Design Decisions

| Decision | Why |
|---|---|
| PostgreSQL over MongoDB | Relational data model requires JOINs; MongoDB would add complexity with no benefit |
| Next.js over React+Express | One monorepo, SSR for SEO on public clinic pages, fewer deployments |
| WhatsApp as separate service | Baileys needs a persistent process; can't run in serverless |
| BullMQ for messages | Async processing prevents blocking; enables retries and rate limiting |
| `Contact` ≠ `Patient` | Contact = per-doctor (WhatsApp). Patient = platform-wide (portal). Link by phone number. |
| Supabase Realtime | Eliminates need to build/maintain a WebSocket server |

---

## 12. Environment Variables

```bash
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://yourdomain.com"
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
WHATSAPP_SERVICE_URL="https://your-wa-server.railway.app"
WHATSAPP_INTERNAL_SECRET="..."
REDIS_URL="rediss://..."
```

---

## 13. Estimated Timeline (Solo Senior Dev)

| Phase | Work | Time |
|---|---|---|
| 1 | DB schema, auth, clinic profile | 1 week |
| 2 | Appointments CRUD + slot algorithm | 1 week |
| 3 | Patient portal (browse + book + notifications) | 1 week |
| 4 | WhatsApp microservice + chat UI | 1 week |
| 5 | AI bot integration + booking automation | 1 week |
| 6 | PDF generation + subscriptions + admin | 1 week |
| 7 | Testing + deployment + QA | 1 week |
| **Total** | | **~7 weeks** |

---

## 14. Open Questions Before Starting

1. **Payment gateway**: Stripe (global) or Tap Payments (MENA)?
2. **Doctor verification**: Require admin approval before going live?
3. **Mobile app**: Web-only or React Native needed for patients?
4. **Languages**: Arabic-only UI or Arabic + English?
5. **Reminders**: WhatsApp, SMS, email, or all three?
6. **WhatsApp disclaimer**: Inform doctors this uses WhatsApp Web (unofficial) — risk of ban on mass messaging.
