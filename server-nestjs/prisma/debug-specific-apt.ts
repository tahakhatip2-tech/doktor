
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const phone = '176102349750450';
    console.log(`Searching for appointments with phone: ${phone}`);

    const appointments = await prisma.appointment.findMany({
        where: {
            OR: [
                { phone: { contains: phone } },
                { phone: phone }
            ]
        },
        include: {
            user: {
                select: { id: true, email: true, name: true }
            }
        }
    });

    console.log(`Found ${appointments.length} appointments.`);
    appointments.forEach(apt => {
        console.log(`ID: ${apt.id} | User: ${apt.user?.name} (ID: ${apt.userId}) | Date: ${apt.appointmentDate.toISOString()} | Name: ${apt.customerName} | Status: ${apt.status}`);
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
