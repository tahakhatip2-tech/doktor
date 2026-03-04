
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- System User & Appointment Audit ---');

    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: { appointments: true }
            }
        }
    });

    users.forEach(u => {
        console.log(`User ID: ${u.id} | Name: ${u.name} | Email: ${u.email} | Total Appointments: ${u._count.appointments}`);
    });

    console.log('\n--- Latest 5 Appointments ---');
    const latestApts = await prisma.appointment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true } }
        }
    });

    latestApts.forEach(a => {
        console.log(`Apt ID: ${a.id} | User: ${a.user?.name} (ID: ${a.userId}) | Date: ${a.appointmentDate.toISOString()} | Phone: ${a.phone} | Status: ${a.status}`);
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
