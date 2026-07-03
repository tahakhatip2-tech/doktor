import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function promoteToAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.log('❌ يرجى تحديد البريد الإلكتروني');
        console.log('الاستخدام: npx ts-node promote-to-admin.ts <email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log(`❌ لم يتم العثور على مستخدم بالبريد: ${email}`);
            process.exit(1);
        }

        if (user.role === 'ADMIN') {
            console.log(`✅ المستخدم ${email} هو مدير بالفعل`);
            process.exit(0);
        }

        const updated = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });

        console.log('\n✅ تم ترقية المستخدم بنجاح!');
        console.log(`📧 البريد: ${updated.email}`);
        console.log(`👤 الاسم: ${updated.name || 'غير محدد'}`);
        console.log(`🎖️  الدور: ${updated.role}`);
        console.log('\n🎉 يمكنك الآن تسجيل الدخول إلى لوحة التحكم على: /admin-panel');

    } catch (error) {
        console.error('❌ خطأ:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

promoteToAdmin();
