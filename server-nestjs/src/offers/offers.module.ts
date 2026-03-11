import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController, PatientOffersController } from './offers.controller';
import { PrismaService } from '../prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: () => ({
                secret: process.env.JWT_SECRET || 'super-secret-key-hakeem-jordan-2026',
                signOptions: { expiresIn: '30d' },
            }),
        }),
    ],
    controllers: [OffersController, PatientOffersController],
    providers: [OffersService, PrismaService],
})
export class OffersModule {}
