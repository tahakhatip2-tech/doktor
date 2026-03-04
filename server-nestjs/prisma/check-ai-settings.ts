import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAISettings() {
    try {
        // Check all users
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true }
        });

        console.log('=== Users in Database ===');
        for (const user of users) {
            console.log(`\nUser ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.name}`);

            // Get AI settings for this user
            const settings = await prisma.setting.findMany({
                where: {
                    userId: user.id,
                    key: { in: ['ai_enabled', 'ai_api_key', 'ai_system_instruction'] }
                }
            });

            console.log('AI Settings:');
            if (settings.length === 0) {
                console.log('  ❌ No AI settings found');
            } else {
                settings.forEach(s => {
                    const value = s.key === 'ai_api_key'
                        ? (s.value ? `${s.value.substring(0, 10)}...` : 'empty')
                        : s.value;
                    console.log(`  ${s.key}: ${value}`);
                });
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAISettings();
