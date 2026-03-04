
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AppointmentsService } from '../src/appointments/appointments.service';
import { PrismaService } from '../src/prisma/prisma.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const appointmentsService = app.get(AppointmentsService);
    const prismaService = app.get(PrismaService);

    const userId = 6;
    const today = new Date().toISOString().split('T')[0];

    console.log(`--- Verifying Dashboard Data for User ID: ${userId} ---`);

    // 1. Simulate "Upcoming Appointments" fetch
    console.log(`\n1. Fetching Appointments (date_from=${today})...`);
    try {
        const appointments = await appointmentsService.findAll(userId, { date_from: today });
        console.log(`Result Count: ${appointments.length}`);
        if (appointments.length > 0) {
            console.log('Sample Appointment:', JSON.stringify(appointments[0], null, 2));
        } else {
            console.log('WARNING: No appointments found!');
        }
    } catch (error) {
        console.error('Error fetching appointments:', error);
    }

    // 2. Simulate "Stats" fetch
    console.log(`\n2. Fetching Stats...`);
    try {
        const stats = await appointmentsService.getStats(userId);
        console.log('Stats Result:', JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('Error fetching stats:', error);
    }

    await app.close();
}

bootstrap();
