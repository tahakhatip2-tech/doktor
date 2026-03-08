# تحليل تدفق البيانات والمنطق البرمجي - Hakeem Jordan
## تحليل مفصل لكيفية عمل التطبيق 🔍

---

## 📊 رسم توضيحي للبنية المعمارية

```
┌─────────────────────────────────────────────────────────────────┐
│                        HAKEEM JORDAN SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐
│  Doctor Portal   │         │  Patient Portal  │
│   (Frontend)     │         │   (Frontend)     │
│                  │         │                  │
│  - React + Vite  │         │  - React + Vite  │
│  - TypeScript    │         │  - TypeScript    │
│  - TailwindCSS   │         │  - TailwindCSS   │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │    HTTP Requests (API)     │
         │                            │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   Ngrok Tunnel         │
         │   (Public URL)         │
         └────────────┬───────────┘
                      │
                      ▼
         ┌────────────────────────┐
         │   NestJS Backend       │
         │   (localhost:3000)     │
         │                        │
         │  - Controllers         │
         │  - Services            │
         │  - Guards              │
         │  - DTOs                │
         └────────┬───────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
   ┌────────┐ ┌──────┐ ┌────────┐
   │Supabase│ │Baileys│ │Gemini │
   │(PostgreSQL)│ │(WhatsApp)│ │  AI   │
   └────────┘ └──────┘ └────────┘
```

---

## 🔐 تدفق المصادقة (Authentication Flow)

### 1. تسجيل مريض جديد

```
┌─────────────┐
│   Patient   │
│   Browser   │
└──────┬──────┘
       │
       │ 1. يملأ نموذج التسجيل
       │    - fullName
       │    - email
       │    - password
       │    - phone
       │    - dateOfBirth
       │
       ▼
┌──────────────────────────────┐
│ PatientRegister.tsx          │
│                              │
│ handleSubmit() {             │
│   POST /patient/auth/register│
│   Body: RegisterPatientDto   │
│ }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend: PatientController   │
│                              │
│ @Post('auth/register')       │
│ register(dto) {              │
│   return service.register()  │
│ }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientService.register()    │
│                              │
│ 1. Check email exists        │
│    - findUnique({email})     │
│                              │
│ 2. Check phone exists        │
│    - findUnique({phone})     │
│                              │
│ 3. Hash password             │
│    - bcrypt.hash(pwd, 10)    │
│                              │
│ 4. Create patient            │
│    - prisma.patient.create() │
│                              │
│ 5. Generate JWT token        │
│    - jwtService.sign({       │
│        sub: patient.id,      │
│        email: patient.email, │
│        type: 'patient'       │
│      })                      │
│                              │
│ 6. Return {patient, token}   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: PatientRegister    │
│                              │
│ 1. Save to localStorage      │
│    - patient_token           │
│    - patient_user            │
│                              │
│ 2. Show success toast        │
│                              │
│ 3. Navigate to dashboard     │
│    - /patient/dashboard      │
└──────────────────────────────┘
```

### 2. تسجيل الدخول للمريض

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       │ يدخل email & password
       │
       ▼
┌──────────────────────────────┐
│ PatientLogin.tsx             │
│                              │
│ POST /patient/auth/login     │
│ Body: { email, password }    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientService.login()       │
│                              │
│ 1. Find patient by email     │
│    - prisma.patient.findUnique│
│                              │
│ 2. Check if active           │
│    - if (!patient.isActive)  │
│      throw UnauthorizedException│
│                              │
│ 3. Verify password           │
│    - bcrypt.compare(pwd)     │
│                              │
│ 4. Generate JWT token        │
│    - jwtService.sign({...})  │
│                              │
│ 5. Return {patient, token}   │
│    - exclude password        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Save & Navigate    │
│                              │
│ localStorage.setItem(...)    │
│ navigate('/patient/dashboard')│
└──────────────────────────────┘
```

### 3. حماية الصفحات (Route Protection)

```
┌─────────────────────────────┐
│ Patient tries to access     │
│ /patient/dashboard          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ PatientLayout.tsx           │
│                             │
│ useEffect(() => {           │
│   const token = localStorage│
│     .getItem('patient_token')│
│                             │
│   if (!token) {             │
│     navigate('/patient/login')│
│   }                         │
│ })                          │
└──────────────┬──────────────┘
               │
               │ Token exists
               │
               ▼
┌─────────────────────────────┐
│ Render PatientLayout        │
│ - Header with Navigation    │
│ - User Avatar & Menu        │
│ - Outlet (child routes)     │
└─────────────────────────────┘
```

### 4. حماية API Endpoints

```
┌─────────────────────────────┐
│ Frontend makes API request  │
│                             │
│ axios.get('/patient/profile',{│
│   headers: {                │
│     Authorization:          │
│       `Bearer ${token}`     │
│   }                         │
│ })                          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Backend: PatientAuthGuard   │
│                             │
│ canActivate() {             │
│   1. Extract token from     │
│      Authorization header   │
│                             │
│   2. Verify JWT token       │
│      - jwtService.verifyAsync│
│                             │
│   3. Check token type       │
│      - if (type !== 'patient')│
│        throw UnauthorizedException│
│                             │
│   4. Attach user to request │
│      - request.user = {     │
│          id: payload.sub,   │
│          email: payload.email│
│        }                    │
│                             │
│   5. Return true            │
│ }                           │
└──────────────┬──────────────┘
               │
               │ Authorized ✅
               │
               ▼
┌─────────────────────────────┐
│ Execute Controller Method   │
│                             │
│ @Get('profile')             │
│ @UseGuards(PatientAuthGuard)│
│ getProfile(@Request() req) {│
│   // req.user.id available  │
│   return service.getProfile()│
│ }                           │
└─────────────────────────────┘
```

---

## 📅 تدفق حجز موعد (Appointment Booking Flow)

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       │ 1. يفتح /patient/clinics
       │
       ▼
┌──────────────────────────────┐
│ PatientClinics.tsx           │
│                              │
│ useEffect(() => {            │
│   fetchClinics()             │
│ })                           │
│                              │
│ GET /patient/clinics         │
│ Headers: { Authorization }   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientService.getClinics()  │
│                              │
│ prisma.user.findMany({       │
│   where: {                   │
│     role: 'USER',            │
│     status: 'active',        │
│     clinic_name: {not: null} │
│   },                         │
│   select: {                  │
│     id, name, email, phone,  │
│     clinic_name,             │
│     clinic_address,          │
│     clinic_specialty,        │
│     working_hours            │
│   }                          │
│ })                           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Display Clinics    │
│                              │
│ - Grid of clinic cards       │
│ - Search & Filter            │
│ - "احجز موعد" button         │
│ - WhatsApp button            │
└──────────────┬───────────────┘
               │
               │ 2. يضغط "احجز موعد"
               │
               ▼
┌──────────────────────────────┐
│ handleBookAppointment()      │
│                              │
│ 1. setSelectedClinic(clinic) │
│ 2. setBookingDialogOpen(true)│
│ 3. Show Dialog with form     │
└──────────────┬───────────────┘
               │
               │ 3. يملأ النموذج
               │    - appointmentDate
               │    - notes (optional)
               │
               ▼
┌──────────────────────────────┐
│ submitBooking()              │
│                              │
│ 1. Validate date             │
│                              │
│ 2. POST /patient/appointments│
│    Body: {                   │
│      clinicId,               │
│      appointmentDate,        │
│      notes                   │
│    }                         │
│    Headers: { Authorization }│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend: PatientAppointment  │
│         Controller           │
│                              │
│ @Post('appointments')        │
│ @UseGuards(PatientAuthGuard) │
│ create(@Request() req,       │
│        @Body() dto) {        │
│   return service.create(     │
│     req.user.id, dto         │
│   )                          │
│ }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientAppointmentService    │
│ .create()                    │
│                              │
│ 1. Validate clinic exists    │
│    - prisma.user.findUnique()│
│                              │
│ 2. Check appointment conflicts│
│    - Check if time slot busy │
│                              │
│ 3. Create appointment        │
│    - prisma.appointment.create({│
│        data: {               │
│          userId: clinicId,   │
│          patientId,          │
│          appointmentDate,    │
│          notes,              │
│          status: 'pending',  │
│          source: 'patient_portal'│
│        }                     │
│      })                      │
│                              │
│ 4. Create notification for   │
│    patient                   │
│    - prisma.notification.create({│
│        patientId,            │
│        title: 'طلب موعد جديد'│
│        message: '...'        │
│      })                      │
│                              │
│ 5. Notify doctor (WhatsApp)  │
│    - Send message via Baileys│
│                              │
│ 6. Return appointment        │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Success            │
│                              │
│ 1. Show success toast        │
│    "تم إرسال طلب الموعد"     │
│                              │
│ 2. Close dialog              │
│                              │
│ 3. Patient can view in       │
│    /patient/appointments     │
│    (status: pending)         │
└──────────────────────────────┘
```

---

## 📋 تدفق عرض المواعيد (View Appointments Flow)

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       │ يفتح /patient/appointments
       │
       ▼
┌──────────────────────────────┐
│ PatientAppointments.tsx      │
│                              │
│ useEffect(() => {            │
│   fetchAppointments()        │
│ })                           │
│                              │
│ GET /patient/appointments    │
│ Headers: { Authorization }   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientAppointmentService    │
│ .findAll()                   │
│                              │
│ prisma.appointment.findMany({│
│   where: {                   │
│     patientId: req.user.id   │
│   },                         │
│   include: {                 │
│     user: {                  │
│       select: {              │
│         clinic_name,         │
│         clinic_specialty,    │
│         clinic_address       │
│       }                      │
│     }                        │
│   },                         │
│   orderBy: {                 │
│     appointmentDate: 'desc'  │
│   }                          │
│ })                           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Display            │
│                              │
│ 1. Tabs for filtering        │
│    - all                     │
│    - pending                 │
│    - confirmed               │
│    - completed               │
│                              │
│ 2. Appointment cards         │
│    - Clinic name & specialty │
│    - Date & Time             │
│    - Address                 │
│    - Notes                   │
│    - Status badge            │
│    - Cancel button (if pending/confirmed)│
└──────────────────────────────┘
```

---

## ❌ تدفق إلغاء موعد (Cancel Appointment Flow)

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       │ 1. يضغط "إلغاء الموعد"
       │
       ▼
┌──────────────────────────────┐
│ PatientAppointments.tsx      │
│                              │
│ 1. setSelectedAppointment()  │
│ 2. setCancelDialogOpen(true) │
│                              │
│ Show AlertDialog:            │
│ "هل أنت متأكد من إلغاء هذا   │
│  الموعد؟"                    │
└──────────────┬───────────────┘
               │
               │ 2. يؤكد الإلغاء
               │
               ▼
┌──────────────────────────────┐
│ handleCancelAppointment()    │
│                              │
│ DELETE /patient/appointments/:id│
│ Body: {                      │
│   reason: 'تم الإلغاء من قبل │
│            المريض'           │
│ }                            │
│ Headers: { Authorization }   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend: PatientAppointment  │
│         Controller           │
│                              │
│ @Delete('appointments/:id')  │
│ @UseGuards(PatientAuthGuard) │
│ cancel(@Request() req,       │
│        @Param('id') id,      │
│        @Body() body) {       │
│   return service.cancel(     │
│     req.user.id, id, body.reason│
│   )                          │
│ }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientAppointmentService    │
│ .cancel()                    │
│                              │
│ 1. Find appointment          │
│    - prisma.appointment.findUnique│
│                              │
│ 2. Verify ownership          │
│    - if (apt.patientId !== patientId)│
│      throw UnauthorizedException│
│                              │
│ 3. Check if cancellable      │
│    - if (status === 'completed')│
│      throw BadRequestException│
│                              │
│ 4. Update status             │
│    - prisma.appointment.update({│
│        where: { id },        │
│        data: {               │
│          status: 'cancelled',│
│          cancellationReason: reason│
│        }                     │
│      })                      │
│                              │
│ 5. Notify doctor             │
│    - Send WhatsApp message   │
│    - "المريض X ألغى موعده"   │
│                              │
│ 6. Return updated appointment│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Success            │
│                              │
│ 1. Show success toast        │
│    "تم إلغاء الموعد بنجاح"   │
│                              │
│ 2. Refresh appointments list │
│    - fetchAppointments()     │
│                              │
│ 3. Close dialog              │
└──────────────────────────────┘
```

---

## 🔔 تدفق الإشعارات (Notifications Flow)

### 1. إنشاء إشعار جديد

```
┌──────────────────────────────┐
│ System Event Occurs          │
│ (e.g., appointment booked)   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientNotificationService   │
│ .create()                    │
│                              │
│ prisma.notification.create({ │
│   data: {                    │
│     patientId,               │
│     title: 'موعد جديد',      │
│     message: 'تم حجز موعدك...',│
│     type: 'appointment',     │
│     isRead: false,           │
│     metadata: {              │
│       appointmentId          │
│     }                        │
│   }                          │
│ })                           │
└──────────────────────────────┘
```

### 2. عرض الإشعارات

```
┌─────────────┐
│   Patient   │
└──────┬──────┘
       │
       │ يفتح /patient/notifications
       │
       ▼
┌──────────────────────────────┐
│ PatientNotifications.tsx     │
│                              │
│ GET /patient/notifications   │
│ Headers: { Authorization }   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientNotificationService   │
│ .findAll()                   │
│                              │
│ prisma.notification.findMany({│
│   where: {                   │
│     patientId: req.user.id   │
│   },                         │
│   orderBy: {                 │
│     createdAt: 'desc'        │
│   }                          │
│ })                           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Display            │
│                              │
│ - List of notifications      │
│ - Unread highlighted         │
│ - Mark as read button        │
│ - Delete button              │
└──────────────────────────────┘
```

### 3. Badge عدد غير المقروءة

```
┌──────────────────────────────┐
│ PatientLayout.tsx            │
│                              │
│ useEffect(() => {            │
│   fetchUnreadCount()         │
│ }, [])                       │
│                              │
│ GET /patient/notifications/  │
│     unread-count             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend: Count unread        │
│                              │
│ prisma.notification.count({  │
│   where: {                   │
│     patientId: req.user.id,  │
│     isRead: false            │
│   }                          │
│ })                           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Show Badge         │
│                              │
│ {unreadCount > 0 && (        │
│   <Badge>{unreadCount}</Badge>│
│ )}                           │
└──────────────────────────────┘
```

---

## 🏥 تدفق واجهة الطبيب (Doctor Dashboard Flow)

### 1. تحميل لوحة التحكم

```
┌─────────────┐
│   Doctor    │
└──────┬──────┘
       │
       │ يفتح / (Index.tsx)
       │
       ▼
┌──────────────────────────────┐
│ Index.tsx                    │
│                              │
│ useEffect(() => {            │
│   if (activeTab === 'dashboard') {│
│     fetchDashboardData()     │
│   }                          │
│ }, [activeTab])              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ fetchDashboardData()         │
│                              │
│ Promise.all([                │
│   1. GET /appointments/stats │
│   2. GET /whatsapp/settings  │
│   3. GET /appointments?      │
│      date_from={today}       │
│ ])                           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Display Dashboard            │
│                              │
│ 1. MedicalStatsCard          │
│    - مرضى اليوم              │
│    - حضر                     │
│    - في الانتظار             │
│    - معدل الحضور             │
│                              │
│ 2. AutoReplyToggle           │
│    - تفعيل/تعطيل AI          │
│                              │
│ 3. UpcomingAppointments      │
│    - المواعيد القادمة        │
│                              │
│ 4. Quick Links               │
│    - إدارة المحادثات         │
│    - عرض الواجهات            │
└──────────────────────────────┘
```

### 2. إدارة المرضى

```
┌─────────────┐
│   Doctor    │
└──────┬──────┘
       │
       │ يضغط "إدارة المرضى"
       │
       ▼
┌──────────────────────────────┐
│ Index.tsx (activeTab='contacts')│
│                              │
│ useContacts() hook           │
│ GET /contacts                │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Display Patient Cards        │
│                              │
│ - Search & Filter            │
│ - Pagination (8 per page)    │
│ - PatientCard components     │
│   - عرض التفاصيل             │
│   - فتح المحادثة             │
│   - حذف                      │
│                              │
│ - Sync button                │
│ - Export button              │
└──────────────────────────────┘
```

### 3. عرض تفاصيل مريض

```
┌─────────────┐
│   Doctor    │
└──────┬──────┘
       │
       │ يضغط "عرض التفاصيل" على بطاقة مريض
       │
       ▼
┌──────────────────────────────┐
│ handleViewPatientDetails()   │
│                              │
│ 1. setSelectedPatientForDetails(contact)│
│ 2. setActiveTab('patient-details')│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ PatientDetails.tsx           │
│                              │
│ Display:                     │
│ - معلومات شخصية              │
│ - التاريخ المرضي             │
│ - الحساسيات                  │
│ - الأمراض المزمنة            │
│ - المواعيد السابقة           │
│ - الوصفات الطبية             │
│                              │
│ Actions:                     │
│ - فتح محادثة                 │
│ - حجز موعد                   │
│ - طباعة السجل                │
└──────────────────────────────┘
```

---

## 💬 تدفق المحادثات (WhatsApp Chat Flow)

```
┌─────────────┐
│   Doctor    │
└──────┬──────┘
       │
       │ يضغط "فتح المحادثة" على بطاقة مريض
       │
       ▼
┌──────────────────────────────┐
│ Index.tsx                    │
│                              │
│ 1. setSelectedPhone(phone)   │
│ 2. setSelectedName(name)     │
│ 3. setActiveTab('whatsapp-bot')│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ WhatsAppBot.tsx              │
│                              │
│ Props:                       │
│ - initialPhone               │
│ - initialName                │
│ - doctorName                 │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Load Chat History            │
│                              │
│ GET /whatsapp/messages?      │
│     phone={selectedPhone}    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Display Chat Interface       │
│                              │
│ - Message list               │
│ - Input field                │
│ - Send button                │
│ - Attach file button         │
│ - Templates button           │
└──────────────┬───────────────┘
               │
               │ Doctor types message
               │
               ▼
┌──────────────────────────────┐
│ handleSendMessage()          │
│                              │
│ POST /whatsapp/send          │
│ Body: {                      │
│   phone,                     │
│   message,                   │
│   type: 'text'               │
│ }                            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend: WhatsApp Service    │
│                              │
│ 1. Get WhatsApp session      │
│    - Baileys connection      │
│                              │
│ 2. Format phone number       │
│    - Add country code        │
│                              │
│ 3. Send message via Baileys  │
│    - sock.sendMessage()      │
│                              │
│ 4. Save to database          │
│    - prisma.message.create() │
│                              │
│ 5. Return success            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Update UI          │
│                              │
│ 1. Add message to chat       │
│ 2. Clear input field         │
│ 3. Scroll to bottom          │
└──────────────────────────────┘
```

---

## 🤖 تدفق الرد الآلي (AI Auto-Reply Flow)

```
┌──────────────────────────────┐
│ Patient sends WhatsApp msg   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Baileys receives message     │
│                              │
│ Event: 'messages.upsert'     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ WhatsApp Service Handler     │
│                              │
│ 1. Extract message data      │
│    - phone                   │
│    - message text            │
│    - timestamp               │
│                              │
│ 2. Save to database          │
│    - prisma.message.create() │
│                              │
│ 3. Check if AI enabled       │
│    - Get settings            │
│    - if (!ai_enabled) return │
└──────────────┬───────────────┘
               │
               │ AI is enabled
               │
               ▼
┌──────────────────────────────┐
│ Gemini AI Service            │
│                              │
│ 1. Build context             │
│    - Doctor name             │
│    - Clinic info             │
│    - Previous messages       │
│    - Patient info            │
│                              │
│ 2. Call Gemini API           │
│    - model.generateContent() │
│    - Prompt: "أنت سكرتير..."  │
│                              │
│ 3. Parse AI response         │
│    - Extract text            │
│    - Check for booking intent│
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Send AI Response             │
│                              │
│ 1. Send via Baileys          │
│    - sock.sendMessage()      │
│                              │
│ 2. Save to database          │
│    - prisma.message.create() │
│    - is_ai_generated: true   │
│                              │
│ 3. If booking detected:      │
│    - Create appointment      │
│    - Send confirmation       │
└──────────────────────────────┘
```

---

## 🔄 تدفق المزامنة (Sync Contacts Flow)

```
┌─────────────┐
│   Doctor    │
└──────┬──────┘
       │
       │ يضغط "مزامنة"
       │
       ▼
┌──────────────────────────────┐
│ Index.tsx                    │
│                              │
│ syncContacts.mutate()        │
│                              │
│ POST /contacts/sync          │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Backend: Contacts Service    │
│                              │
│ 1. Get all WhatsApp chats    │
│    - Baileys store.chats     │
│                              │
│ 2. For each chat:            │
│    - Extract phone & name    │
│    - Check if exists in DB   │
│    - If not: create contact  │
│    - If yes: update info     │
│                              │
│ 3. Get message history       │
│    - Last message            │
│    - Last visit date         │
│    - Total appointments      │
│                              │
│ 4. Return synced contacts    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Frontend: Update UI          │
│                              │
│ 1. Refresh contacts list     │
│ 2. Show success toast        │
│    "تمت المزامنة بنجاح"      │
│ 3. Update total count        │
└──────────────────────────────┘
```

---

## 📊 ملخص نقاط البيانات الرئيسية

### 1. جداول قاعدة البيانات (Prisma Schema)

```prisma
model User {
  id                Int      @id @default(autoincrement())
  email             String   @unique
  name              String
  role              String   // 'USER' for doctors
  status            String   // 'active', 'inactive'
  clinic_name       String?
  clinic_address    String?
  clinic_phone      String?
  clinic_specialty  String?
  working_hours     String?
  avatar            String?
}

model Patient {
  id              Int      @id @default(autoincrement())
  email           String   @unique
  password        String
  fullName        String
  phone           String   @unique
  dateOfBirth     DateTime?
  gender          String?
  bloodType       String?
  allergies       String?
  chronicDiseases String?
  address         String?
  nationalId      String?
  isActive        Boolean  @default(true)
  isEmailVerified Boolean  @default(false)
  avatar          String?
  emergencyContact String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Appointment {
  id                  Int      @id @default(autoincrement())
  userId              Int      // Doctor/Clinic ID
  patientId           Int?     // Patient ID (if from portal)
  appointmentDate     DateTime
  status              String   // 'pending', 'confirmed', 'completed', 'cancelled'
  notes               String?
  cancellationReason  String?
  source              String?  // 'whatsapp', 'patient_portal'
  customerName        String?
  customer_phone      String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model Notification {
  id        Int      @id @default(autoincrement())
  patientId Int
  title     String
  message   String
  type      String   // 'appointment', 'reminder', 'general'
  isRead    Boolean  @default(false)
  metadata  Json?
  createdAt DateTime @default(now())
}

model Message {
  id              Int      @id @default(autoincrement())
  phone           String
  message         String
  type            String   // 'incoming', 'outgoing'
  is_ai_generated Boolean  @default(false)
  createdAt       DateTime @default(now())
}
```

### 2. متغيرات البيئة (.env)

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-key"

# Frontend URLs
VITE_API_URL="https://tsunamic-unshameable-maricruz.ngrok-free.dev/api"
VITE_API_BASE_URL="https://tsunamic-unshameable-maricruz.ngrok-free.dev"
```

---

## 🎯 الخلاصة

هذا التطبيق يستخدم بنية معمارية حديثة ومنظمة:

1. **Frontend (React):**
   - واجهتان منفصلتان (Doctor & Patient)
   - استخدام React Hooks للحالة
   - TanStack Query لإدارة البيانات
   - TypeScript للأمان

2. **Backend (NestJS):**
   - Module-based architecture
   - Guards للحماية
   - DTOs للتحقق من البيانات
   - Services للمنطق البرمجي

3. **Database (Prisma + PostgreSQL):**
   - Type-safe queries
   - Migrations
   - Relations

4. **Integrations:**
   - WhatsApp (Baileys)
   - AI (Gemini)
   - Cloud Storage (Supabase)

التطبيق يعمل بشكل متكامل مع تدفق بيانات واضح ومنطق برمجي سليم.

---

**تم إعداد هذا التحليل بواسطة:** AI Code Review System  
**التاريخ:** 2026-02-07
