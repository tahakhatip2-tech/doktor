import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LaboratoryService {
    constructor(private prisma: PrismaService) {}

    // --- Lab Tests (Services) ---
    async getLabTests(userId: number) {
        return this.prisma.service.findMany({
            where: {
                userId,
                category: 'laboratory'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async createLabTest(userId: number, data: any) {
        return this.prisma.service.create({
            data: {
                ...data,
                userId,
                category: 'laboratory',
                price: data.price ? String(data.price) : null
            }
        });
    }

    async updateLabTest(id: number, userId: number, data: any) {
        const service = await this.prisma.service.findFirst({
            where: { id, userId, category: 'laboratory' }
        });
        if (!service) throw new NotFoundException('Lab test not found');

        if (data.price !== undefined && data.price !== null) {
            data.price = String(data.price);
        }

        return this.prisma.service.update({
            where: { id },
            data
        });
    }

    async deleteLabTest(id: number, userId: number) {
        const service = await this.prisma.service.findFirst({
            where: { id, userId, category: 'laboratory' }
        });
        if (!service) throw new NotFoundException('Lab test not found');

        return this.prisma.service.delete({
            where: { id }
        });
    }

    // --- Lab Orders (Appointments) ---
    async getLabOrders(userId: number) {
        return this.prisma.appointment.findMany({
            where: {
                userId,
                type: 'lab_test'
            },
            include: {
                patientUser: {
                    select: { id: true, fullName: true, phone: true, avatar: true }
                },
                contact: {
                    select: { id: true, name: true, phone: true }
                },
                medicalRecords: {
                    where: { recordType: 'lab_result' }
                }
            },
            orderBy: {
                appointmentDate: 'desc'
            }
        });
    }

    async updateLabOrderStatus(id: number, userId: number, status: string) {
        const order = await this.prisma.appointment.findFirst({
            where: { id, userId, type: 'lab_test' }
        });
        if (!order) throw new NotFoundException('Lab order not found');

        return this.prisma.appointment.update({
            where: { id },
            data: { status }
        });
    }

    // --- Lab Results (MedicalRecords) ---
    async saveLabResult(userId: number, orderId: number, data: any) {
        const order = await this.prisma.appointment.findFirst({
            where: { id: orderId, userId, type: 'lab_test' }
        });
        if (!order) throw new NotFoundException('Lab order not found');

        // Check if result already exists
        const existingRecord = await this.prisma.medicalRecord.findFirst({
            where: { appointmentId: orderId, recordType: 'lab_result' }
        });

        if (existingRecord) {
            return this.prisma.medicalRecord.update({
                where: { id: existingRecord.id },
                data: {
                    templateData: { results: data.results, notes: data.notes }
                }
            });
        }

        return this.prisma.medicalRecord.create({
            data: {
                appointmentId: orderId,
                patientId: order.patientId,
                patientUserId: order.patientUserId,
                recordType: 'lab_result',
                templateData: { results: data.results, notes: data.notes }
            }
        });
    }
}
