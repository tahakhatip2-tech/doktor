import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { WhatsAppModule } from './whatsapp/whatsapp.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ExtractorModule } from './extractor/extractor.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GroupsModule } from './groups/groups.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PatientModule } from './patient/patient.module';
import { InternalChatModule } from './internal-chat/internal-chat.module';
import { OffersModule } from './offers/offers.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/api/uploads',
    }),
    PrismaModule,
    AuthModule,
    ContactsModule,
    WhatsAppModule,
    AppointmentsModule,
    ExtractorModule,
    NotificationsModule,
    GroupsModule,
    SubscriptionsModule,
    PatientModule,
    InternalChatModule,
    OffersModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
