import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentsService } from '../appointments/appointments.service';
import * as googleTTS from 'google-tts-api';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

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

    async getAIResponse(userId: number, userMessage: string, phone?: string, contactName: string = 'غير معروف', audioFilePath?: string, historyStrOverride?: string): Promise<string | null> {
        try {
            // 1. Fetch ALL Settings & Templates for deep context
            const [settings, templates, services] = await Promise.all([
                this.prisma.setting.findMany({ where: { userId } }),
                this.prisma.autoReplyTemplate.findMany({ where: { userId, isActive: true } }),
                this.prisma.service.findMany({ where: { userId, isActive: true } })
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
- اسم المتصل الحالي (كما يظهر في واتساب): "${contactName}".

معلومات العيادة (Facts):
- العنوان: ${address}
- ساعات العمل: من ${workStart} إلى ${workEnd}
- الهاتف: ${phoneNum}
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

3. إذا سأل هل الطبيب موجود؟ أجب بناءً على ساعات العمل.

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
                        take: 10, // Increased context window
                    });
                    historyStr = history.reverse().map(h => `${h.fromMe ? 'Secretary' : 'Patient'}: ${h.content}`).join('\n');
                }
            }

            const models = [
                'gemini-2.0-flash-lite',  // الأسرع والأرخص
                'gemini-2.0-flash',       // الأقوى من 2.0
                'gemini-2.0-flash-exp',   // تجريبي - كوتا منفصلة مجانية
                'gemma-3-12b-it',         // ✅ يعمل - حصة منفصلة
                'gemma-3-4b-it',          // آخر خيار - الأخف
            ];

            for (const model of models) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                    const parts: any[] = [];
                    if (audioFilePath && fs.existsSync(audioFilePath)) {
                        const audioData = fs.readFileSync(audioFilePath).toString('base64');
                        parts.push({ inlineData: { mimeType: "audio/ogg", data: audioData } });
                        parts.push({ text: "استمع للرسالة الصوتية وأجب عليها." });
                    }

                    parts.push({ text: `تاريخ اليوم: ${new Date().toLocaleString('ar-JO')}\n\nالسجل السابق:\n${historyStr}\n\nالرسالة الجديدة:\n${userMessage || '(صوت)'}` });

                    // Gemma models do NOT support system_instruction
                    const isGemma = model.startsWith('gemma');
                    const requestBody: any = {
                        generationConfig: { temperature: 0.3, maxOutputTokens: 1000 }
                    };

                    if (isGemma) {
                        // Inject system prompt as first multi-turn exchange
                        requestBody.contents = [
                            { role: 'user', parts: [{ text: `[تعليمات النظام]\n${systemInstruction}\n---` }] },
                            { role: 'model', parts: [{ text: 'حسناً، سأتبع هذه التعليمات.' }] },
                            { role: 'user', parts }
                        ];
                    } else {
                        // Gemini supports system_instruction natively
                        requestBody.contents = [{ role: 'user', parts }];
                        requestBody.system_instruction = { parts: [{ text: systemInstruction }] };
                    }

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });

                    const data: any = await response.json();

                    if (data.error) {
                        const errorCode = data.error.code;
                        const errorMsg = data.error.message || '';
                        if (errorCode === 429 || errorMsg.toLowerCase().includes('quota') || errorMsg.includes('exhausted')) {
                            console.warn(`[AI] Quota exceeded for model ${model}, trying next...`);
                            continue;
                        }
                        console.error(`[AI Error] ${model}:`, data.error.status, '-', data.error.message);
                        continue;
                    }

                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log(`[AI] Responded using model: ${model}`);
                        return text.trim();
                    }
                } catch (e) {
                    console.error(`[AI Error] Model ${model} failed: ${e.message}`);
                }
            }

            console.error('[AI] All models failed or quota exhausted.');
            return null;

        } catch (err) {
            this.logger.error(`AI Fatal Error: ${err.message}`);
            return null;
        }
    }

    async generateVoice(text: string, lang: string = 'ar'): Promise<string | null> {
        try {
            if (!text) return null;
            const results = await googleTTS.getAllAudioBase64(text, { lang, slow: false, host: 'https://translate.google.com' });
            const finalBuffer = Buffer.concat(results.map(r => Buffer.from(r.base64, 'base64')));
            const filename = `voice_${crypto.randomBytes(4).toString('hex')}.mp3`;
            fs.writeFileSync(path.join(this.uploadsDir, filename), finalBuffer);
            return filename;
        } catch (e) {
            this.logger.error(`TTS Error: ${e.message}`);
            return null;
        }
    }

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

