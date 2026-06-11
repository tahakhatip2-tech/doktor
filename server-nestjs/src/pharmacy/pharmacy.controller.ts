import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PharmacyService } from './pharmacy.service';
import { InternalChatService } from '../internal-chat/internal-chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdatePharmacySettingsDto } from './dto/update-settings.dto';
import { SupabaseService } from '../storage/supabase.service';

@Controller('pharmacy')
export class PharmacyController {
  private readonly logger = new Logger(PharmacyController.name);

  constructor(
    private readonly pharmacyService: PharmacyService,
    private readonly supabaseService: SupabaseService,
    private readonly chatService: InternalChatService,
  ) {}

  @Post('auth/register')
  async register(@Body() body: any) {
    return this.pharmacyService.register(body);
  }

  @Post('auth/login')
  async login(@Body() body: any) {
    return this.pharmacyService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.pharmacyService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.pharmacyService.getDashboardStats(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('prescriptions')
  async getPrescriptions(@Request() req, @Body('status') status?: string) {
    return this.pharmacyService.getPrescriptions(req.user.id, status);
  }

  @Get('prescriptions/:id')
  async getPrescriptionById(@Request() req, @Param('id') id: string) {
    return this.pharmacyService.getPrescriptionById(req.user.id, parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('prescriptions/:id/dispense')
  async dispensePrescription(@Request() req, @Param('id') id: string) {
    return this.pharmacyService.dispensePrescription(req.user.id, parseInt(id));
  }

  @UseGuards(JwtAuthGuard)
  @Get('settings')
  async getSettings(@Request() req) {
    return this.pharmacyService.getSettings(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('settings')
  async updateSettings(@Request() req, @Body() body: UpdatePharmacySettingsDto) {
    return this.pharmacyService.updateSettings(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-logo')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname)) {
          return cb(new BadRequestException('صيغة الملف غير مدعومة. الرجاء اختيار صورة JPG/PNG/WEBP/GIF.'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadLogo(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('لم يتم اختيار ملف');
    }

    try {
      const url = await this.supabaseService.uploadFile(file, 'pharmacy');
      const updated = await this.pharmacyService.updateAvatar(req.user.id, url);
      return { avatar: url, url, pharmacy: updated };
    } catch (err: any) {
      this.logger.error(`Pharmacy logo upload failed: ${err?.message || err}`, err?.stack);
      throw new InternalServerErrorException(
        err?.message || 'فشل رفع الشعار. حاول مرة أخرى.',
      );
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // ─── PHARMACY CHAT ENDPOINTS ───────────────────────────────────────────
  // ════════════════════════════════════════════════════════════════════════

  @UseGuards(JwtAuthGuard)
  @Get('chat/patients')
  async getChatPatients(@Request() req) {
    return this.chatService.getPharmacyPatients(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/conversations')
  async getConversations(@Request() req) {
    return this.chatService.getPharmacyConversations(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/conversations/:patientId')
  async getOrCreateConversation(
    @Request() req,
    @Param('patientId', ParseIntPipe) patientId: number,
  ) {
    return this.chatService.getOrCreatePharmacyConversation(req.user.id, patientId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/messages/:conversationId')
  async getMessages(
    @Request() req,
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const conv = await this.chatService.getConversationMessages(conversationId);
    if (conv.clinicId !== req.user.id) {
      throw new BadRequestException('غير مصرح لك بالوصول إلى هذه المحادثة');
    }
    return conv;
  }

  @UseGuards(JwtAuthGuard)
  @Post('chat/messages/:conversationId')
  async sendMessage(
    @Request() req,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Body() body: { content: string },
  ) {
    const content = String(body?.content || '').trim();
    if (!content) {
      throw new BadRequestException('الرسالة لا يمكن أن تكون فارغة');
    }
    return this.chatService.sendMessageAsPharmacy(conversationId, req.user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('chat/conversations/:id/read')
  async markAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const conv = await this.chatService.getConversationMessages(id);
    if (conv.clinicId !== req.user.id) {
      throw new BadRequestException('غير مصرح لك');
    }
    return this.chatService.markAsRead(id, 'doctor');
  }

  @UseGuards(JwtAuthGuard)
  @Get('chat/unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadCountForPharmacy(req.user.id);
    return { count };
  }
}
