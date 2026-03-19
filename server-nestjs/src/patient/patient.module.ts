import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import { PatientAuthGuard } from './patient-auth.guard';
import { PatientAppointmentController } from './patient-appointment.controller';
import { PatientAppointmentService } from './patient-appointment.service';
import { PatientNotificationController } from './patient-notification.controller';
import { PatientNotificationService } from './patient-notification.service';
import { PatientReviewsController } from './patient-reviews.controller';
import { PatientReviewsService } from './patient-reviews.service';
import { PublicClinicController } from './public-clinic.controller';

import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentsModule } from '../appointments/appointments.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { AiService } from '../whatsapp/ai.service';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        forwardRef(() => AppointmentsModule),
        forwardRef(() => WhatsAppModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '30d' },
            }),
        }),
    ],
    controllers: [
        PatientController,
        PatientAppointmentController,
        PatientNotificationController,
        PatientReviewsController,
        PublicClinicController,
    ],
    providers: [
        PatientService,
        PatientAppointmentService,
        PatientNotificationService,
        PatientAuthGuard,
        PatientReviewsService,
    ],
    exports: [PatientService, PatientAppointmentService, PatientNotificationService],
})
export class PatientModule { }


