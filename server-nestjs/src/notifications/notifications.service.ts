import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
    constructor(
        private prisma: PrismaService,
        private notificationsGateway: NotificationsGateway
    ) { }

    async findAll(userId: number) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async getUnreadCount(userId: number) {
        const count = await this.prisma.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        return { count };
    }

    async markAsRead(id: number, userId: number) {
        const notification = await this.prisma.notification.findUnique({
            where: { id },
        });

        if (!notification || notification.userId !== userId) {
            throw new NotFoundException('Notification not found');
        }

        return this.prisma.notification.update({
            where: { id },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async markAllAsRead(userId: number) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    }

    async createNotification(data: {
        userId: number;
        type: string;
        title: string;
        message: string;
        priority?: string;
        contactId?: number;
        appointmentId?: number;
        metadata?: string;
    }) {
        const notification = await this.prisma.notification.create({
            data: {
                ...data,
                priority: data.priority || 'MEDIUM',
            },
        });

        // Emit real-time notification
        this.notificationsGateway.sendNotificationToUser(data.userId, notification);

        return notification;
    }
}
