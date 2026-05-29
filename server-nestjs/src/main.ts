import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { join, resolve } from 'path';
import * as fs from 'fs';

// ─── Global Baileys Crypto Error Handler ────────────────────────────────────
// Catches the "Unsupported state or unable to authenticate data" error thrown
// deep inside Baileys WebSocket handlers. Clears the corrupted session so the
// next startup performs a fresh QR-code scan instead of looping endlessly.
process.on('uncaughtException', (err: Error) => {
  const isBaileysCrypto =
    err.message?.includes('Unsupported state or unable to authenticate data') ||
    err.message?.includes('aesDecryptGCM') ||
    err.stack?.includes('noise-handler');

  if (isBaileysCrypto) {
    const logger = new Logger('BaileysRecovery');
    logger.error('💥 Baileys crypto error detected — clearing corrupted sessions and restarting...');

    // Clear all session folders so the next boot starts fresh
    const sessionsDir = resolve(process.cwd(), 'sessions');
    if (fs.existsSync(sessionsDir)) {
      const folders = fs.readdirSync(sessionsDir);
      for (const folder of folders) {
        const folderPath = resolve(sessionsDir, folder);
        try {
          fs.rmSync(folderPath, { recursive: true, force: true });
          logger.warn(`🗑️  Deleted corrupted session: ${folder}`);
        } catch (e) {
          logger.error(`Failed to delete session ${folder}: ${e.message}`);
        }
      }
    }

    logger.warn('♻️  Exiting process — nodemon/PM2 will restart automatically.');
    process.exit(1);
  }

  // For any other uncaught exception, just log it without crashing
  console.error('[UncaughtException]', err);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[UnhandledRejection]', reason);
});

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Increase payload size limits for base64 images
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Serve local uploads under /uploads/ and /api/uploads/ (fallback storage when Supabase is unavailable)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads/',
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
    origin: true, // السماح بجميع النطاقات في بيئة التطوير
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, ngrok-skip-browser-warning, bypass-tunnel-reminder, Bypass-Tunnel-Reminder, X-Requested-With, sentry-trace, baggage, sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
