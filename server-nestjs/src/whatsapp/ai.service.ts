import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly uploadsDir = path.join(process.cwd(), 'uploads');

    constructor(
        private prisma: PrismaService,
        private appointmentsService: AppointmentsService,
    ) {
        if (!fs.existsSync(this.uploadsDir)) {
            fs.mkdirSync(this.uploadsDir, { recursive: true });
        }
    }

    async getAIResponse(userId: number, userMessage: string, phone?: string, contactName: string = 'غير معروف', audioFilePath?: string, historyStrOverride?: string, source: 'whatsapp' | 'app' = 'whatsapp'): Promise<string | null> {
        try {
            // 1. Fetch ALL Settings & Templates for deep context
            const [settings, templates, services, clinicDoctors] = await Promise.all([
                this.prisma.setting.findMany({ where: { userId } }),
                this.prisma.autoReplyTemplate.findMany({ where: { userId, isActive: true } }),
                this.prisma.service.findMany({ where: { userId, isActive: true } }),
                this.prisma.clinicDoctor.findMany({ where: { clinicId: userId, isActive: true } })
            ]);

            const getSetting = (key: string) => settings.find(s => s.key === key)?.value || "";

            const aiEnabledVal = getSetting('ai_enabled');
            const aiEnabled = aiEnabledVal === undefined || aiEnabledVal === '1' || aiEnabledVal === 'true';

            // Use per-user key from DB if set, otherwise fall back to the central ENV key
            const apiKey = getSetting('ai_api_key') || process.env.GEMINI_API_KEY;

            if (!aiEnabled) {
                console.log('[AI Debug] AI Stopped: Disabled by user setting');
                return null;
            }

            if (!apiKey) {
                console.error('[AI Error] No API key found. Set GEMINI_API_KEY in .env file.');
                return null;
            }

            // 2. Build Clinic Persona & Context
            const clinicName = getSetting('clinic_name') || 'العيادة';
            const doctorName = getSetting('doctor_name') || 'الطبيب';
            const clinicDesc = getSetting('clinic_description') || 'عيادة طبية';
            const address = getSetting('address') || 'غير محدد';
            const phoneNum = getSetting('phone');
            const workStart = getSetting('working_hours_start') || '09:00';
            const workEnd = getSetting('working_hours_end') || '17:00';

            const knowledgeBase = templates.map(t => `- س: ${t.trigger}\n  ج: ${t.response}`).join('\n');
            const servicesList = services.map(s => `- ${s.name}: ${s.description || ''} (${s.price || 'السعر عند الطبيب'})`).join('\n');
            const doctorsList = clinicDoctors.length > 0 
                ? clinicDoctors.map(d => `- د. ${d.name} (${d.specialty || 'طبيب'}). دوامه: ${d.workingDays || 'طوال الأسبوع'} ${d.workingHours || d.shiftTiming || 'حسب دوام العيادة'}`).join('\n')
                : `الطبيب الرئيسي: ${doctorName}`;

            // 3. Fetch Availability
            const todayStr = new Date().toISOString().split('T')[0];
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];

            const todaySlots = await this.appointmentsService.getAvailableSlots(userId, todayStr);
            const tomorrowSlots = await this.appointmentsService.getAvailableSlots(userId, tomorrowStr);

            // 4. Construct System Instruction
            const systemInstruction = `
أنت السكرتير الذكي والمخلص لـ "${clinicName}". 
شخصيتك:
- أنت تتحدث باسم "${clinicName}" التي يديرها "${doctorName}".
- تخصص العيادة وهويتها: "${clinicDesc}".
- أسلوبك: دافئ، مهني، مختصر، ومفيد جداً. تتحدث باللهجة البيضاء أو الفصحى المبسطة.
- اسم المتصل الحالي (${source === 'whatsapp' ? 'كما يظهر في واتساب' : 'المسجل في التطبيق'}): "${contactName}".

معلومات العيادة (Facts):
- العنوان: ${address}
- ساعات العمل: من ${workStart} إلى ${workEnd}
- الهاتف: ${phoneNum}
- الأطباء المتواجدون في العيادة وأوقات دوامهم:
${doctorsList}
- الخدمات:
${servicesList}

قاعدة المعرفة (Information Bank - اعتمد هذه الإجابات كحقائق):
${knowledgeBase}

المواعيد المتاحة حالياً (Real-time Availability):
- اليوم (${todayStr}): ${todaySlots.length > 0 ? todaySlots.join(', ') : 'ممتلئ بالكامل'}
- غداً (${tomorrowStr}): ${tomorrowSlots.length > 0 ? tomorrowSlots.join(', ') : 'ممتلئ بالكامل'}
*ملاحظة هامة:* لا تقترح أبداً وقتاً غير موجود في هذه القائمة.

بروتوكول التعامل (Strict Protocol):
1. إذا سأل المريض عن معلومة موجودة في "قاعدة المعرفة" أو "معلومات العيادة"، أجب مباشرة وبدقة.
2. بروتوكول حجز الموعد الصارم (MANDATORY):
   - اسأل: "هل الحجز لك يا ${contactName} أم لشخص آخر؟" لتعرف الاسم الثلاثي للمريض.
   - بمجرد معرفة الاسم والوقت، أكد الموعد **ويجب حتماً** إضافة هذا الكود البرمجي في نهاية الرسالة:
     \`[[APPOINTMENT: YYYY-MM-DD | HH:MM | Patient Name | Notes]]\`
   - **تنبيه:** استخدم دائماً صيغة 24 ساعة (مثلاً 14:00 بدلاً من 2:00 ظهراً) في الكود البرمجي.
   - لا تطلب التأكيد بعد إصدار الكود، الكود هو التأكيد.

3. بروتوكول الإلغاء (CANCELLATION):
   - إذا طلب المريض إلغاء موعده (مثلاً: "أريد إلغاء موعدي"، "ألغِ الحجز"، "لن أتمكن من الحضور")، قُل له إنك ستقوم بالإلغاء فوراً، ثم **أضف هذا الكود في نهاية الرسالة:**
     \`[[CANCEL_APPOINTMENT]]\`
   - لا تطلب تأكيداً إضافياً. الكود هو الإلغاء.

4. بروتوكول التأجيل (RESCHEDULING):
   - إذا طلب المريض تأجيل موعده لوقت آخر (مثلاً: "أريد تغيير موعدي ليوم الخميس الساعة 3")، تحقق أن الوقت الجديد متاح في قائمة المواعيد المتاحة، ثم **أضف هذا الكود في نهاية الرسالة:**
     \`[[RESCHEDULE_APPOINTMENT: YYYY-MM-DD | HH:MM]]\`
   - إذا كان الوقت غير متاح، أخبره واقترح بديلاً من القائمة المتاحة.

5. إذا سأل المريض عن الأطباء المتواجدين أو أوقات دوامهم، أجب بناءً على ساعات العمل ومعلومات العيادة المتاحة لديك.
6. ركز دائماً على مساعدة المريض في حجز المواعيد والإجابة عن كافة الاستفسارات الخاصة بالعيادة بشكل احترافي وودي.

تعليمات المالك (System Prompt Override):
${getSetting('ai_system_instruction')}

تذكر: هدفك هو راحة المريض، وتنظيم جدول الطبيب، والحصول على اسم المريض الصحيح.
`;

            // 5. Build History
            let historyStr = historyStrOverride || "";
            if (!historyStrOverride && phone) {
                const chat = await this.prisma.whatsAppChat.findUnique({
                    where: { userId_phone: { userId, phone } }
                });
                if (chat) {
                    const history = await this.prisma.whatsAppMessage.findMany({
                        where: { chatId: chat.id },
                        orderBy: { timestamp: 'desc' },
                        take: 10,
                    });
                    historyStr = history.reverse().map(h => `${h.fromMe ? 'Secretary' : 'Patient'}: ${h.content}`).join('\n');
                }
            }

            // 6. Build parts for Gemini
            const parts: any[] = [];

            // Add audio if available (Gemini 1.5 Pro supports audio natively)
            if (audioFilePath && fs.existsSync(audioFilePath)) {
                const audioData = fs.readFileSync(audioFilePath);
                const base64Audio = audioData.toString('base64');
                parts.push({
                    inlineData: {
                        mimeType: 'audio/ogg',
                        data: base64Audio,
                    }
                });
                parts.push({ text: 'هذه رسالة صوتية من المريض. افهمها ورد عليها وفق بروتوكولاتك.' });
            } else {
                const userPrompt = `تاريخ اليوم: ${new Date().toLocaleString('ar-JO')}\n\nالسجل السابق:\n${historyStr}\n\nالرسالة الجديدة:\n${userMessage || '(رسالة فارغة)'}`;
                parts.push({ text: userPrompt });
            }

            // 7. Call Gemini API
            // دعم كلا تنسيقي المفاتيح: AIza (قديم ?key=) و AQ. (جديد X-goog-api-key header)
            const isNewKeyFormat = apiKey.startsWith('AQ.');
            const modelName = 'gemini-1.5-flash';
            const geminiUrl = isNewKeyFormat
                ? `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent`
                : `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

            const requestBody = {
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: [{ role: 'user', parts }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1000,
                }
            };

            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (isNewKeyFormat) {
                headers['X-goog-api-key'] = apiKey;
            }

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
            });

            const data: any = await response.json();

            if (data.error) {
                console.error(`[AI Error] Gemini:`, data.error.message);
                return null;
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
                console.log(`[AI] Responded using Gemini`);
                return text.trim();
            }

            console.error('[AI] Failed to get response from Gemini.');
            return null;

        } catch (err) {
            this.logger.error(`AI Fatal Error: ${err.message}`);
            return null;
        }
    }

    // Voice generation is now handled by VoiceService

    async generateMedicalAdvice(userId: number, diagnosis: string, treatment: string): Promise<string | null> {
        const prompt = `أنت طبيب استشاري خبير. بناءً على التشخيص والعلاج التاليين لمريض، قدم 3-5 نصائح طبية عملية ومختصرة للمريض لمساعدته في رحلة العلاج.

التشخيص: ${diagnosis}
العلاج: ${treatment}

المطلوب:
- لغة عربية سهلة وودودة.
- نصائح محددة وعملية.
- كن مختصراً جداً.
- لا تضف أي مقدمات أو خاتمة، فقط النصائح كنقاط.`;

        return this.getAIResponse(userId, prompt, undefined, 'نظام السجلات الطبية');
    }
}
