import { Module, forwardRef } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { AiService } from './ai.service';
import { AppointmentsModule } from '../appointments/appointments.module';

import { SupabaseService } from '../storage/supabase.service';

@Module({
  imports: [forwardRef(() => AppointmentsModule)],
  providers: [WhatsAppService, AiService, SupabaseService],
  controllers: [WhatsAppController],
  exports: [WhatsAppService],
})
export class WhatsAppModule { }
