
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- ENFORCING AI ACTIVATION ---');

    // Set ai_enabled to '1' for all existing users/settings
    const result = await prisma.setting.updateMany({
        where: { key: 'ai_enabled' },
        data: { value: '1' }
    });

    console.log(`Updated ${result.count} settings.`);

    // For user 1, ensure it exists if missing
    const userId = 1;
    await prisma.setting.upsert({
        where: { userId_key: { userId, key: 'ai_enabled' } },
        update: { value: '1' },
        create: { userId, key: 'ai_enabled', value: '1' }
    });

    console.log('AI enforced for user 1.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
