import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Enable ValidationPipe for global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,           // إزالة الحقول غير الموجودة في DTO
    forbidNonWhitelisted: true, // رفض الطلب إذا أُرسلت حقول غير معروفة
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  app.enableCors({
    origin: (origin, callback) => {
      const isProduction = process.env.NODE_ENV === 'production';

      const allowedOrigins = [
        'https://hakeem-jordan-jordan.vercel.app',
        'https://hakeemjordanjo.vercel.app',
        'https://hakeem-jordan-five.vercel.app',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://localhost:3000',
      ];

      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Vercel preview deployments
      if (origin.endsWith('.vercel.app')) return callback(null, true);

      // ngrok — للتطوير والعروض التجريبية
      if (origin.includes('ngrok-free.app') || origin.includes('ngrok.io') || origin.includes('ngrok-free.dev')) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (!isProduction) {
        // في التطوير: اسمح بكل شيء مع تسجيل
        console.warn(`[CORS] ⚠️ Request from unknown origin in DEV: ${origin}`);
        return callback(null, true);
      }

      // في الإنتاج: ارفض
      console.error(`[CORS] ❌ Blocked origin in PROD: ${origin}`);
      callback(new Error(`CORS: Origin not allowed: ${origin}`), false);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, ngrok-skip-browser-warning, bypass-tunnel-reminder, X-Requested-With, sentry-trace, baggage',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Hakeem Jordan API')
    .setDescription(`
      # نظام إدارة العيادات الذكي - Hakeem Jordan API
      
      ## 🏥 نظرة عامة
      API شامل لإدارة العيادات الطبية مع تكامل الذكاء الاصطناعي وواتساب.
      
      ## 🔐 المصادقة
      جميع الـ Endpoints المحمية تحتاج إلى JWT Token في الـ Header:
      \`\`\`
      Authorization: Bearer <your-token>
      \`\`\`
      
      ## 📱 المميزات الرئيسية
      - **إدارة المواعيد**: حجز، تعديل، إلغاء المواعيد
      - **إدارة المرضى**: ملفات طبية، وصفات، تاريخ مرضي
      - **واتساب AI**: سكرتير آلي ذكي للرد على الرسائل
      - **التقارير**: إحصائيات وتقارير مالية
      
      ## 🌐 Base URL
      - **Production**: https://your-domain.com/api
      - **Development**: http://localhost:3000/api
    `)
    .setVersion('1.0')
    .addTag('Auth', 'نقاط الدخول للمصادقة والتسجيل')
    .addTag('Appointments', 'إدارة المواعيد والحجوزات')
    .addTag('Contacts', 'إدارة المرضى وجهات الاتصال')
    .addTag('WhatsApp', 'تكامل واتساب والرسائل')
    .addTag('Notifications', 'إدارة الإشعارات')
    .addTag('Groups', 'إدارة المجموعات')
    .addTag('Subscriptions', 'إدارة الاشتراكات والباقات')
    .addTag('Extractor', 'استخراج البيانات من المنصات')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'أدخل JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('https://your-production-url.com', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Hakeem Jordan API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 50px 0 }
      .swagger-ui .info .title { color: #1976d2 }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 API Documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
