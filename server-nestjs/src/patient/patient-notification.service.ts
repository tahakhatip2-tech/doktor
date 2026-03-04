import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientNotificationService {
    constructor(private prisma: PrismaService) { }

    async getNotifications(patientId: number) {
        const notifications = await this.prisma.patientNotification.findMany({
            where: {
                patientId,
            },
            include: {
                appointment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                clinic_name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 50,
        });

        return notifications;
    }

    async getUnreadCount(patientId: number) {
        const count = await this.prisma.patientNotification.count({
            where: {
                patientId,
                isRead: false,
            },
        });

        return { count };
    }

    async markAsRead(patientId: number, notificationId: number) {
        const notification = await this.prisma.patientNotification.findFirst({
            where: {
                id: notificationId,
                patientId,
            },
        });

        if (!notification) {
            return null;
        }

        return this.prisma.patientNotification.update({
            where: { id: notificationId },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async markAllAsRead(patientId: number) {
        await this.prisma.patientNotification.updateMany({
            where: {
                patientId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });

        return { success: true };
    }

    async deleteNotification(patientId: number, notificationId: number) {
        const notification = await this.prisma.patientNotification.findFirst({
            where: {
                id: notificationId,
                patientId,
            },
        });

        if (!notification) {
            return null;
        }

        await this.prisma.patientNotification.delete({
            where: { id: notificationId },
        });

        return { success: true };
    }
}
