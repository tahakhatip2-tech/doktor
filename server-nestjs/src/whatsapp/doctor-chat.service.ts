import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';

// ─── أنواع ردود الدكتور ───────────────────────────────────────────────────────
export interface DoctorChatMessage {
    role: 'doctor' | 'assistant';
    content: string;
    timestamp: Date;
}

@Injectable()
export class DoctorChatService {
    private readonly logger = new Logger(DoctorChatService.name);
    // سجل شات الطبيب في الذاكرة (يمكن لاحقاً تخزينه في DB)
    private chatHistory = new Map<number, DoctorChatMessage[]>();

    constructor(
        private prisma: PrismaService,
        private appointmentsService: AppointmentsService,
    ) { }

    // ─── جلب سجل الشات ───────────────────────────────────────────────────────
    getHistory(doctorId: number): DoctorChatMessage[] {
        return this.chatHistory.get(doctorId) || [];
    }

    // ─── مسح سجل الشات ───────────────────────────────────────────────────────
    clearHistory(doctorId: number) {
        this.chatHistory.set(doctorId, []);
        return { success: true };
    }

    // ─── تنفيذ أمر الطبيب ────────────────────────────────────────────────────
    async handleDoctorCommand(doctorId: number, message: string): Promise<string> {
        // أضف رسالة الطبيب للتاريخ
        const history = this.chatHistory.get(doctorId) || [];
        history.push({ role: 'doctor', content: message, timestamp: new Date() });

        // جلب إعدادات العيادة والبيانات المطلوبة
        const [settings, templates, services] = await Promise.all([
            this.prisma.setting.findMany({ where: { userId: doctorId } }),
            this.prisma.autoReplyTemplate.findMany({ where: { userId: doctorId, isActive: true } }),
            this.prisma.service.findMany({ where: { userId: doctorId, isActive: true } }),
        ]);

        const getSetting = (key: string) => settings.find(s => s.key === key)?.value || '';
        const apiKey = getSetting('ai_api_key') || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return 'عذراً، لا يوجد مفتاح Gemini API. يرجى إضافته في الإعدادات.';
        }

        const clinicName = getSetting('clinic_name') || 'العيادة';
        const doctorName = getSetting('doctor_name') || 'الطبيب';
        const workStart = getSetting('working_hours_start') || '09:00';
        const workEnd = getSetting('working_hours_end') || '17:00';
        const apptDuration = parseInt(getSetting('appointment_duration') || '30');

        // مواعيد اليوم وغداً
        const todayStr = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        const [todayAppts, tomorrowAppts, todaySlots, tomorrowSlots] = await Promise.all([
            this.prisma.appointment.findMany({
                where: {
                    userId: doctorId,
                    appointmentDate: {
                        gte: new Date(`${todayStr}T00:00:00`),
                        lt: new Date(`${todayStr}T23:59:59`),
                    },
                    status: { in: ['confirmed', 'pending'] },
                },
                orderBy: { appointmentDate: 'asc' },
                take: 20,
            }),
            this.prisma.appointment.findMany({
                where: {
                    userId: doctorId,
                    appointmentDate: {
                        gte: new Date(`${tomorrowStr}T00:00:00`),
                        lt: new Date(`${tomorrowStr}T23:59:59`),
                    },
                    status: { in: ['confirmed', 'pending'] },
                },
                orderBy: { appointmentDate: 'asc' },
                take: 20,
            }),
            this.appointmentsService.getAvailableSlots(doctorId, todayStr),
            this.appointmentsService.getAvailableSlots(doctorId, tomorrowStr),
        ]);

        const formatAppt = (a: any) =>
            `  • ID:${a.id} | ${a.customerName} | ${new Date(a.appointmentDate).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })} | ${a.phone || 'بدون هاتف'} | ${a.status}`;

        const todayList = todayAppts.length > 0 ? todayAppts.map(formatAppt).join('\n') : 'لا توجد مواعيد اليوم';
        const tomorrowList = tomorrowAppts.length > 0 ? tomorrowAppts.map(formatAppt).join('\n') : 'لا توجد مواعيد غداً';
        const knowledgeBase = templates.map(t => `- س: ${t.trigger}\n  ج: ${t.response}`).join('\n');
        const servicesList = services.map(s => `- ${s.name}: ${s.price || 'غير محدد'}`).join('\n');

        // بناء سجل المحادثة للنموذج
        const historyStr = history.slice(-8).map(h =>
            `${h.role === 'doctor' ? 'الطبيب' : 'المساعد'}: ${h.content}`
        ).join('\n');

        // System Prompt خاص بالطبيب (مختلف تماماً عن System Prompt المريض)
        const systemInstruction = `أنت المساعد الإداري الشخصي للطبيب "${doctorName}" في عيادة "${clinicName}".
أسلوبك: مباشر، سريع، ذكي. تُنفّذ الأوامر فوراً بدون تكرار أسئلة غير ضرورية.
تاريخ اليوم: ${new Date().toLocaleString('ar-JO')}

═══════════════════════════════════════
قاعدة بيانات العيادة (معلومات حية):
═══════════════════════════════════════

⏰ ساعات العمل: ${workStart} — ${workEnd} | مدة الكشف: ${apptDuration} دقيقة

📋 مواعيد اليوم (${todayStr}):
${todayList}

🗓 مواعيد غداً (${tomorrowStr}):
${tomorrowList}

🕐 أوقات متاحة اليوم: ${todaySlots.join(', ') || 'لا توجد أوقات متاحة'}
🕐 أوقات متاحة غداً: ${tomorrowSlots.join(', ') || 'لا توجد أوقات متاحة'}

📚 نماذج الردود:
${knowledgeBase || 'لا توجد نماذج'}

💊 الخدمات والأسعار:
${servicesList || 'لم تُضَف خدمات بعد'}

═══════════════════════════════════════
صلاحيات الطبيب (أوامر مباشرة):
═══════════════════════════════════════

الطبيب يملك صلاحية كاملة على النظام. عند طلبه:

1. **إلغاء موعد** (بالاسم/الهاتف/التاريخ أو الـ ID):
   - ابحث في مواعيد اليوم/غداً عن المريض المقصود.
   - إذا وجدته، أضف في آخر ردك بالضبط: [[CANCEL_APPOINTMENT_BY_ID: رقم_ID]]
   - مثال: [[CANCEL_APPOINTMENT_BY_ID: 42]]

2. **إضافة موعد جديد**:
   - عندما يعطيك الطبيب: التاريخ + الوقت + اسم المريض (+ الهاتف اختياري)
   - تحقق من توفر الوقت في قائمة الأوقات المتاحة أعلاه.
   - إذا متاح، أضف: [[ADD_APPOINTMENT: YYYY-MM-DD | HH:MM | اسم المريض | هاتف | ملاحظات]]
   - مثال: [[ADD_APPOINTMENT: 2026-07-15 | 10:00 | أحمد محمود | 0791234567 | مراجعة]]

3. **الاستعلام عن مريض** (بالاسم/الهاتف):
   - ابحث في قوائم المواعيد أعلاه وأعطِ معلومات المريض مباشرة.
   - إذا طلب بحثاً أعمق، أضف: [[QUERY_PATIENT: رقم_هاتف_أو_اسم]]

4. **مشاهدة مواعيد يوم محدد**:
   - إذا طلب يوماً غير اليوم أو الغد، أضف: [[QUERY_APPOINTMENTS: YYYY-MM-DD]]

5. **تأجيل موعد**:
   - ابحث عن الموعد، ثم أضف: [[RESCHEDULE_BY_ID: appointment_id | YYYY-MM-DD | HH:MM]]

قواعد مهمة:
- لا تطلب تأكيداً إضافياً من الطبيب — الأمر كافٍ للتنفيذ.
- ردودك مختصرة وعملية، لا تشرح أكثر مما يلزم.
- إذا طلب شيئاً غير واضح، اسأل سؤالاً واحداً فقط لتوضيحه.`;

        try {
            const isNewKeyFormat = apiKey.startsWith('AQ.');
            const modelName = 'gemini-2.5-flash';
            const geminiUrl = isNewKeyFormat
                ? `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
                : `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
            const userPrompt = `السجل السابق:\n${historyStr}\n\nأمر الطبيب الحالي:\n${message}`;
            const reqHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
            if (isNewKeyFormat) reqHeaders['X-goog-api-key'] = apiKey;

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: reqHeaders,
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 1500 },
                }),
            });

            const data: any = await response.json();
            if (data.error) {
                this.logger.error(`[DoctorChat] Gemini error: ${data.error.message}`);
                return `خطأ في نموذج AI: ${data.error.message}`;
            }

            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
            if (!aiText) return 'لم يتمكن الموظف من الرد. حاول مرة أخرى.';

            // تنفيذ الأوامر المستخرجة
            const result = await this.executeActions(doctorId, aiText);

            // أضف الرد للتاريخ
            history.push({ role: 'assistant', content: result, timestamp: new Date() });
            this.chatHistory.set(doctorId, history);

            return result;
        } catch (err) {
            this.logger.error(`[DoctorChat] Fatal error: ${err.message}`);
            return `حدث خطأ: ${err.message}`;
        }
    }

    // ─── تنفيذ الأوامر المستخرجة من رد AI ────────────────────────────────────
    private async executeActions(doctorId: number, text: string): Promise<string> {
        let result = text;

        // ── 1. إلغاء موعد بالـ ID ──────────────────────────────────────────
        const cancelByIdRegex = /\[\[CANCEL_APPOINTMENT_BY_ID:\s*(\d+)\]\]/g;
        let match: RegExpExecArray | null;

        while ((match = cancelByIdRegex.exec(text)) !== null) {
            const [fullMatch, idStr] = match;
            const appointmentId = parseInt(idStr.trim());

            try {
                const appt = await this.prisma.appointment.findFirst({
                    where: { id: appointmentId, userId: doctorId },
                });

                if (!appt) {
                    result = result.replace(fullMatch, `\n\n⚠️ لم يُعثر على موعد برقم ID: ${appointmentId}`);
                    continue;
                }

                await this.prisma.appointment.update({
                    where: { id: appointmentId },
                    data: { status: 'cancelled', cancelledAt: new Date(), cancellationReason: 'إلغاء بأمر الطبيب' },
                });

                await this.prisma.notification.create({
                    data: {
                        userId: doctorId,
                        type: 'APPOINTMENT_CANCELLED',
                        title: 'إلغاء موعد',
                        message: `تم إلغاء موعد ${appt.customerName} المجدول في ${appt.appointmentDate.toLocaleString('ar-EG')} بأمر الطبيب`,
                        priority: 'HIGH',
                    },
                }).catch(() => { });

                result = result.replace(fullMatch, `\n\n✅ تم إلغاء موعد ${appt.customerName} بنجاح.`);
                this.logger.log(`[DoctorChat] Cancelled appointment ${appointmentId} for doctor ${doctorId}`);
            } catch (err) {
                result = result.replace(fullMatch, `\n\n❌ فشل الإلغاء: ${err.message}`);
            }
        }

        // ── 2. إضافة موعد جديد ─────────────────────────────────────────────
        const addApptRegex = /\[\[ADD_APPOINTMENT:\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^|]*)\|\s*([^\]]*)\]\]/g;
        while ((match = addApptRegex.exec(text)) !== null) {
            const [fullMatch, dateStr, timeStr, nameStr, phoneStr, notesStr] = match;
            try {
                const date = dateStr.trim();
                const time = timeStr.trim();
                const name = nameStr.trim();
                const phone = phoneStr.trim() || '';
                const notes = (notesStr.trim() || '') + ' [DOCTOR-CMD]';

                const appointmentDate = new Date(`${date}T${time}:00`);
                if (isNaN(appointmentDate.getTime())) {
                    result = result.replace(fullMatch, '\n\n⚠️ تاريخ أو وقت غير صحيح.');
                    continue;
                }

                const isAvailable = await this.appointmentsService.isSlotAvailable(doctorId, appointmentDate, 30);
                if (!isAvailable) {
                    result = result.replace(fullMatch, `\n\n⚠️ الوقت ${time} في ${date} غير متاح. يرجى اختيار وقت آخر.`);
                    continue;
                }

                const contact = await this.prisma.contact.upsert({
                    where: { userId_phone: { userId: doctorId, phone: phone || `manual_${Date.now()}` } },
                    update: { name },
                    create: {
                        userId: doctorId,
                        phone: phone || `manual_${Date.now()}`,
                        name,
                        platform: 'manual',
                        status: 'active',
                    },
                });

                const newAppt = await this.prisma.appointment.create({
                    data: {
                        userId: doctorId,
                        patientId: contact.id,
                        phone: phone || '',
                        customerName: name,
                        appointmentDate,
                        notes,
                        status: 'confirmed',
                    },
                });

                await this.prisma.notification.create({
                    data: {
                        userId: doctorId,
                        type: 'NEW_APPOINTMENT',
                        title: 'موعد جديد',
                        message: `تمت إضافة موعد لـ ${name} في ${appointmentDate.toLocaleString('ar-EG')} بأمر الطبيب`,
                        priority: 'NORMAL',
                    },
                }).catch(() => { });

                result = result.replace(fullMatch, `\n\n✅ تم إضافة موعد ${name} يوم ${date} الساعة ${time}. (رقم الموعد: ${newAppt.id})`);
                this.logger.log(`[DoctorChat] Added appointment ${newAppt.id} for doctor ${doctorId}`);
            } catch (err) {
                result = result.replace(fullMatch, `\n\n❌ فشل إضافة الموعد: ${err.message}`);
            }
        }

        // ── 3. الاستعلام عن مريض ──────────────────────────────────────────
        const queryPatientRegex = /\[\[QUERY_PATIENT:\s*([^\]]+)\]\]/g;
        while ((match = queryPatientRegex.exec(text)) !== null) {
            const [fullMatch, searchStr] = match;
            const term = searchStr.trim();
            try {
                const appts = await this.prisma.appointment.findMany({
                    where: {
                        userId: doctorId,
                        OR: [
                            { customerName: { contains: term } },
                            { phone: { contains: term } },
                        ],
                        status: { in: ['confirmed', 'pending'] },
                    },
                    orderBy: { appointmentDate: 'asc' },
                    take: 5,
                });

                if (appts.length === 0) {
                    result = result.replace(fullMatch, `\n\n⚠️ لم يُعثر على مريض باسم أو رقم "${term}".`);
                } else {
                    const info = appts.map(a =>
                        `• ID:${a.id} | ${a.customerName} | ${new Date(a.appointmentDate).toLocaleString('ar-JO')} | ${a.status}`
                    ).join('\n');
                    result = result.replace(fullMatch, `\n\n📋 نتائج البحث عن "${term}":\n${info}`);
                }
            } catch (err) {
                result = result.replace(fullMatch, `\n\n❌ فشل البحث: ${err.message}`);
            }
        }

        // ── 4. الاستعلام عن مواعيد يوم محدد ─────────────────────────────
        const queryApptRegex = /\[\[QUERY_APPOINTMENTS:\s*([^\]]+)\]\]/g;
        while ((match = queryApptRegex.exec(text)) !== null) {
            const [fullMatch, dateStr] = match;
            const date = dateStr.trim();
            try {
                const appts = await this.prisma.appointment.findMany({
                    where: {
                        userId: doctorId,
                        appointmentDate: {
                            gte: new Date(`${date}T00:00:00`),
                            lt: new Date(`${date}T23:59:59`),
                        },
                        status: { in: ['confirmed', 'pending'] },
                    },
                    orderBy: { appointmentDate: 'asc' },
                });

                if (appts.length === 0) {
                    result = result.replace(fullMatch, `\n\n📅 لا توجد مواعيد يوم ${date}.`);
                } else {
                    const list = appts.map(a =>
                        `• ID:${a.id} | ${a.customerName} | ${new Date(a.appointmentDate).toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' })} | ${a.phone || '-'}`
                    ).join('\n');
                    result = result.replace(fullMatch, `\n\n📅 مواعيد يوم ${date} (${appts.length} موعد):\n${list}`);
                }
            } catch (err) {
                result = result.replace(fullMatch, `\n\n❌ فشل جلب المواعيد: ${err.message}`);
            }
        }

        // ── 5. تأجيل موعد بالـ ID ─────────────────────────────────────────
        const rescheduleByIdRegex = /\[\[RESCHEDULE_BY_ID:\s*(\d+)\|\s*([^|]*)\|\s*([^\]]*)\]\]/g;
        while ((match = rescheduleByIdRegex.exec(text)) !== null) {
            const [fullMatch, idStr, dateStr, timeStr] = match;
            const appointmentId = parseInt(idStr.trim());
            const date = dateStr.trim();
            const time = timeStr.trim();
            try {
                const newDate = new Date(`${date}T${time}:00`);
                if (isNaN(newDate.getTime())) {
                    result = result.replace(fullMatch, '\n\n⚠️ تاريخ أو وقت التأجيل غير صحيح.');
                    continue;
                }

                const isAvail = await this.appointmentsService.isSlotAvailable(doctorId, newDate, 30);
                if (!isAvail) {
                    result = result.replace(fullMatch, `\n\n⚠️ الوقت ${time} في ${date} غير متاح للتأجيل.`);
                    continue;
                }

                const appt = await this.prisma.appointment.findFirst({ where: { id: appointmentId, userId: doctorId } });
                if (!appt) {
                    result = result.replace(fullMatch, `\n\n⚠️ لم يُعثر على الموعد رقم ${appointmentId}.`);
                    continue;
                }

                await this.prisma.appointment.update({
                    where: { id: appointmentId },
                    data: { appointmentDate: newDate, reminderSent: false, reminder24hSent: false, reminder1hSent: false },
                });

                result = result.replace(fullMatch, `\n\n✅ تم تأجيل موعد ${appt.customerName} إلى ${newDate.toLocaleString('ar-JO')}.`);
                this.logger.log(`[DoctorChat] Rescheduled appointment ${appointmentId} to ${newDate.toISOString()}`);
            } catch (err) {
                result = result.replace(fullMatch, `\n\n❌ فشل التأجيل: ${err.message}`);
            }
        }

        return result.trim();
    }
}
