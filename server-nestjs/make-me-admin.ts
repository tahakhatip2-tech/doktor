import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeAdmin() {
    try {
        // ترقية المستخدم "طه الخطيب"
        const user = await prisma.user.update({
            where: { email: 'tahakhatip2@gmail.com' },
            data: { role: 'ADMIN' }
        });

        console.log('\n✅ تم ترقيتك إلى مدير بنجاح!');
        console.log(`📧 البريد: ${user.email}`);
        console.log(`👤 الاسم: ${user.name}`);
        console.log(`🎖️  الدور: ${user.role}`);
        console.log('\n🎉 يمكنك الآن الدخول للوحة التحكم!');
        console.log('🔗 الرابط: http://localhost:5173/#/admin-panel');

    } catch (error) {
        console.error('❌ خطأ:', error);
    } finally {
        await prisma.$disconnect();
    }
}

makeAdmin();
