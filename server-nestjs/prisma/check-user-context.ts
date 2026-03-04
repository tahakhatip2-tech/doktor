
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- CHECKING USERS ---');
    const users = await prisma.user.findMany();
    users.forEach(u => {
        console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name}`);
    });

    console.log('\n--- CHECKING AI SETTINGS ---');
    const aiSettings = await prisma.setting.findMany({
        where: { key: 'ai_system_instruction' }
    });
    aiSettings.forEach(s => {
        console.log(`UserID: ${s.userId} | Key: ${s.key} | Value Length: ${s.value?.length}`);
    });

    console.log('\n--- CHECKING SERVICES ---');
    const services = await prisma.service.findMany();
    services.forEach(ser => {
        console.log(`ID: ${ser.id} | UserID: ${ser.userId} | Name: ${ser.name}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
