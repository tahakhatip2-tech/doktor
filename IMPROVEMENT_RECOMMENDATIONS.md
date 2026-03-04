# توصيات التحسين والتطوير - Hakeem Jordan
## خطة عمل قابلة للتنفيذ 🚀

**تاريخ:** 2026-02-07  
**الحالة:** جاهز للتطبيق

---

## 🔴 أولوية عالية (High Priority) - يجب تنفيذها قبل الإطلاق

### 1. إضافة نظام Refresh Token ⚡

**المشكلة:**
- حالياً يستخدم التطبيق JWT token واحد فقط
- عند انتهاء صلاحية الـ token، المستخدم يحتاج لتسجيل دخول جديد
- تجربة مستخدم سيئة

**الحل المقترح:**

#### أ) تعديل Backend

**ملف:** `server-nestjs/src/patient/patient.service.ts`

```typescript
// إضافة دالة لإنشاء Refresh Token
async login(dto: LoginPatientDto) {
  // ... الكود الحالي للتحقق من البيانات

  // Generate Access Token (عمر قصير - 15 دقيقة)
  const accessToken = this.jwtService.sign(
    {
      sub: patient.id,
      email: patient.email,
      type: 'patient',
    },
    { expiresIn: '15m' } // ⬅️ جديد
  );

  // Generate Refresh Token (عمر طويل - 7 أيام)
  const refreshToken = this.jwtService.sign(
    {
      sub: patient.id,
      type: 'patient_refresh',
    },
    { expiresIn: '7d' } // ⬅️ جديد
  );

  // حفظ Refresh Token في قاعدة البيانات
  await this.prisma.refreshToken.create({
    data: {
      token: refreshToken,
      patientId: patient.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password, ...patientData } = patient;

  return {
    patient: patientData,
    accessToken,  // ⬅️ تغيير من token
    refreshToken, // ⬅️ جديد
  };
}

// إضافة دالة لتجديد الـ Token
async refreshAccessToken(refreshToken: string) {
  try {
    // التحقق من صحة Refresh Token
    const payload = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.JWT_SECRET,
    });

    if (payload.type !== 'patient_refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // التحقق من وجود الـ token في قاعدة البيانات
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: refreshToken,
        patientId: payload.sub,
        expiresAt: { gte: new Date() },
        isRevoked: false,
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token not found or expired');
    }

    // إنشاء Access Token جديد
    const newAccessToken = this.jwtService.sign(
      {
        sub: payload.sub,
        type: 'patient',
      },
      { expiresIn: '15m' }
    );

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

**ملف جديد:** `server-nestjs/src/patient/patient.controller.ts`

```typescript
// إضافة endpoint جديد
@Post('auth/refresh')
async refreshToken(@Body() body: { refreshToken: string }) {
  return this.patientService.refreshAccessToken(body.refreshToken);
}
```

**ملف جديد:** `server-nestjs/prisma/schema.prisma`

```prisma
// إضافة جدول جديد
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  patientId Int
  patient   Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  isRevoked Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([patientId])
  @@index([token])
}
```

#### ب) تعديل Frontend

**ملف:** `src/lib/api.ts` (إنشاء ملف جديد)

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// إنشاء Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
});

// Interceptor لإضافة Token تلقائياً
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('patient_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor للتعامل مع انتهاء صلاحية Token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // إذا كان الخطأ 401 ولم نحاول التجديد بعد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('patient_refresh_token');
        
        if (!refreshToken) {
          // لا يوجد refresh token، إعادة توجيه للتسجيل
          window.location.href = '/patient/login';
          return Promise.reject(error);
        }

        // محاولة تجديد الـ Token
        const response = await axios.post(`${API_URL}/patient/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data;

        // حفظ الـ Token الجديد
        localStorage.setItem('patient_token', accessToken);

        // إعادة المحاولة مع الـ Token الجديد
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // فشل التجديد، إعادة توجيه للتسجيل
        localStorage.removeItem('patient_token');
        localStorage.removeItem('patient_refresh_token');
        localStorage.removeItem('patient_user');
        window.location.href = '/patient/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**ملف:** `src/pages/patient/PatientLogin.tsx`

```typescript
// تعديل handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axios.post(`${API_URL}/patient/auth/login`, formData);

    // حفظ كلا الـ tokens
    localStorage.setItem('patient_token', response.data.accessToken); // ⬅️ تغيير
    localStorage.setItem('patient_refresh_token', response.data.refreshToken); // ⬅️ جديد
    localStorage.setItem('patient_user', JSON.stringify(response.data.patient));

    toast({
      title: 'مرحباً بعودتك!',
      description: 'تم تسجيل الدخول بنجاح',
    });

    navigate('/patient/dashboard');
  } catch (error: any) {
    // ... معالجة الأخطاء
  }
};
```

**الأولوية:** 🔴 عالية جداً  
**الوقت المقدر:** 4-6 ساعات  
**الصعوبة:** متوسطة

---

### 2. إضافة Rate Limiting 🛡️

**المشكلة:**
- لا يوجد حد لعدد الطلبات من نفس المستخدم/IP
- عرضة لهجمات Brute Force و DDoS

**الحل المقترح:**

#### تثبيت المكتبة

```bash
cd server-nestjs
npm install @nestjs/throttler
```

#### التكوين

**ملف:** `server-nestjs/src/app.module.ts`

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // ... الـ imports الحالية
    
    // إضافة Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 ثانية
        limit: 10,  // 10 طلبات كحد أقصى
      },
    ]),
  ],
  providers: [
    // إضافة Guard عالمي
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

#### حماية خاصة لصفحات تسجيل الدخول

**ملف:** `server-nestjs/src/patient/patient.controller.ts`

```typescript
import { Throttle } from '@nestjs/throttler';

@Controller('patient')
export class PatientController {
  // حد أقل لتسجيل الدخول (5 محاولات في الدقيقة)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('auth/login')
  async login(@Body() dto: LoginPatientDto) {
    return this.patientService.login(dto);
  }

  // حد أقل للتسجيل (3 محاولات في الدقيقة)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('auth/register')
  async register(@Body() dto: RegisterPatientDto) {
    return this.patientService.register(dto);
  }
}
```

**الأولوية:** 🔴 عالية  
**الوقت المقدر:** 1-2 ساعة  
**الصعوبة:** سهلة

---

### 3. تحسين أمان تخزين Token 🔐

**المشكلة:**
- تخزين Token في localStorage عرضة لهجمات XSS

**الحل المقترح:**

#### استخدام httpOnly Cookies

**ملف:** `server-nestjs/src/patient/patient.controller.ts`

```typescript
import { Response } from 'express';

@Post('auth/login')
async login(
  @Body() dto: LoginPatientDto,
  @Res({ passthrough: true }) response: Response
) {
  const result = await this.patientService.login(dto);

  // تعيين Refresh Token في httpOnly cookie
  response.cookie('refresh_token', result.refreshToken, {
    httpOnly: true,  // لا يمكن الوصول إليه من JavaScript
    secure: true,    // HTTPS فقط
    sameSite: 'strict', // حماية من CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
  });

  // إرجاع Access Token فقط في الـ response
  return {
    patient: result.patient,
    accessToken: result.accessToken,
  };
}
```

**ملف:** `server-nestjs/src/main.ts`

```typescript
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // إضافة cookie parser
  app.use(cookieParser());
  
  // تفعيل CORS مع credentials
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });
  
  await app.listen(3000);
}
```

**الأولوية:** 🔴 عالية  
**الوقت المقدر:** 2-3 ساعات  
**الصعوبة:** متوسطة

---

## 🟡 أولوية متوسطة (Medium Priority) - مهمة لكن غير حرجة

### 4. إضافة Input Validation شامل ✅

**المشكلة:**
- بعض الـ DTOs تفتقر للـ validation الكامل

**الحل المقترح:**

**ملف:** `server-nestjs/src/patient/patient.dto.ts`

```typescript
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional,
  IsDateString,
  IsEnum,
  Matches,
  IsPhoneNumber
} from 'class-validator';

export class RegisterPatientDto {
  @IsString({ message: 'الاسم يجب أن يكون نص' })
  @MinLength(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل' })
  @MaxLength(100, { message: 'الاسم طويل جداً' })
  fullName: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صحيح' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم',
  })
  password: string;

  @IsPhoneNumber('JO', { message: 'رقم الهاتف غير صحيح' })
  phone: string;

  @IsOptional()
  @IsDateString({}, { message: 'تاريخ الميلاد غير صحيح' })
  dateOfBirth?: string;

  @IsOptional()
  @IsEnum(['male', 'female'], { message: 'الجنس يجب أن يكون ذكر أو أنثى' })
  gender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;
}

export class CreateAppointmentDto {
  @IsInt({ message: 'معرف العيادة يجب أن يكون رقم' })
  clinicId: number;

  @IsDateString({}, { message: 'تاريخ الموعد غير صحيح' })
  appointmentDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'الملاحظات طويلة جداً' })
  notes?: string;
}
```

**ملف:** `server-nestjs/src/main.ts`

```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // تفعيل Validation عالمياً
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // إزالة الحقول غير المعرفة
      forbidNonWhitelisted: true, // رفض الطلب إذا كان يحتوي على حقول غير معرفة
      transform: true, // تحويل الأنواع تلقائياً
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );
  
  await app.listen(3000);
}
```

**الأولوية:** 🟡 متوسطة  
**الوقت المقدر:** 3-4 ساعات  
**الصعوبة:** سهلة

---

### 5. إضافة Error Handling موحد 🚨

**المشكلة:**
- معالجة الأخطاء غير موحدة

**الحل المقترح:**

**ملف جديد:** `server-nestjs/src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'حدث خطأ في الخادم';
    let errors: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      } else {
        message = exceptionResponse as string;
      }
    }

    // تسجيل الخطأ
    console.error({
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : null,
    });

    // إرجاع استجابة موحدة
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

**ملف:** `server-nestjs/src/main.ts`

```typescript
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // تطبيق Exception Filter عالمياً
  app.useGlobalFilters(new AllExceptionsFilter());
  
  await app.listen(3000);
}
```

**الأولوية:** 🟡 متوسطة  
**الوقت المقدر:** 2-3 ساعات  
**الصعوبة:** سهلة

---

### 6. إضافة Logging System 📝

**المشكلة:**
- لا يوجد نظام تسجيل شامل للأحداث

**الحل المقترح:**

#### تثبيت Winston

```bash
cd server-nestjs
npm install winston nest-winston
```

#### التكوين

**ملف جديد:** `server-nestjs/src/common/logger/logger.service.ts`

```typescript
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        // كتابة الأخطاء في ملف منفصل
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        // كتابة جميع السجلات
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
        // عرض في Console أثناء التطوير
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
```

**الاستخدام:**

```typescript
import { CustomLogger } from './common/logger/logger.service';

@Injectable()
export class PatientService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private logger: CustomLogger, // ⬅️ إضافة
  ) {}

  async login(dto: LoginPatientDto) {
    this.logger.log(`Login attempt for email: ${dto.email}`, 'PatientService');
    
    try {
      // ... الكود الحالي
      
      this.logger.log(`Login successful for patient: ${patient.id}`, 'PatientService');
      return result;
    } catch (error) {
      this.logger.error(
        `Login failed for email: ${dto.email}`,
        error.stack,
        'PatientService'
      );
      throw error;
    }
  }
}
```

**الأولوية:** 🟡 متوسطة  
**الوقت المقدر:** 3-4 ساعات  
**الصعوبة:** سهلة

---

## 🟢 أولوية منخفضة (Low Priority) - تحسينات إضافية

### 7. إضافة Unit Tests 🧪

**الحل المقترح:**

**ملف:** `server-nestjs/src/patient/patient.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PatientService } from './patient.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('PatientService', () => {
  let service: PatientService;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        {
          provide: PrismaService,
          useValue: {
            patient: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PatientService>(PatientService);
    prisma = module.get<PrismaService>(PrismaService);
    jwt = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValue({
        id: 1,
        email: 'test@test.com',
      } as any);

      await expect(
        service.register({
          email: 'test@test.com',
          password: 'Password123',
          fullName: 'Test User',
          phone: '0791234567',
        })
      ).rejects.toThrow(ConflictException);
    });

    it('should create patient successfully', async () => {
      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.patient, 'create').mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        fullName: 'Test User',
      } as any);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-token');

      const result = await service.register({
        email: 'test@test.com',
        password: 'Password123',
        fullName: 'Test User',
        phone: '0791234567',
      });

      expect(result).toHaveProperty('patient');
      expect(result).toHaveProperty('token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if patient not found', async () => {
      jest.spyOn(prisma.patient, 'findUnique').mockResolvedValue(null);

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'Password123',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
```

**تشغيل الاختبارات:**

```bash
cd server-nestjs
npm test
```

**الأولوية:** 🟢 منخفضة  
**الوقت المقدر:** 8-12 ساعة  
**الصعوبة:** متوسطة-عالية

---

### 8. إضافة Real-time Notifications 🔔

**الحل المقترح:**

#### تثبيت Socket.io

```bash
cd server-nestjs
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

#### إنشاء Gateway

**ملف جديد:** `server-nestjs/src/notifications/notifications.gateway.ts`

```typescript
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedPatients = new Map<number, string>(); // patientId -> socketId

  handleConnection(client: Socket) {
    const patientId = client.handshake.query.patientId as string;
    if (patientId) {
      this.connectedPatients.set(parseInt(patientId), client.id);
      console.log(`Patient ${patientId} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    const patientId = Array.from(this.connectedPatients.entries()).find(
      ([_, socketId]) => socketId === client.id
    )?.[0];

    if (patientId) {
      this.connectedPatients.delete(patientId);
      console.log(`Patient ${patientId} disconnected`);
    }
  }

  // إرسال إشعار لمريض محدد
  sendNotificationToPatient(patientId: number, notification: any) {
    const socketId = this.connectedPatients.get(patientId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }

  // إرسال إشعار لجميع المتصلين
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }
}
```

#### الاستخدام في Service

```typescript
@Injectable()
export class PatientAppointmentService {
  constructor(
    private prisma: PrismaService,
    private notificationsGateway: NotificationsGateway, // ⬅️ إضافة
  ) {}

  async create(patientId: number, dto: CreateAppointmentDto) {
    // ... إنشاء الموعد

    // إنشاء إشعار
    const notification = await this.prisma.notification.create({
      data: {
        patientId,
        title: 'طلب موعد جديد',
        message: 'تم إرسال طلب موعدك بنجاح',
        type: 'appointment',
      },
    });

    // إرسال إشعار فوري عبر WebSocket
    this.notificationsGateway.sendNotificationToPatient(
      patientId,
      notification
    );

    return appointment;
  }
}
```

#### Frontend Integration

```typescript
import { io } from 'socket.io-client';

// في PatientLayout.tsx
useEffect(() => {
  const user = JSON.parse(localStorage.getItem('patient_user') || '{}');
  
  if (user.id) {
    const socket = io(API_URL, {
      query: { patientId: user.id },
    });

    socket.on('notification', (notification) => {
      // عرض toast
      toast({
        title: notification.title,
        description: notification.message,
      });

      // تحديث عدد الإشعارات
      fetchUnreadCount();
    });

    return () => {
      socket.disconnect();
    };
  }
}, []);
```

**الأولوية:** 🟢 منخفضة  
**الوقت المقدر:** 6-8 ساعات  
**الصعوبة:** متوسطة

---

### 9. إضافة Caching مع Redis 🚀

**الحل المقترح:**

#### تثبيت Redis

```bash
cd server-nestjs
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store redis
```

#### التكوين

**ملف:** `server-nestjs/src/app.module.ts`

```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 300, // 5 دقائق افتراضياً
    }),
  ],
})
export class AppModule {}
```

#### الاستخدام

```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class PatientService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private prisma: PrismaService,
  ) {}

  async getClinics() {
    const cacheKey = 'clinics:all';
    
    // محاولة الحصول من Cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // جلب من قاعدة البيانات
    const clinics = await this.prisma.user.findMany({
      where: {
        role: 'USER',
        status: 'active',
        clinic_name: { not: null },
      },
    });

    // حفظ في Cache لمدة 10 دقائق
    await this.cacheManager.set(cacheKey, clinics, 600);

    return clinics;
  }

  // مسح Cache عند التحديث
  async updateClinic(id: number, data: any) {
    const updated = await this.prisma.user.update({
      where: { id },
      data,
    });

    // مسح Cache
    await this.cacheManager.del('clinics:all');

    return updated;
  }
}
```

**الأولوية:** 🟢 منخفضة  
**الوقت المقدر:** 4-6 ساعات  
**الصعوبة:** متوسطة

---

## 📊 خطة التنفيذ المقترحة

### الأسبوع الأول
- ✅ إضافة Refresh Token System
- ✅ إضافة Rate Limiting
- ✅ تحسين أمان Token Storage

### الأسبوع الثاني
- ✅ إضافة Input Validation شامل
- ✅ إضافة Error Handling موحد
- ✅ إضافة Logging System

### الأسبوع الثالث (اختياري)
- ⭕ إضافة Unit Tests
- ⭕ إضافة Real-time Notifications
- ⭕ إضافة Caching

---

## 🎯 الخلاصة

**يجب تنفيذها قبل الإطلاق:**
1. Refresh Token System
2. Rate Limiting
3. تحسين أمان Token

**مهمة لكن يمكن تأجيلها:**
4. Input Validation
5. Error Handling
6. Logging System

**تحسينات إضافية:**
7. Unit Tests
8. Real-time Notifications
9. Caching

---

**تم إعداد هذا الدليل بواسطة:** AI Code Review System  
**التاريخ:** 2026-02-07  
**الحالة:** جاهز للتطبيق
