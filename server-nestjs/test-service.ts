
import { PrismaClient } from '@prisma/client';
import { AppointmentsService } from './src/appointments/appointments.service';
import { PrismaService } from './src/prisma/prisma.service';

import { NotificationsService } from './src/notifications/notifications.service';
import { NotificationsGateway } from './src/notifications/notifications.gateway';

const prisma = new PrismaClient();

async function main() {
    const userId: any = "6"; // Simulate string ID from JWT
    const prismaService = new PrismaService();
    const notificationsGateway = new NotificationsGateway();
    const notificationsService = new NotificationsService(prismaService, notificationsGateway);
    const appointmentsService = new AppointmentsService(prismaService, notificationsService, notificationsGateway);

    console.log(`--- TESTING AppointmentService FOR User ID: ${userId} (Type: ${typeof userId}) ---`);

    const stats = await appointmentsService.getStats(userId);
    console.log('\nStats result (today_total):', stats.today_total);

    const today = new Date().toISOString().split('T')[0];
    const query = { date_from: today };

    const list = await appointmentsService.findAll(userId, query);
    console.log(`Found ${list.length} appointments in list.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
