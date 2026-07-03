# 🎛️ لوحة تحكم الأدمن الاحترافية - Admin Panel

## 📋 نظرة عامة

تم بناء لوحة تحكم إدارية احترافية كاملة لإدارة النظام والمستخدمين والاشتراكات والمدفوعات.

---

## ✨ الميزات الرئيسية

### 1. 📊 لوحة التحكم الرئيسية (Dashboard)
- **إحصائيات فورية:**
  - إجمالي المستخدمين والنشطين
  - الإيرادات الشهرية والإجمالية
  - المواعيد الشهرية والإجمالية
  - مستخدمي الفترة التجريبية

- **مخططات بيانية:**
  - مخطط الإيرادات الشهرية (12 شهر)
  - مخطط نمو المستخدمين (12 شهر)
  - توزيع حالات الاشتراكات (Pie Chart)
  - أفضل 10 عملاء من حيث الإيرادات

### 2. 👥 إدارة المستخدمين (Users Management)
- **الفلاتر المتقدمة:**
  - بحث بالبريد، الاسم، الهاتف
  - تصفية حسب الدور (طبيب/صيدلية/مدير)
  - تصفية حسب الحالة (نشط/محظور)
  - تصفية حسب نوع الاشتراك

- **الإجراءات:**
  - عرض التفاصيل الكاملة
  - تعليق/تفعيل الحساب
  - تمديد الفترة التجريبية
  - حذف المستخدم ونقاله
  - تصدير البيانات CSV

- **معلومات مفصلة:**
  - بيانات المستخدم الأساسية
  - إحصائيات المواعيد والمرضى
  - سجل المدفوعات
  - آخر نشاط

### 3. 💳 إدارة المدفوعات (Payments)
- **العرض:**
  - جدول شامل للمدفوعات
  - تصفية حسب الحالة (قيد الانتظار/مكتمل/مرفوض)
  - تصفية حسب طريقة الدفع
  - Pagination متقدم

- **الإجراءات:**
  - قبول الدفعة
  - رفض الدفعة مع سبب
  - عرض تفاصيل الدفعة
  - تصدير المدفوعات

### 4. 📦 إدارة الخطط (Plans)
- **الإدارة الكاملة:**
  - إنشاء خطة جديدة
  - تعديل الخطة
  - حذف الخطة
  - عرض عدد المشتركين

- **معلومات الخطة:**
  - الاسم والوصف
  - السعر والمدة (شهري/سنوي)
  - الميزات
  - عدد المشتركين الحاليين

### 5. ⚙️ إعدادات النظام (Settings)
- **الإعدادات المتاحة:**
  - اسم التطبيق
  - بريد وهاتف الدعم
  - أيام الفترة التجريبية
  - الحد الأقصى للمستخدمين
  - وضع الصيانة

- **معلومات النظام:**
  - إصدار التطبيق
  - آخر تحديث
  - البيئة
  - قاعدة البيانات

---

## 🔧 التقنيات المستخدمة

### Backend (NestJS)
```typescript
- AdminModule: الوحدة الرئيسية
- AdminController: API Endpoints
- AdminService: Business Logic
- Prisma: ORM للتعامل مع قاعدة البيانات
```

### Frontend (React + TypeScript)
```typescript
- React 18
- TypeScript
- TailwindCSS
- Shadcn/ui Components
- Recharts (للمخططات)
- Framer Motion (للحركات)
- React Query (إدارة البيانات)
```

---

## 📡 API Endpoints

### Dashboard
```
GET /admin/dashboard/stats
```

### Users
```
GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id
DELETE /admin/users/:id
PATCH  /admin/users/:id/suspend
PATCH  /admin/users/:id/activate
PATCH  /admin/users/:id/extend-trial
```

### Plans
```
GET    /admin/plans
POST   /admin/plans
PATCH  /admin/plans/:id
DELETE /admin/plans/:id
```

### Payments
```
GET   /admin/payments
PATCH /admin/payments/:id/approve
PATCH /admin/payments/:id/reject
```

### Settings
```
GET /admin/settings
PUT /admin/settings/:key
```

---

## 🚀 كيفية الاستخدام

### 1. تسجيل الدخول
```
- انتقل إلى: /admin-panel
- يجب أن يكون لديك حساب بدور ADMIN
```

### 2. التنقل
```
- استخدم Tabs العلوية للتنقل بين الأقسام
- جميع الأقسام في صفحة واحدة
```

### 3. الإجراءات
```
- استخدم الفلاتر لتحديد البيانات
- انقر على الأزرار لتنفيذ الإجراءات
- جميع الإجراءات لها تأكيد
```

---

## 🔐 الأمان

### Authentication
- يجب تسجيل الدخول كـ ADMIN
- JWT Token للـ Authorization
- Guards على جميع Endpoints

### Authorization
- Role-Based Access Control (RBAC)
- فقط ADMIN يمكنه الوصول
- Validation على جميع Inputs

### Audit
- تسجيل جميع الإجراءات الحساسة
- تتبع من قام بالإجراء ومتى
- سجل نشاط المدراء

---

## 📊 الإحصائيات المتاحة

### في الوقت الفعلي:
- عدد المستخدمين الكلي والنشط
- الإيرادات الشهرية والإجمالية
- المواعيد الشهرية والإجمالية

### التاريخية:
- الإيرادات لآخر 12 شهر
- نمو المستخدمين لآخر 12 شهر
- توزيع الاشتراكات

### التحليلات:
- أفضل العملاء
- معدل التحويل
- معدل الإلغاء

---

## 🎨 التصميم

### الألوان:
- Primary: أزرق (#3b82f6)
- Secondary: برتقالي (#f97316)
- Success: أخضر (#10b981)
- Danger: أحمر (#ef4444)

### الأنماط:
- Modern & Clean
- Glassmorphism Effects
- Smooth Animations
- Responsive Design

---

## 📱 Responsive

- ✅ Desktop (1920px+)
- ✅ Laptop (1280px - 1919px)
- ✅ Tablet (768px - 1279px)
- ✅ Mobile (< 768px)

---

## 🔄 Updates المستقبلية

### قريباً:
- [ ] Activity Logs كامل
- [ ] تصدير التقارير PDF
- [ ] إشعارات فورية
- [ ] Dark Mode كامل
- [ ] Multi-language Support

### في الخطة:
- [ ] Advanced Analytics
- [ ] Email Marketing Integration
- [ ] SMS Notifications
- [ ] Webhooks Management
- [ ] API Keys Management

---

## 📝 الملاحظات

1. **الأداء:**
   - استخدام Pagination للبيانات الكبيرة
   - Lazy Loading للمكونات
   - Caching للإحصائيات

2. **الأمان:**
   - تأكيد على الإجراءات الحساسة
   - Validation على Input
   - Rate Limiting على APIs

3. **تجربة المستخدم:**
   - تصميم بديهي
   - رسائل واضحة
   - Loading States
   - Error Handling

---

## 🐛 المشاكل المعروفة

لا توجد مشاكل معروفة حالياً.

---

## 📞 الدعم

للمساعدة والدعم، يرجى التواصل مع فريق التطوير.

---

**تم بناؤه بـ ❤️ بواسطة فريق حكيم**
