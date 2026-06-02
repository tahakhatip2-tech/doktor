import { Module } from '@nestjs/common';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { SupabaseService } from '../storage/supabase.service';
import { InternalChatModule } from '../internal-chat/internal-chat.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'fallback_secret',
      signOptions: { expiresIn: '7d' },
    }),
    InternalChatModule,
  ],
  controllers: [PharmacyController],
  providers: [PharmacyService, SupabaseService],
  exports: [PharmacyService],
})
export class PharmacyModule {}
