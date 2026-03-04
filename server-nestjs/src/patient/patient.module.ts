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
import { PrismaModule } from '../prisma/prisma.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
    imports: [
        PrismaModule,
        ConfigModule,
        forwardRef(() => AppointmentsModule),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                // نفس الـ secret المستخدم في AuthModule للتوحيد
                secret: config.getOrThrow<string>('JWT_SECRET'),
                signOptions: { expiresIn: '30d' },
            }),
        }),
    ],
    controllers: [PatientController, PatientAppointmentController, PatientNotificationController],
    providers: [PatientService, PatientAppointmentService, PatientNotificationService, PatientAuthGuard],
    exports: [PatientService, PatientAppointmentService, PatientNotificationService],
})
export class PatientModule { }

