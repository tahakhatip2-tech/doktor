import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InternalSenderType } from '@prisma/client';

@Injectable()
export class InternalChatService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
    ) { }

    // ─── الحصول على أو إنشاء محادثة ──────────────────────────────────────────
    async getOrCreateConversation(clinicId: number, patientId: number) {
        let conversation = await this.prisma.internalConversation.findUnique({
            where: { clinicId_patientId: { clinicId, patientId } },
            include: {
                clinic: { select: { id: true, name: true, clinic_name: true } },
                patient: { select: { id: true, fullName: true, phone: true } },
                messages: {
                    orderBy: { createdAt: 'asc' },
                    take: 50,
                },
            },
        });

        if (!conversation) {
            conversation = await this.prisma.internalConversation.create({
                data: { clinicId, patientId },
                include: {
                    clinic: { select: { id: true, name: true, clinic_name: true } },
                    patient: { select: { id: true, fullName: true, phone: true } },
                    messages: { orderBy: { createdAt: 'asc' }, take: 50 },
                },
            });
        }

        return conversation;
    }

    // ─── قائمة محادثات الطبيب ────────────────────────────────────────────────
    async getDoctorConversations(clinicId: number) {
        return this.prisma.internalConversation.findMany({
            where: { clinicId },
            include: {
                patient: { select: { id: true, fullName: true, phone: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1, // آخر رسالة فقط للعرض في القائمة
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    // ─── قائمة محادثات المريض ────────────────────────────────────────────────
    async getPatientConversations(patientId: number) {
        return this.prisma.internalConversation.findMany({
            where: { patientId },
            include: {
                clinic: { select: { id: true, name: true, clinic_name: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    // ─── رسائل محادثة بعينها ─────────────────────────────────────────────────
    async getConversationMessages(conversationId: number) {
        const conversation = await this.prisma.internalConversation.findUnique({
            where: { id: conversationId },
            include: {
                clinic: { select: { id: true, name: true, clinic_name: true } },
                patient: { select: { id: true, fullName: true, phone: true } },
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });

        if (!conversation) throw new NotFoundException('المحادثة غير موجودة');
        return conversation;
    }

    // ─── إرسال رسالة من الطبيب ───────────────────────────────────────────────
    async sendMessageAsDoctor(
        conversationId: number,
        doctorId: number,
        content: string,
    ) {
        const conversation = await this.prisma.internalConversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) throw new NotFoundException('المحادثة غير موجودة');
        if (conversation.clinicId !== doctorId)
            throw new ForbiddenException('غير مصرح لك');

        const message = await this.prisma.internalMessage.create({
            data: {
                conversationId,
                content,
                senderType: InternalSenderType.DOCTOR,
                senderId: doctorId,
            },
        });

        // تحديث updatedAt للمحادثة
        await this.prisma.internalConversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        // Socket إشعار real-time للمريض
        this.notificationsGateway.sendInternalMessage(
            'patient',
            conversation.patientId,
            {
                conversationId,
                message,
            },
        );

        return message;
    }

    // ─── إرسال رسالة من المريض ───────────────────────────────────────────────
    async sendMessageAsPatient(
        conversationId: number,
        patientId: number,
        content: string,
    ) {
        const conversation = await this.prisma.internalConversation.findUnique({
            where: { id: conversationId },
        });

        if (!conversation) throw new NotFoundException('المحادثة غير موجودة');
        if (conversation.patientId !== patientId)
            throw new ForbiddenException('غير مصرح لك');

        const message = await this.prisma.internalMessage.create({
            data: {
                conversationId,
                content,
                senderType: InternalSenderType.PATIENT,
                senderId: patientId,
            },
        });

        // تحديث updatedAt
        await this.prisma.internalConversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        // Socket إشعار real-time للطبيب
        this.notificationsGateway.sendInternalMessage(
            'doctor',
            conversation.clinicId,
            {
                conversationId,
                message,
            },
        );

        // رد تلقائي بالذكاء الاصطناعي إذا الطبيب غير متصل
        this.triggerBotReplyIfOffline(conversation, conversationId, content);

        return message;
    }

    // ─── رد الموظف الآلي إذا الطبيب غير متصل ────────────────────────────────
    private async triggerBotReplyIfOffline(
        conversation: any,
        conversationId: number,
        patientMessage: string,
    ) {
        // تحقق إذا الطبيب متصل حالياً
        const doctorOnline =
            this.notificationsGateway.isUserOnline(conversation.clinicId);

        if (doctorOnline) return; // الطبيب متصل — لا حاجة للرد الآلي

        // جلب إعدادات العيادة
        const clinic = await this.prisma.user.findUnique({
            where: { id: conversation.clinicId },
            select: { auto_reply_enabled: true, ai_system_instruction: true, clinic_name: true },
        });

        if (!clinic?.auto_reply_enabled) return;

        // رد تلقائي بسيط (يمكن ربطه بـ Gemini لاحقاً)
        const botReply =
            `شكراً لتواصلك مع ${clinic.clinic_name || 'العيادة'}. ` +
            `سيتم الرد على رسالتك في أقرب وقت من قبل الطاقم الطبي. ` +
            `يمكنك أيضاً الاتصال بنا مباشرة لأي استفسار عاجل.`;

        // تأخير 3 ثوانٍ ليبدو طبيعياً
        setTimeout(async () => {
            try {
                const botMessage = await this.prisma.internalMessage.create({
                    data: {
                        conversationId,
                        content: botReply,
                        senderType: InternalSenderType.BOT,
                    },
                });

                await this.prisma.internalConversation.update({
                    where: { id: conversationId },
                    data: { updatedAt: new Date() },
                });

                // إرسال رد البوت للمريض
                this.notificationsGateway.sendInternalMessage(
                    'patient',
                    conversation.patientId,
                    { conversationId, message: botMessage },
                );
            } catch (e) {
                console.error('[InternalChat] Bot reply error:', e);
            }
        }, 3000);
    }

    // ─── تمييز المحادثة كمقروءة ──────────────────────────────────────────────
    async markAsRead(conversationId: number, readerType: 'doctor' | 'patient') {
        const notSenderType =
            readerType === 'doctor'
                ? InternalSenderType.PATIENT
                : InternalSenderType.DOCTOR;

        await this.prisma.internalMessage.updateMany({
            where: {
                conversationId,
                senderType: notSenderType,
                isRead: false,
            },
            data: { isRead: true },
        });

        return { success: true };
    }

    // ─── عدد الرسائل غير المقروءة للطبيب ────────────────────────────────────
    async getUnreadCountForDoctor(clinicId: number): Promise<number> {
        return this.prisma.internalMessage.count({
            where: {
                conversation: { clinicId },
                senderType: InternalSenderType.PATIENT,
                isRead: false,
            },
        });
    }
}
