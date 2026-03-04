
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 1; // Assuming userId is 1 for now, as seen in previous scripts

    console.log('--- CURRRENT SETTINGS ---');
    const settings = await prisma.setting.findMany({
        where: { userId }
    });
    console.log(JSON.stringify(settings, null, 2));

    console.log('\n--- CURRENT SERVICES ---');
    const services = await prisma.service.findMany({
        where: { userId }
    });
    console.log(JSON.stringify(services, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
