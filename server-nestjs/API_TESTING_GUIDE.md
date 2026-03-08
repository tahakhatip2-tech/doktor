# 📚 دليل توثيق API واختبارات Hakeem Jordan

## 🎯 نظرة عامة

هذا الدليل يوضح كيفية استخدام توثيق API والاختبارات الشاملة لنظام Hakeem Jordan.

---

## 📖 توثيق API (Swagger)

### الوصول إلى التوثيق

بعد تشغيل السيرفر، يمكنك الوصول إلى توثيق API الكامل عبر:

```
http://localhost:3000/api/docs
```

أو عبر ngrok:
```
https://tsunamic-unshameable-maricruz.ngrok-free.dev/api/docs
```

### المميزات

- ✅ **توثيق تفاعلي**: اختبر جميع الـ Endpoints مباشرة من المتصفح
- ✅ **أمثلة واقعية**: كل endpoint يحتوي على أمثلة Request/Response
- ✅ **مصادقة JWT**: اختبر الـ Endpoints المحمية بسهولة
- ✅ **دعم اللغة العربية**: جميع الأوصاف باللغة العربية

### كيفية الاستخدام

#### 1. تسجيل الدخول والحصول على Token

1. افتح صفحة التوثيق
2. ابحث عن `/api/auth/login`
3. اضغط "Try it out"
4. أدخل بيانات الدخول:
```json
{
  "email": "tahakhatip2@gmail.com",
  "password": "yourpassword"
}
```
5. اضغط "Execute"
6. انسخ الـ `access_token` من الـ Response

#### 2. استخدام Token للـ Endpoints المحمية

1. اضغط على زر "Authorize" في أعلى الصفحة
2. الصق الـ Token في الحقل
3. اضغط "Authorize"
4. الآن يمكنك اختبار جميع الـ Endpoints المحمية

---

## 🧪 الاختبارات (Tests)

### أنواع الاختبارات

#### 1. Unit Tests (اختبارات الوحدات)
تختبر كل Service على حدة بمعزل عن باقي النظام.

**الملفات:**
- `src/auth/auth.service.spec.ts`
- `src/appointments/appointments.service.spec.ts`

#### 2. E2E Tests (اختبارات شاملة)
تختبر الـ API بالكامل من البداية للنهاية.

**الملفات:**
- `test/auth.e2e-spec.ts`

### تشغيل الاختبارات

#### تشغيل جميع الاختبارات
```bash
npm test
```

#### تشغيل Unit Tests فقط
```bash
npm run test:watch
```

#### تشغيل E2E Tests فقط
```bash
npm run test:e2e
```

#### تشغيل الاختبارات مع Coverage
```bash
npm run test:cov
```

### تقرير التغطية (Coverage Report)

بعد تشغيل `npm run test:cov`، ستجد تقرير HTML في:
```
coverage/lcov-report/index.html
```

افتحه في المتصفح لرؤية تفاصيل التغطية.

---

## 📝 كتابة اختبارات جديدة

### مثال: Unit Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { YourService } from './your.service';

describe('YourService', () => {
  let service: YourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YourService],
    }).compile();

    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do something', async () => {
    const result = await service.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### مثال: E2E Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('YourController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/your-endpoint (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/your-endpoint')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('data');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

---

## 🔍 الـ Endpoints المتوفرة

### Auth (المصادقة)
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/profile` - الحصول على الملف الشخصي
- `PUT /api/auth/profile` - تحديث الملف الشخصي
- `POST /api/auth/profile/avatar` - رفع صورة الملف الشخصي

### Appointments (المواعيد)
- `GET /api/appointments` - جلب جميع المواعيد
- `GET /api/appointments/today` - مواعيد اليوم
- `GET /api/appointments/:id` - موعد محدد
- `POST /api/appointments` - إنشاء موعد جديد
- `PUT /api/appointments/:id` - تحديث موعد
- `DELETE /api/appointments/:id` - حذف موعد
- `GET /api/appointments/stats` - إحصائيات المواعيد
- `POST /api/appointments/:id/medical-record` - حفظ سجل طبي

### Contacts (جهات الاتصال)
- `GET /api/contacts` - جلب جميع جهات الاتصال
- `GET /api/contacts/:id` - جهة اتصال محددة
- `POST /api/contacts` - إنشاء جهة اتصال
- `PUT /api/contacts/:id` - تحديث جهة اتصال
- `DELETE /api/contacts/:id` - حذف جهة اتصال

### WhatsApp (واتساب)
- `POST /api/whatsapp/start` - بدء جلسة واتساب
- `GET /api/whatsapp/status` - حالة الاتصال
- `POST /api/whatsapp/logout` - تسجيل الخروج
- `GET /api/whatsapp/chats` - جلب المحادثات
- `POST /api/whatsapp/send` - إرسال رسالة
- `GET /api/whatsapp/templates` - قوالب الرسائل

---

## 🎨 أمثلة Requests

### تسجيل الدخول
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tahakhatip2@gmail.com",
    "password": "yourpassword"
  }'
```

### إنشاء موعد جديد
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": "+962791234567",
    "customerName": "أحمد محمد",
    "appointmentDate": "2026-01-15T10:00:00.000Z",
    "status": "confirmed",
    "notes": "موعد فحص دوري"
  }'
```

### جلب المواعيد
```bash
curl -X GET http://localhost:3000/api/appointments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 نصائح للمطورين

### 1. استخدم DTOs دائماً
```typescript
// ❌ سيء
@Post()
create(@Body() data: any) { }

// ✅ جيد
@Post()
create(@Body() data: CreateAppointmentDto) { }
```

### 2. أضف Swagger Decorators
```typescript
@ApiOperation({ summary: 'وصف الـ Endpoint' })
@ApiResponse({ status: 200, description: 'نجح' })
@ApiResponse({ status: 400, description: 'خطأ' })
```

### 3. اكتب اختبارات لكل Feature جديد
```typescript
describe('New Feature', () => {
  it('should work correctly', () => {
    // Test implementation
  });
});
```

### 4. استخدم Environment Variables
```typescript
// ❌ سيء
const apiKey = 'hardcoded-key';

// ✅ جيد
const apiKey = process.env.API_KEY;
```

---

## 📊 معايير الجودة

### Code Coverage المطلوب
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### Best Practices
- ✅ جميع الـ Endpoints موثقة في Swagger
- ✅ جميع الـ Services لها Unit Tests
- ✅ جميع الـ Controllers لها E2E Tests
- ✅ استخدام DTOs لجميع الـ Requests
- ✅ Error Handling شامل

---

## 🐛 استكشاف الأخطاء

### الاختبارات تفشل؟

1. **تأكد من قاعدة البيانات**
```bash
npx prisma generate
npx prisma db push
```

2. **نظف الـ Cache**
```bash
npm run test -- --clearCache
```

3. **تحقق من الـ Environment Variables**
```bash
cat .env
```

### Swagger لا يعمل؟

1. **تأكد من تشغيل السيرفر**
```bash
npm run start:dev
```

2. **تحقق من الرابط**
```
http://localhost:3000/api/docs
```

3. **راجع الـ Console للأخطاء**

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. راجع هذا الدليل
2. تحقق من الـ Console Logs
3. راجع ملفات الاختبارات للأمثلة

---

**تم التطوير بواسطة: Al-Khatib Software** ✨
