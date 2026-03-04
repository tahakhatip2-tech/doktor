
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const numId = 6;
    const strId = "6" as any;

    console.log(`--- Testing with Number ID: ${numId} ---`);
    const countNum = await prisma.appointment.count({
        where: { userId: numId }
    });
    console.log(`Count: ${countNum}`);

    console.log(`\n--- Testing with String ID: "${strId}" ---`);
    try {
        const countStr = await prisma.appointment.count({
            where: { userId: strId }
        });
        console.log(`Count: ${countStr}`);
    } catch (err) {
        console.log(`Error with string ID: ${err.message}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
