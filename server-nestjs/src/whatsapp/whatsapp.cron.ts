import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from './whatsapp.service';

@Injectable()
export class WhatsAppCronService {
    private readonly logger = new Logger(WhatsAppCronService.name);

    constructor(
        private prisma: PrismaService,
        private whatsAppService: WhatsAppService,
    ) { }

    // ─── يعمل كل 10 دقائق ──────────────────────────────────────────────────
    @Cron('*/10 * * * *')
    async handleAppointmentReminders() {
        this.logger.log('[Cron] Checking for appointment reminders...');
        const now = new Date();

        await Promise.all([
            this.send24hReminders(now),
            this.send1hReminders(now),
        ]);
    }

    // ─── تذكير قبل 24 ساعة ──────────────────────────────────────────────────
    private async send24hReminders(now: Date) {
        const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000); // بعد 23 ساعة
        const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);   // بعد 25 ساعة

        const appointments = await this.prisma.appointment.findMany({
            where: {
                appointmentDate: { gte: windowStart, lte: windowEnd },
                reminder24hSent: false,
                status: { notIn: ['cancelled', 'completed', 'no-show'] },
            },
        });

        this.logger.log(`[Cron 24h] Found ${appointments.length} appointments needing 24h reminder`);

        for (const apt of appointments) {
            try {
                const dateStr = new Date(apt.appointmentDate).toLocaleDateString('ar-JO', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                });
                const timeStr = new Date(apt.appointmentDate).toLocaleTimeString('ar-JO', {
                    hour: '2-digit', minute: '2-digit',
                });

                const message = `مرحباً ${apt.customerName || 'عزيزنا المريض'} 👋\n\nنذكّركم بأن لديكم موعداً في عيادتنا غداً:\n📅 ${dateStr}\n⏰ الساعة: ${timeStr}\n\nيُرجى الحضور قبل الموعد بـ 10 دقائق. إذا أردت إلغاء أو تأجيل موعدك، يُرجى إبلاغنا. 🙏`;

                // ─── إرسال رسالة واتساب ─────────────────────────────────────────
                if (apt.userId && apt.phone) {
                    const sock = this.whatsAppService.getSocket(apt.userId);
                    if (sock) {
                        const phone = apt.phone.includes('@') ? apt.phone : `${apt.phone}@s.whatsapp.net`;
                        await sock.sendMessage(phone, { text: message });
                        this.logger.log(`[Cron 24h] ✅ WhatsApp reminder sent to ${apt.phone}`);
                    } else {
                        this.logger.warn(`[Cron 24h] WhatsApp not connected for user ${apt.userId}`);
                    }
                }

                // ─── إشعار داخلي للطبيب ─────────────────────────────────────────
                if (apt.userId) {
                    await this.prisma.notification.create({
                        data: {
                            userId: apt.userId,
                            type: 'REMINDER_24H',
                            title: '⏰ تذكير بموعد غداً',
                            message: `موعد ${apt.customerName || 'مريض'} غداً الساعة ${timeStr}`,
                            priority: 'MEDIUM',
                            appointmentId: apt.id,
                        },
                    });
                }

                // ─── إشعار للمريض في بوابة المرضى ──────────────────────────────
                if (apt.patientUserId) {
                    await this.prisma.patientNotification.create({
                        data: {
                            patientId: apt.patientUserId,
                            type: 'reminder_24h',
                            title: '⏰ تذكير: موعدك غداً',
                            message: `لديك موعد غداً ${dateStr} الساعة ${timeStr}`,
                        },
                    });
                }

                // ─── تحديث الحالة ───────────────────────────────────────────────
                await this.prisma.appointment.update({
                    where: { id: apt.id },
                    data: { reminder24hSent: true },
                });

            } catch (err) {
                this.logger.error(`[Cron 24h] Failed for appointment ${apt.id}: ${err.message}`);
            }
        }
    }

    // ─── تذكير قبل ساعة واحدة ──────────────────────────────────────────────
    private async send1hReminders(now: Date) {
        const windowStart = new Date(now.getTime() + 50 * 60 * 1000);  // بعد 50 دقيقة
        const windowEnd = new Date(now.getTime() + 70 * 60 * 1000);    // بعد 70 دقيقة

        const appointments = await this.prisma.appointment.findMany({
            where: {
                appointmentDate: { gte: windowStart, lte: windowEnd },
                reminder1hSent: false,
                status: { notIn: ['cancelled', 'completed', 'no-show'] },
            },
        });

        this.logger.log(`[Cron 1h] Found ${appointments.length} appointments needing 1h reminder`);

        for (const apt of appointments) {
            try {
                const timeStr = new Date(apt.appointmentDate).toLocaleTimeString('ar-JO', {
                    hour: '2-digit', minute: '2-digit',
                });

                const message = `تذكير عاجل 🔔\n\nمرحباً ${apt.customerName || 'عزيزنا المريض'}، موعدك في عيادتنا بعد ساعة تقريباً ⏰ الساعة ${timeStr}.\n\nنتطلع لرؤيتك! 😊`;

                // ─── إرسال رسالة واتساب ─────────────────────────────────────────
                if (apt.userId && apt.phone) {
                    const sock = this.whatsAppService.getSocket(apt.userId);
                    if (sock) {
                        const phone = apt.phone.includes('@') ? apt.phone : `${apt.phone}@s.whatsapp.net`;
                        await sock.sendMessage(phone, { text: message });
                        this.logger.log(`[Cron 1h] ✅ WhatsApp reminder sent to ${apt.phone}`);
                    } else {
                        this.logger.warn(`[Cron 1h] WhatsApp not connected for user ${apt.userId}`);
                    }
                }

                // ─── إشعار داخلي للطبيب ─────────────────────────────────────────
                if (apt.userId) {
                    await this.prisma.notification.create({
                        data: {
                            userId: apt.userId,
                            type: 'REMINDER_1H',
                            title: '🔔 موعد خلال ساعة!',
                            message: `موعد ${apt.customerName || 'مريض'} الساعة ${timeStr} — بعد ساعة تقريباً`,
                            priority: 'HIGH',
                            appointmentId: apt.id,
                        },
                    });
                }

                // ─── إشعار للمريض في بوابة المرضى ──────────────────────────────
                if (apt.patientUserId) {
                    await this.prisma.patientNotification.create({
                        data: {
                            patientId: apt.patientUserId,
                            type: 'reminder_1h',
                            title: '🔔 موعدك بعد ساعة!',
                            message: `تذكير: لديك موعد الساعة ${timeStr} — استعد للحضور`,
                        },
                    });
                }

                // ─── تحديث الحالة ───────────────────────────────────────────────
                await this.prisma.appointment.update({
                    where: { id: apt.id },
                    data: { reminder1hSent: true },
                });

            } catch (err) {
                this.logger.error(`[Cron 1h] Failed for appointment ${apt.id}: ${err.message}`);
            }
        }
    }
}
