
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Trimming Appointment Data ---');

    const appointments = await prisma.appointment.findMany();
    console.log(`Found ${appointments.length} appointments.`);

    for (const apt of appointments) {
        const trimmedStatus = apt.status.trim();
        const trimmedName = apt.customerName?.trim() || apt.customerName;
        const trimmedType = apt.type.trim();

        if (trimmedStatus !== apt.status || trimmedName !== apt.customerName || trimmedType !== apt.type) {
            console.log(`Fixing Apt ID: ${apt.id}...`);
            await prisma.appointment.update({
                where: { id: apt.id },
                data: {
                    status: trimmedStatus,
                    customerName: trimmedName,
                    type: trimmedType
                }
            });
            console.log(`  Converted status from '|${apt.status}|' to '|${trimmedStatus}|'`);
        }
    }

    console.log('--- Done ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
