import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Patch,
    UseGuards,
    Request,
    ParseIntPipe,
} from '@nestjs/common';
import { InternalChatService } from './internal-chat.service';
import { SendMessageDto } from './dto/internal-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PatientAuthGuard } from '../patient/patient-auth.guard';

// ─── للطبيب/الإداري ──────────────────────────────────────────────────────────

@Controller('internal-chat')
@UseGuards(JwtAuthGuard)
export class InternalChatDoctorController {
    constructor(private readonly chatService: InternalChatService) { }

    @Get('conversations')
    getMyConversations(@Request() req) {
        return this.chatService.getDoctorConversations(req.user.id);
    }

    @Get('conversations/:id')
    getConversation(@Param('id', ParseIntPipe) id: number) {
        return this.chatService.getConversationMessages(id);
    }

    @Post('conversations/:id/messages')
    sendMessage(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SendMessageDto,
        @Request() req,
    ) {
        return this.chatService.sendMessageAsDoctor(id, req.user.id, dto.content);
    }

    @Patch('conversations/:id/read')
    markAsRead(@Param('id', ParseIntPipe) id: number) {
        return this.chatService.markAsRead(id, 'doctor');
    }

    @Get('unread-count')
    getUnreadCount(@Request() req) {
        return this.chatService.getUnreadCountForDoctor(req.user.id);
    }
}

// ─── للمريض ──────────────────────────────────────────────────────────────────

@Controller('patient/chat')
@UseGuards(PatientAuthGuard)
export class InternalChatPatientController {
    constructor(private readonly chatService: InternalChatService) { }

    @Get('clinics/:clinicId')
    getOrCreateConversation(
        @Param('clinicId', ParseIntPipe) clinicId: number,
        @Request() req,
    ) {
        return this.chatService.getOrCreateConversation(clinicId, req.user.id);
    }

    @Get('conversations')
    getMyConversations(@Request() req) {
        return this.chatService.getPatientConversations(req.user.id);
    }

    @Get('conversations/:id')
    getConversation(@Param('id', ParseIntPipe) id: number) {
        return this.chatService.getConversationMessages(id);
    }

    @Post('conversations/:id/messages')
    sendMessage(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: SendMessageDto,
        @Request() req,
    ) {
        return this.chatService.sendMessageAsPatient(id, req.user.id, dto.content);
    }

    @Patch('conversations/:id/read')
    markAsRead(@Param('id', ParseIntPipe) id: number) {
        return this.chatService.markAsRead(id, 'patient');
    }

    @Get('unread-count')
    getUnreadCount(@Request() req) {
        return this.chatService.getUnreadCountForPatient(req.user.id);
    }
}
