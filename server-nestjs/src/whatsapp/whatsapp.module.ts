import { Module, forwardRef } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { AiService } from './ai.service';
import { AppointmentsModule } from '../appointments/appointments.module';
import { WhatsAppCronService } from './whatsapp.cron';

import { SupabaseService } from '../storage/supabase.service';

@Module({
  imports: [forwardRef(() => AppointmentsModule)],
  providers: [WhatsAppService, AiService, SupabaseService, WhatsAppCronService],
  controllers: [WhatsAppController],
  exports: [WhatsAppService, AiService],
})
export class WhatsAppModule { }
