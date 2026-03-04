import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding plans...');

    const plans = [
        {
            name: 'Free Trial',
            description: 'تجربة مجانية لمدة أسبوع مع مميزات محدودة',
            price: 0,
            interval: 'week',
            stripeId: 'price_free_trial',
            features: JSON.stringify(['basic_dashboard', 'limited_patients', '1_week_access'])
        },
        {
            name: 'Pro',
            description: 'الرد والتكلم الصوتي للنظام الذكي عبر الواتس',
            price: 25,
            interval: 'month',
            stripeId: 'price_pro',
            features: JSON.stringify(['smart_ai_voice', 'whatsapp_integration', 'unlimited_patients'])
        },
        {
            name: 'Premium',
            description: 'نظام وصفات طبية PDF + جميع مميزات Pro',
            price: 45,
            interval: 'month',
            stripeId: 'price_premium',
            features: JSON.stringify(['pdf_prescriptions', 'smart_ai_voice', 'whatsapp_integration', 'priority_support'])
        }
    ];

    for (const plan of plans) {
        console.log(`Seeding plan: ${plan.name}`);
        await prisma.plan.upsert({
            where: { name: plan.name },
            update: {
                description: plan.description,
                price: plan.price,
                interval: plan.interval,
                stripeId: plan.stripeId,
                features: plan.features
            },
            create: plan,
        });
    }

    console.log('✅ Plans seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
