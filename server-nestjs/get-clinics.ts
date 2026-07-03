import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getClinics() {
    try {
        const clinics = await prisma.user.findMany({
            where: {
                clinic_name: {
                    not: null
                }
            },
            select: {
                id: true,
                email: true,
                name: true,
                clinic_name: true,
                clinic_phone: true,
                clinic_address: true,
                clinic_specialty: true,
                role: true,
                subscriptionStatus: true,
                createdAt: true
            },
            orderBy: {
                clinic_name: 'asc'
            }
        });

        console.log('\n📋 قائمة العيادات المسجلة:\n');
        console.log(`عدد العيادات: ${clinics.length}\n`);
        
        clinics.forEach((clinic, index) => {
            console.log(`${index + 1}. ${clinic.clinic_name || 'بدون اسم'}`);
            console.log(`   - ID: ${clinic.id}`);
            console.log(`   - البريد: ${clinic.email}`);
            console.log(`   - التخصص: ${clinic.clinic_specialty || 'غير محدد'}`);
            console.log(`   - الهاتف: ${clinic.clinic_phone || 'غير محدد'}`);
            console.log(`   - العنوان: ${clinic.clinic_address || 'غير محدد'}`);
            console.log(`   - الدور: ${clinic.role}`);
            console.log(`   - حالة الاشتراك: ${clinic.subscriptionStatus}`);
            console.log(`   - تاريخ التسجيل: ${clinic.createdAt.toLocaleDateString('ar-SA')}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    } finally {
        await prisma.$disconnect();
    }
}

getClinics();
