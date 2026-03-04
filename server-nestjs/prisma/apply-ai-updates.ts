
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const systemInstruction = `أنت مساعد ذكي ومفيد لعيادة الدكتور طه الخطيب.

التخصصات المتوفرة في العيادة هي:
1. الطب العام والأسرة: (للفحوصات الدورية والعلاج الأولي).
2. طب الأطفال: (لمتابعة صحة الأطفال والمواليد).
3. الأمراض الجلدية والتجميل: (لعلاج الأمراض الجلدية وإجراءات التجميل غير الجراحية).
4. التغذية والحمية: (لوضع خطط غذائية علاجية وإنقاص الوزن).
5. طب الأسنان: (للعلاج العام والتجميلي للأسنان).

معلومات العيادة:
- الطبيب: الدكتور طه الخطيب (أخصائي جراحة وطب عام).
- الموقع: جبل النصر، حي عدن، مجمع رباح، الطابق الثالث، مكتب 5.
- أوقات الدوام: متاح 24 ساعة على مدار الأسبوع (24/7).
- مدة الموعد: 30 دقيقة لكل مريض.
- **قيمة الكشفية**: تبدأ من 5 دنانير.

تعليمات هامة:
- كن ودوداً ومهنياً جداً.
- عند الاستفسار عن المواعيد، أخبر المريض بالوقت المتاح (العيادة تعمل دائماً).
- لتأكيد الحجز بشكل نهائي، **يجب دائماً طلب الاسم الكامل للمريض** إذا لم يذكره. لا ترسل كود الحجز [[APPOINTMENT:...]] إلا بعد الحصول على الاسم الكامل.
- إذا سأل المريض عن التخصصات أو التكاليف، اذكر المعلومات أعلاه.
- ساعد المرضى في الوصول للعيادة عبر وصف الموقع بدقة.
`;

    console.log('--- UPDATING ALL USERS ---');
    const users = await prisma.user.findMany();

    for (const user of users) {
        const userId = user.id;
        console.log(`Updating User ${userId} (${user.name})...`);

        await prisma.setting.upsert({
            where: { userId_key: { userId, key: 'ai_system_instruction' } },
            update: { value: systemInstruction },
            create: { userId, key: 'ai_system_instruction', value: systemInstruction }
        });

        const serviceName = 'استشارة طبية';
        const existingService = await prisma.service.findFirst({
            where: { userId, name: serviceName }
        });

        if (existingService) {
            await prisma.service.update({
                where: { id: existingService.id },
                data: {
                    description: 'استشارة طبية عامة أو جراحية (تبدأ من 5 دنانير)',
                    price: "5",
                    isActive: true
                }
            });
        } else {
            await prisma.service.create({
                data: {
                    userId,
                    name: serviceName,
                    description: 'استشارة طبية عامة أو جراحية (تبدأ من 5 دنانير)',
                    price: "5",
                    isActive: true
                }
            });
        }
    }
    console.log('Update complete for all users.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
