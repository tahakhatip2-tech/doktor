
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(`Checking all appointments...`);
    const now = new Date();
    console.log(`Current Server Time: ${now.toISOString()} (${now.toString()})`);

    const allAppointments = await prisma.appointment.findMany({
        orderBy: { appointmentDate: 'desc' },
        take: 50
    });

    console.log('\nLast 50 appointments:');
    allAppointments.forEach(apt => {
        console.log(`ID: ${apt.id} | UserID: ${apt.userId} | Date: ${apt.appointmentDate.toISOString()} | Name: ${apt.customerName} | Status: ${apt.status}`);
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`\nRange for today (Local): ${today.toString()} to ${tomorrow.toString()}`);
    console.log(`Range for today (UTC): ${today.toISOString()} to ${tomorrow.toISOString()}`);

    const todayAppointments = await prisma.appointment.findMany({
        where: {
            appointmentDate: {
                gte: today,
                lt: tomorrow,
            },
        },
    });

    console.log(`\nFound ${todayAppointments.length} appointments for today (all users).`);
    todayAppointments.forEach(apt => {
        console.log(`ID: ${apt.id} | UserID: ${apt.userId} | Date: ${apt.appointmentDate.toISOString()} | Name: ${apt.customerName} | Status: ${apt.status}`);
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
