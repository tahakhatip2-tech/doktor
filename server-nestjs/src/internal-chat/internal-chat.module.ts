import { Module } from '@nestjs/common';
import { InternalChatService } from './internal-chat.service';
import {
    InternalChatDoctorController,
    InternalChatPatientController,
} from './internal-chat.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
    imports: [
        PrismaModule,
        NotificationsModule,
        WhatsAppModule,
        AppointmentsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow('JWT_SECRET'),
            }),
            inject: [ConfigService],
        }),
        ConfigModule,
    ],
    controllers: [InternalChatDoctorController, InternalChatPatientController],
    providers: [InternalChatService],
    exports: [InternalChatService],
})
export class InternalChatModule { }
