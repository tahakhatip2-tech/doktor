import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve local uploads under /uploads/ and /api/uploads/ (fallback storage when Supabase is unavailable)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
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
