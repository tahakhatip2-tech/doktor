import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { InternalSenderType } from '@prisma/client';

import { AiService } from '../whatsapp/ai.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Injectable()
export class InternalChatService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway,
        private aiService: AiService,
        private appointmentsService: AppointmentsService,
    ) { }

    // ─── مساعد لبناء كائن العيادة الكامل من الإعدادات ───────────────────────
    private resolveClinicInfo(clinic: any) {
        const settingsMap: Record<string, string> = {};
        (clinic.settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });
        return {
            id: clinic.id,
            name: clinic.name,
            clinic_name: settingsMap['clinic_name'] || clinic.clinic_name || clinic.name,
            clinic_specialty: settingsMap['clinic_specialty'] || null,
            clinic_logo: settingsMap['clinic_logo'] || clinic.avatar || null,
        };
    }

    private get clinicSelect() {
        return {
            id: true,
            name: true,
            clinic_name: true,
            avatar: true,
            settings: {
                where: { key: { in: ['clinic_name', 'clinic_specialty', 'clinic_logo'] } },
                select: { key: true, value: true },
            },
        };
    }

    // ─── الحصول على أو إنشاء محادثة ──────────────────────────────────────────
    async getOrCreateConversation(clinicId: number, patientId: number) {
        let conversation = await this.prisma.internalConversation.findUnique({
            where: { clinicId_patientId: { clinicId, patientId } },
            include: {
                clinic: { select: this.clinicSelect },
                patient: { select: { id: true, fullName: true, phone: true } },
                messages: { orderBy: { createdAt: 'asc' }, take: 50 },
            },
        });

        if (!conversation) {
            conversation = await this.prisma.internalConversation.create({
                data: { clinicId, patientId },
                include: {
                    clinic: { select: this.clinicSelect },
                    patient: { select: { id: true, fullName: true, phone: true } },
                    messages: { orderBy: { createdAt: 'asc' }, take: 50 },
                },
            });
        }

        return {
            ...conversation,
            clinic: this.resolveClinicInfo(conversation.clinic),
        };
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
        const conversations = await this.prisma.internalConversation.findMany({
            where: { patientId },
            include: {
                clinic: { select: this.clinicSelect },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });

        return conversations.map(conv => ({
            ...conv,
            clinic: this.resolveClinicInfo(conv.clinic),
        }));
    }

    // ─── رسائل محادثة بعينها ─────────────────────────────────────────────────
    async getConversationMessages(conversationId: number) {
        const conversation = await this.prisma.internalConversation.findUnique({
            where: { id: conversationId },
            include: {
                clinic: { select: this.clinicSelect },
                patient: { select: { id: true, fullName: true, phone: true } },
                messages: { orderBy: { createdAt: 'asc' } },
            },
        });

        if (!conversation) throw new NotFoundException('المحادثة غير موجودة');
        return {
            ...conversation,
            clinic: this.resolveClinicInfo(conversation.clinic),
        };
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

        // استدعاء الموظف الآلي
        this.triggerBotReply(conversation, conversationId, content);

        return message;
    }

    // ─── رد الموظف الآلي ──────────────────────────────────────
    private async triggerBotReply(
        conversation: any,
        conversationId: number,
        patientMessage: string,
    ) {
        // جلب إعدادات العيادة
        const clinic = await this.prisma.user.findUnique({
            where: { id: conversation.clinicId },
            select: { auto_reply_enabled: true, clinic_name: true },
        });

        // إذا كان الذكاء الاصطناعي مفعلاً، يتم إسناد الرد له لاستكمال الحجز
        const settings = await this.prisma.setting.findMany({ where: { userId: conversation.clinicId } });
        const aiEnabledVal = settings.find(s => s.key === 'ai_enabled')?.value;
        const aiEnabled = aiEnabledVal === undefined || aiEnabledVal === '1' || aiEnabledVal === 'true';

        console.log(`[InternalChat] Fetching settings for clinic ${conversation.clinicId}. ai_enabled:`, aiEnabledVal, 'Resolved:', aiEnabled);

        let botReply = '';

        if (aiEnabled) {
            // جلب سجل المحادثة الداخلي وتمريره للذكاء الاصطناعي
            const history = await this.prisma.internalMessage.findMany({
                where: { conversationId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });
            const historyStr = history.reverse().map(h => `${h.senderType === 'DOCTOR' || h.senderType === 'BOT' ? 'Secretary' : 'Patient'}: ${h.content}`).join('\n');

            const patient = await this.prisma.patient.findUnique({ where: { id: conversation.patientId } });
            const patientName = patient?.fullName || 'المريض';
            const patientPhone = patient?.phone || 'غير محدد';

            const aiResponseRaw = await this.aiService.getAIResponse(
                conversation.clinicId,
                patientMessage,
                patientPhone,
                patientName,
                undefined,
                historyStr
            );
            
            console.log('[InternalChat] AI Response:', aiResponseRaw);

            if (aiResponseRaw) {
                // استخراج ومعالجة أوامر الحجز من نص الذكاء الاصطناعي
                botReply = await this.extractAndProcessAppointments(conversation.clinicId, conversation.patientId, aiResponseRaw, patientPhone, patientName);
            }
        } else {
            console.log('[InternalChat] AI is Disabled for clinic:', conversation.clinicId);
        }

        // إذا فشل الذكاء الاصطناعي ولم يتمكن من الرد وكان الرد التلقائي البسيط مفعلاً كبديل (وفقط إذا كان الطبيب غير متصل)
        if (!botReply && clinic?.auto_reply_enabled) {
            const doctorOnline = this.notificationsGateway.isUserOnline(conversation.clinicId);
            if (!doctorOnline) {
                botReply = `شكراً لتواصلك مع ${clinic.clinic_name || 'العيادة'}. سيتم الرد على رسالتك في أقرب وقت من قبل الطاقم الطبي.`;
            }
        }

        if (!botReply) return;

        // تأخير بسيط لمحاكاة الكتابة
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
        }, 1500);
    }

    private async extractAndProcessAppointments(
        clinicId: number,
        patientId: number,
        text: string,
        phone: string,
        customerName: string,
    ): Promise<string> {
        let processedText = text;
        const appointmentRegex = /\[\[APPOINTMENT:\s*([^|]*)?\|\s*([^|]*)?\|\s*([^|]*)?\|\s*([^\]]*)?\]\]/g;
        let match;

        while ((match = appointmentRegex.exec(text)) !== null) {
            const [fullMatch, dateStr, timeStr, name, notes] = match;

            try {
                const date = dateStr?.trim();
                const time = timeStr?.trim();
                const appointmentNotes = (notes?.trim() || '') + ' [BOT-INTERNAL]';

                if (date && time) {
                    let finalDateStr = date;
                    let finalTimeStr = time;

                    if (time.includes('PM') || time.includes('م') || time.includes('ظهراً') || time.includes('مساءً')) {
                        let [h, m] = time.replace(/[^\d:]/g, '').split(':');
                        let hour = parseInt(h);
                        if (hour < 12) hour += 12;
                        finalTimeStr = `${hour.toString().padStart(2, '0')}:${m || '00'}`;
                    }

                    const appointmentDate = new Date(`${finalDateStr}T${finalTimeStr}:00`);

                    if (!isNaN(appointmentDate.getTime())) {
                        const isAvailable = await this.appointmentsService.isSlotAvailable(clinicId, appointmentDate, 30);
                        if (!isAvailable) {
                            processedText = processedText.replace(fullMatch, '\n\n(عذراً، هذا الموعد تم حجزه لتوه أو غير متاح. الرجاء اختيار وقت آخر)');
                            continue;
                        }

                        // إنشاء اتصال جهة الاتصال (Contact) للربط مع العيادة
                        const contact = await this.prisma.contact.upsert({
                            where: { userId_phone: { userId: clinicId, phone } },
                            update: { status: 'active', name: customerName },
                            create: {
                                userId: clinicId,
                                phone,
                                name: customerName,
                                platform: 'app',
                                status: 'active',
                            },
                        });

                        // الحجز المباشر
                        await this.prisma.appointment.create({
                            data: {
                                userId: clinicId,
                                patientId: contact.id,
                                patientUserId: patientId,
                                phone,
                                customerName: name?.trim() || customerName,
                                appointmentDate,
                                notes: appointmentNotes,
                                status: 'confirmed',
                            },
                        });

                        // الإشعارات
                        await this.prisma.notification.create({
                            data: {
                                userId: clinicId,
                                type: 'NEW_APPOINTMENT',
                                title: 'موعد جديد عبر التطبيق',
                                message: `تم حجز موعد لـ ${customerName} في ${appointmentDate.toLocaleString('ar-EG')} عبر الموظف الآلي للمحادثات المباشرة`,
                                priority: 'HIGH',
                            },
                        }).catch(() => { });

                        await this.prisma.patientNotification.create({
                            data: {
                                patientId: patientId,
                                type: 'appointment_created',
                                title: 'تم تأكيد موعدك',
                                message: `تم حجز موعدك بنجاح في ${appointmentDate.toLocaleString('ar-EG')}`,
                            },
                        }).catch(() => { });

                        processedText = processedText.replace(fullMatch, '\n\n(✅ تم تأكيد حجز الموعد بنجاح على النظام)');
                    }
                }
            } catch (err) {
                processedText = processedText.replace(fullMatch, '');
                console.error('Bot appointment extraction failed:', err);
            }
        }
        return processedText;
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
