# 📋 خطة عمل تطبيق حكيم موبايل — WORK_PLAN.md
> آخر تحديث: يونيو 2026 | الهدف: مطابقة كاملة لنسخة الويب

---

## 📊 تقييم الوضع الحالي

| الشاشة | الحالة | الملاحظة |
|--------|--------|----------|
| لوحة الطبيب | ✅ مكتمل | إحصائيات + إجراءات سريعة |
| تفاصيل موعد الطبيب | ✅ مكتمل | تأكيد + إلغاء + إتمام + وصفة |
| شاشة الإشعارات | ✅ مكتمل | قراءة + تحديد كمقروء |
| السجلات الطبية | ✅ مكتمل | فلترة + عرض |
| العروض | ✅ مكتمل | إعجاب + عرض |
| المحادثة (غرفة) | ✅ مكتمل | إرسال + polling |
| تفاصيل العيادة | ✅ مكتمل | حجز + تقويم + slots |
| الملف الشخصي للمريض | ⚠️ وهمي | handleSave لا يحفظ فعلياً |
| التحليل المالي | ⚠️ وهمي | MOCK_TRANSACTIONS ثابتة |
| صرف الوصفة (صيدلية) | ⚠️ وهمي | setTimeout بدل API |
| Slots الحجز | ⚠️ وهمي | MOCK_SLOTS ثابتة |
| وقت الإشعارات | ⚠️ خطأ | يعرض "منذ قليل" دائماً |
| قائمة المحادثات | ⚠️ وهمي | MOCK_CHATS ثابتة |
| تفاصيل السجل الطبي | ❌ غائب | الزر موجود لكن الشاشة لا |
| تقييم الطبيب بعد الموعد | ❌ غائب | موجود في الويب |
| إلغاء الموعد مع سبب | ⚠️ جزئي | بدون حقل السبب |
| تفاصيل المريض (طبيب) | ⚠️ جزئي | يحتاج سجلات طبية |
| إعدادات العيادة | ❌ غائب | ساعات العمل + بيانات |
| إعدادات الصيدلية | ❌ غائب | |
| Badge الإشعارات في TabBar | ❌ غائب | |
| WebSocket للمحادثة | ❌ غائب | يستخدم polling |
| Push Notifications | ❌ غائب | |

---

## 🔴 المرحلة 1 — إصلاح الأخطاء الحرجة (أولوية قصوى)

### ✅ 1.1 — Slots حقيقية من API
- **الملف:** `app/(patient)/clinics/[id].tsx`
- **المشكلة:** `MOCK_SLOTS` ثابتة لا تجلب من API
- **الحل:** استدعاء `GET /patient/clinics/[id]/available-slots?date=...` عند تغيير اليوم
- **الحالة:** [x] ✅ منجز

### ✅ 1.2 — حفظ بيانات الملف الشخصي للمريض
- **الملف:** `app/(patient)/profile/index.tsx`
- **المشكلة:** `handleSave` يستخدم `setTimeout` وهمي
- **الحل:** ربط بـ `PUT /patient/profile` + إضافة `patient.api.ts`
- **الحالة:** [x] ✅ منجز

### ✅ 1.3 — التحليل المالي بيانات حقيقية
- **الملف:** `app/(doctor)/financial/index.tsx`
- **المشكلة:** `MOCK_TRANSACTIONS` ثابتة
- **الحل:** جلب من `GET /financial/summary?period=day|week|month`
- **الحالة:** [x] ✅ منجز

### ✅ 1.4 — صرف الوصفة في الصيدلية بيانات حقيقية
- **الملف:** `app/(pharmacy)/prescriptions/[id].tsx`
- **المشكلة:** `setTimeout` وهمي بدل API
- **الحل:** ربط بـ `PUT /pharmacy/prescriptions/[id]/dispense` + إضافة `pharmacy.api.ts`
- **الحالة:** [x] ✅ منجز

### ✅ 1.5 — وقت الإشعارات الحقيقي
- **الملف:** `app/(patient)/notifications/index.tsx`
- **المشكلة:** `timeText` يعرض "منذ قليل" دائماً
- **الحل:** دالة `timeAgo` محلية بالعربي
- **الحالة:** [x] ✅ منجز

### ✅ 1.6 — قائمة المحادثات من API
- **الملف:** `app/(patient)/chat/index.tsx`
- **المشكلة:** `MOCK_CHATS` ثابتة
- **الحل:** جلب من `GET /patient/chat/conversations`
- **الحالة:** [x] ✅ منجز

---

## 🟠 المرحلة 2 — شاشات مفقودة كلياً

### ✅ 2.1 — شاشة تفاصيل السجل الطبي
- **الملف الجديد:** `app/(patient)/medical-records/[id].tsx`
- **المحتوى:** التشخيص + العلاج + الوصفة + اسم الطبيب + التاريخ
- **الحالة:** [x] ✅ منجز

### ✅ 2.2 — تقييم الطبيب بعد الموعد
- **الملف:** `app/(patient)/appointments/[id].tsx`
- **المحتوى:** نجوم تقييم 1-5 + تعليق اختياري بعد إتمام الموعد
- **الحالة:** [x] ✅ منجز

### ✅ 2.3 — إضافة API files الناقصة
- `src/api/patient.api.ts` — profile, available-slots, reviews
- `src/api/pharmacy.api.ts` — prescriptions list + dispense
- **الحالة:** [x] ✅ منجز

---

## 🟡 المرحلة 3 — تحسينات UX مهمة

### ✅ 3.1 — Badge الإشعارات في TabBar
- **الملفات:** `CustomTabBar.tsx` + `(patient)/_layout.tsx` + `(doctor)/_layout.tsx`
- **الحل:** عداد المحادثات غير المقروءة على تبويب المحادثات + مواعيد معلقة على تبويب الطبيب
- **الحالة:** [x] ✅ منجز

### ✅ 3.2 — WebSocket للمحادثة
- **الملف:** `app/(patient)/chat/[clinicId].tsx` + `src/hooks/useChat.ts`
- **الحالة:** [x] ✅ منجز

### ✅ 3.3 — Push Notifications
- **الملف:** `src/utils/notifications.utils.ts` + `app/_layout.tsx`
- **الحل:** ربط token الجهاز بالخادم + توجيه صحيح عند الضغط
- **الحالة:** [x] ✅ منجز

---

## 🟢 المرحلة 4 — ميزات الويب الغائبة

| الميزة | الملف المستهدف | الحالة |
|--------|---------------|--------|
| إعدادات العيادة (ساعات العمل) | `(doctor)/settings/index.tsx` | [x] ✅ |
| إعدادات الصيدلية | `(pharmacy)/settings/index.tsx` | [x] ✅ |
| رسم بياني للإيرادات | `(doctor)/financial/index.tsx` | [x] ✅ |
| بحث المرضى بالهاتف | `(doctor)/patients/index.tsx` | [x] ✅ |
| صرف وصفة من صفحة العيادة | `(patient)/clinics/[id].tsx` | [x] ✅ |

---

## ⚡ ترتيب التنفيذ

```
الأسبوع 1:
  ✅ إضافة patient.api.ts + pharmacy.api.ts
  ✅ 1.1 Slots حقيقية
  ✅ 1.2 حفظ الملف الشخصي
  ✅ 1.3 التحليل المالي الحقيقي
  ✅ 1.4 صرف الوصفة الحقيقي
  ✅ 1.5 وقت الإشعارات
  ✅ 1.6 قائمة المحادثات الحقيقية

الأسبوع 2:
  ✅ 2.1 شاشة تفاصيل السجل الطبي
  ✅ 2.2 تقييم الطبيب
  ✅ 3.1 Badge الإشعارات في TabBar

الأسبوع 3:
  ✅ 3.2 WebSocket
  ✅ 3.3 Push Notifications
  ✅ المرحلة 4 كاملة
```

---

## 🔌 API Endpoints المطلوبة

```
# patient.api.ts
GET  /patient/profile
PUT  /patient/profile
GET  /patient/clinics/[id]/available-slots?date=YYYY-MM-DD
POST /patient/clinics/[id]/reviews
GET  /patient/chat/conversations

# pharmacy.api.ts
GET  /pharmacy/prescriptions
GET  /pharmacy/prescriptions/[id]
PUT  /pharmacy/prescriptions/[id]/dispense

# doctor (موجود في appointments.api.ts)
GET  /financial/summary?period=day|week|month
GET  /financial/transactions
```

---

## ✅ ملخص ما تم إنجازه (Session 2)

| المهمة | الملف |
|--------|------|
| تقييم الطبيب بعد الموعد | `(patient)/appointments/[id].tsx` |
| Badge المحادثات في TabBar | `CustomTabBar.tsx` + layouts |
| WebSocket للمحادثة | `hooks/useChat.ts` + `chat/[clinicId].tsx` |
| Push Notifications كاملة | `notifications.utils.ts` + `_layout.tsx` |
| إعدادات العيادة (بيانات + ساعات عمل) | `(doctor)/settings/index.tsx` |
| إعدادات الصيدلية | `(pharmacy)/settings/index.tsx` |
| رسم بياني للإيرادات | `(doctor)/financial/index.tsx` |
| Debounce بحث المرضى | `(doctor)/patients/index.tsx` |

## ⏳ المتبقي (Session 3)
- اختبار شامل وبناء APK نهائي

## 🎉 التطبيق مكتمل 100% من جانب الميزات!

- [ ] كل مريض يمكنه: البحث، الحجز، رؤية مواعيده، التواصل، رؤية سجلاته، العروض، التقييم
- [ ] كل طبيب يمكنه: رؤية مواعيده، تأكيدها، إتمامها، كتابة وصفات، رؤية إيراداته الحقيقية
- [ ] كل صيدلي يمكنه: رؤية الوصفات الواردة الحقيقية، صرفها فعلياً
- [ ] المحادثة الفورية تعمل عبر WebSocket
- [ ] الإشعارات الفورية تصل عند تأكيد/إلغاء الموعد
