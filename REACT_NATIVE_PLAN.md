# 📱 خطة بناء تطبيق Hakeem Jordan — React Native
## نظام إدارة العيادات الذكي | Mobile App Plan

> **تاريخ الخطة:** أبريل 2026  
> **المشروع:** hakeem-jo  
> **التقنية:** Expo + React Native + TypeScript

---

## 🔍 نظرة عامة على التطبيق الحالي

### البنية الحالية (Web)
| الطبقة | التقنية |
|--------|---------|
| Frontend | React + Vite + TypeScript |
| Backend | NestJS + Prisma ORM |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini AI |
| WhatsApp | Baileys API |
| Auth (Doctor) | Supabase Session + JWT |
| Auth (Patient) | JWT → localStorage |

---

## 📋 جرد الواجهات (Web → Mobile)

### واجهة الطبيب
| الشاشة | الملف | الأولوية |
|--------|-------|---------|
| لوحة التحكم | Index.tsx | عالية |
| إدارة المرضى | Index.tsx (Contacts) | عالية |
| جدول المواعيد | AppointmentsCalendar.tsx | عالية |
| تفاصيل المريض | PatientDetails.tsx | عالية |
| إعدادات العيادة | ClinicSettings.tsx | متوسطة |
| بوت واتساب | WhatsAppBot.tsx | متوسطة |
| قوالب الردود | TemplatesManager.tsx | متوسطة |
| الإحصائيات | ClinicStats.tsx | متوسطة |
| المحادثة الداخلية | InternalChat.tsx | متوسطة |
| أطباء العيادة | ClinicDoctors.tsx | منخفضة |
| التحليل المالي | FinancialAnalytics.tsx | منخفضة |
| إعدادات الذكاء الاصطناعي | AISettings.tsx | منخفضة |

### واجهة المريض
| الشاشة | الملف | الأولوية |
|--------|-------|---------|
| تسجيل الدخول/التسجيل | UnifiedAuth.tsx | عالية |
| لوحة تحكم المريض | PatientDashboard.tsx | عالية |
| قائمة العيادات | PatientClinics.tsx | عالية |
| تفاصيل العيادة + الحجز | PatientClinicDetail.tsx | عالية |
| مواعيدي | PatientAppointments.tsx | عالية |
| تفاصيل الموعد | AppointmentDetail.tsx | عالية |
| الإشعارات | PatientNotifications.tsx | متوسطة |
| السجلات الطبية | PatientMedicalRecords.tsx | متوسطة |
| المحادثة مع العيادة | PatientChat.tsx | متوسطة |
| العروض | PatientOffers.tsx | متوسطة |
| الملف الشخصي | PatientProfile.tsx | متوسطة |

---

## 🏗️ هيكل المشروع

```
hakeem-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   ├── (patient)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── clinics/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── appointments/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── notifications.tsx
│   │   ├── medical-records.tsx
│   │   ├── offers.tsx
│   │   ├── chat/[clinicId].tsx
│   │   └── profile.tsx
│   ├── (doctor)/
│   │   ├── _layout.tsx
│   │   ├── dashboard.tsx
│   │   ├── patients/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── appointments/
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx
│   │   ├── analytics.tsx
│   │   ├── settings/
│   │   │   ├── clinic.tsx
│   │   │   ├── ai.tsx
│   │   │   └── templates.tsx
│   │   └── profile.tsx
│   ├── _layout.tsx
│   └── index.tsx
│
├── src/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.api.ts
│   │   ├── patient.api.ts
│   │   ├── appointments.api.ts
│   │   ├── clinics.api.ts
│   │   ├── notifications.api.ts
│   │   ├── medical-records.api.ts
│   │   └── doctor.api.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppHeader.tsx
│   │   │   ├── LoadingScreen.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── Avatar.tsx
│   │   ├── patient/
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── ClinicCard.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   └── OfferCard.tsx
│   │   └── doctor/
│   │       ├── PatientCard.tsx
│   │       ├── StatCard.tsx
│   │       └── ChatBubble.tsx
│   ├── store/
│   │   ├── auth.store.ts
│   │   ├── patient.store.ts
│   │   └── doctor.store.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatientAuth.ts
│   │   ├── useAppointments.ts
│   │   ├── useClinics.ts
│   │   ├── useNotifications.ts
│   │   └── useSocket.ts
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── patient.types.ts
│   │   ├── appointment.types.ts
│   │   ├── clinic.types.ts
│   │   └── api.types.ts
│   └── utils/
│       ├── date.utils.ts
│       ├── storage.ts
│       └── format.utils.ts
│
├── assets/
│   ├── fonts/
│   └── images/
├── app.json
├── package.json
└── tsconfig.json
```

---

## 🛠️ اختيارات التقنيات

| الغرض | الحل | السبب |
|--------|------|-------|
| Framework | Expo SDK 51+ | أسرع تطوير، OTA updates |
| Routing | Expo Router v3 | File-based مثل Next.js |
| Language | TypeScript | متوافق مع الـ web |
| State | Zustand | خفيف وبسيط |
| Server State | TanStack Query v5 | نفس الـ web |
| HTTP | Axios | interceptors للـ token |
| Forms | React Hook Form + Zod | نفس الـ web |
| Real-time | Socket.io Client | إشعارات فورية |
| Storage | Expo SecureStore | آمن لتخزين tokens |
| Push | Expo Notifications | Push Notifications |
| UI | NativeWind | Tailwind CSS لـ RN |
| Animations | Reanimated 3 | animations سلسة |
| Icons | Expo Vector Icons | مكتبة شاملة |
| Calendar | react-native-calendars | تقويم تفاعلي |

---

## 📅 المراحل التفصيلية

### المرحلة 0 — الإعداد (3-4 أيام)
- إنشاء مشروع Expo
- إعداد TypeScript + Expo Router
- إعداد NativeWind
- خط Cairo للعربية
- Axios client + interceptors
- Zustand stores
- TanStack Query
- Expo SecureStore

### المرحلة 1 — المصادقة (3-4 أيام)
شاشات:
- Splash + اختيار نوع المستخدم
- تسجيل دخول مريض: POST /patient/auth/login
- تسجيل مريض: POST /patient/auth/register
- تسجيل دخول طبيب: POST /auth/login

### المرحلة 2 — واجهة المريض Core (7-10 أيام)
- لوحة التحكم
- قائمة العيادات
- تفاصيل عيادة + حجز موعد
- قائمة مواعيدي
- تفاصيل الموعد

### المرحلة 3 — واجهة المريض متقدم (5-7 أيام)
- الإشعارات
- السجلات الطبية
- المحادثة مع العيادة
- العروض
- الملف الشخصي

### المرحلة 4 — واجهة الطبيب Core (7-10 أيام)
- لوحة التحكم
- إدارة المرضى
- تفاصيل المريض
- جدول المواعيد

### المرحلة 5 — واجهة الطبيب متقدم (5-7 أيام)
- إعدادات العيادة
- إعدادات الذكاء الاصطناعي
- قوالب الردود
- الإحصائيات

### المرحلة 6 — الصقل والإنتاج (4-5 أيام)
- Push Notifications
- Skeleton Loaders
- Error Handling
- Offline Detection
- اختبار iOS وAndroid

---

## 📊 جدول زمني

| المرحلة | المدة |
|---------|-------|
| 0 — الإعداد | 3-4 أيام |
| 1 — المصادقة | 3-4 أيام |
| 2 — مريض core | 7-10 أيام |
| 3 — مريض متقدم | 5-7 أيام |
| 4 — طبيب core | 7-10 أيام |
| 5 — طبيب متقدم | 5-7 أيام |
| 6 — الصقل | 4-5 أيام |
| **الإجمالي** | **~6-7 أسابيع** |

---

## 🎨 نظام التصميم

```typescript
// src/theme/colors.ts
export const colors = {
  primary:       '#6C63FF',
  primaryDark:   '#5A52D5',
  secondary:     '#38BDF8',
  background:    '#0F172A',
  surface:       '#1E293B',
  surfaceLight:  '#334155',
  text:          '#F1F5F9',
  textSecondary: '#94A3B8',
  success:       '#10B981',
  warning:       '#F59E0B',
  error:         '#EF4444',
  border:        '#334155',
};
```

```typescript
// RTL — يجب وضعه في app/_layout.tsx
import { I18nManager } from 'react-native';
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}
```

---

## 🔌 API Endpoints الكاملة

### Patient
```
POST   /patient/auth/login
POST   /patient/auth/register
GET    /patient/profile
PUT    /patient/profile
GET    /patient/clinics
GET    /patient/clinics/:id
GET    /patient/appointments
GET    /patient/appointments/upcoming
POST   /patient/appointments
DELETE /patient/appointments/:id
GET    /patient/notifications
GET    /patient/notifications/unread-count
PUT    /patient/notifications/:id/read
GET    /patient/medical-records
GET    /patient/offers
POST   /patient/offers/:id/like
GET    /patient/chat/:clinicId/messages
POST   /patient/chat/:clinicId/messages
```

### Doctor
```
POST   /auth/login
GET    /appointments/stats
GET    /appointments
POST   /appointments
PUT    /appointments/:id
DELETE /appointments/:id
GET    /contacts
GET    /contacts/:id
DELETE /contacts/:id
GET    /whatsapp/settings
PUT    /whatsapp/settings
GET    /templates
POST   /templates
PUT    /templates/:id
DELETE /templates/:id
```

---

## 🚀 أوامر البدء

```powershell
cd C:\Users\TOSHIBA\Desktop
npx create-expo-app hakeem-mobile --template expo-template-blank-typescript
cd hakeem-mobile
npx expo install expo-router expo-secure-store expo-font expo-image expo-notifications
npm install @tanstack/react-query zustand axios react-hook-form zod
npm install nativewind tailwindcss
npx expo start
```

---

## ⚠️ نقاط مهمة

1. **Token Security:** استخدم `Expo SecureStore` بدلاً من `localStorage`
2. **RTL:** فعّل `I18nManager.forceRTL(true)` من أول لحظة
3. **Backend HTTPS:** Ngrok مؤقت فقط — للإنتاج تحتاج سيرفر ثابت مع HTTPS
4. **Code Sharing:** TypeScript types قابلة للمشاركة بين الـ web والـ mobile
