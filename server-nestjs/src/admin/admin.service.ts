import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) {}

    // ═══════════════════════════════════════════════════════════
    // Dashboard Statistics
    // ═══════════════════════════════════════════════════════════
    async getDashboardStats() {
        const [
            totalUsers,
            activeUsers,
            trialUsers,
            canceledUsers,
            totalRevenue,
            monthlyRevenue,
            totalAppointments,
            monthlyAppointments,
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'active' } }),
            this.prisma.user.count({ where: { subscriptionStatus: SubscriptionStatus.TRIAL } }),
            this.prisma.user.count({ where: { subscriptionStatus: SubscriptionStatus.CANCELED } }),
            this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'completed' } }),
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'completed',
                    createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            }),
            this.prisma.appointment.count(),
            this.prisma.appointment.count({
                where: {
                    createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            }),
        ]);

        // Revenue by month (last 12 months)
        const revenueByMonth = await this.getRevenueByMonth(12);

        // User growth (last 12 months)
        const userGrowth = await this.getUserGrowth(12);

        // Subscription distribution
        const subscriptionDistribution = await this.prisma.user.groupBy({
            by: ['subscriptionStatus'],
            _count: { subscriptionStatus: true }
        });

        // Top customers by revenue
        const topCustomers = await this.prisma.payment.groupBy({
            by: ['userId'],
            _sum: { amount: true },
            _count: { userId: true },
            where: { status: 'completed' },
            orderBy: { _sum: { amount: 'desc' } },
            take: 10
        });

        const topCustomersWithDetails = await Promise.all(
            topCustomers.map(async (customer) => {
                const user = await this.prisma.user.findUnique({
                    where: { id: customer.userId },
                    select: { id: true, email: true, name: true, clinic_name: true }
                });
                return {
                    ...user,
                    totalRevenue: customer._sum.amount,
                    paymentsCount: customer._count.userId
                };
            })
        );

        return {
            totalUsers,
            activeUsers,
            trialUsers,
            canceledUsers,
            totalRevenue: totalRevenue._sum.amount || 0,
            monthlyRevenue: monthlyRevenue._sum.amount || 0,
            totalAppointments,
            monthlyAppointments,
            revenueByMonth,
            userGrowth,
            subscriptionDistribution: subscriptionDistribution.map(s => ({
                status: s.subscriptionStatus,
                count: s._count.subscriptionStatus
            })),
            topCustomers: topCustomersWithDetails
        };
    }

    // ═══════════════════════════════════════════════════════════
    // Users Management
    // ═══════════════════════════════════════════════════════════
    async getUsers(filters?: {
        search?: string;
        role?: UserRole;
        status?: string;
        subscriptionStatus?: SubscriptionStatus;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters?.search) {
            where.OR = [
                { email: { contains: filters.search, mode: 'insensitive' } },
                { name: { contains: filters.search, mode: 'insensitive' } },
                { clinic_name: { contains: filters.search, mode: 'insensitive' } },
                { phone: { contains: filters.search } }
            ];
        }

        if (filters?.role) where.role = filters.role;
        if (filters?.status) where.status = filters.status;
        if (filters?.subscriptionStatus) where.subscriptionStatus = filters.subscriptionStatus;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    plan: true,
                    _count: {
                        select: {
                            appointments: true,
                            contacts: true,
                            payments: true
                        }
                    }
                }
            }),
            this.prisma.user.count({ where })
        ]);

        return {
            users: users.map(u => {
                const { password, ...userWithoutPassword } = u;
                return userWithoutPassword;
            }),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getUserDetails(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                plan: true,
                appointments: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                payments: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                contacts: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                _count: {
                    select: {
                        appointments: true,
                        contacts: true,
                        payments: true,
                        whatsAppChats: true
                    }
                }
            }
        });

        if (!user) return null;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateUser(userId: number, data: any) {
        const { password, ...updateData } = data;
        
        return this.prisma.user.update({
            where: { id: userId },
            data: updateData
        });
    }

    async deleteUser(userId: number) {
        // حذف جميع البيانات المرتبطة
        await this.prisma.$transaction([
            this.prisma.notification.deleteMany({ where: { userId } }),
            this.prisma.appointment.deleteMany({ where: { userId } }),
            this.prisma.payment.deleteMany({ where: { userId } }),
            this.prisma.whatsAppChat.deleteMany({ where: { userId } }),
            this.prisma.contact.deleteMany({ where: { userId } }),
            this.prisma.user.delete({ where: { id: userId } })
        ]);

        return { success: true };
    }

    // ═══════════════════════════════════════════════════════════
    // Plans Management
    // ═══════════════════════════════════════════════════════════
    async getPlans() {
        return this.prisma.plan.findMany({
            include: {
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { price: 'asc' }
        });
    }

    async createPlan(data: {
        name: string;
        description?: string;
        price: number;
        interval: string;
        features?: string;
    }) {
        return this.prisma.plan.create({ data });
    }

    async updatePlan(planId: number, data: any) {
        return this.prisma.plan.update({
            where: { id: planId },
            data
        });
    }

    async deletePlan(planId: number) {
        return this.prisma.plan.delete({ where: { id: planId } });
    }

    // ═══════════════════════════════════════════════════════════
    // Payments Management
    // ═══════════════════════════════════════════════════════════
    async getPayments(filters?: {
        status?: string;
        method?: string;
        userId?: number;
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.status) where.status = filters.status;
        if (filters?.method) where.method = filters.method;
        if (filters?.userId) where.userId = filters.userId;

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            clinic_name: true
                        }
                    }
                }
            }),
            this.prisma.payment.count({ where })
        ]);

        return {
            payments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async approvePayment(paymentId: number) {
        return this.prisma.payment.update({
            where: { id: paymentId },
            data: { status: 'completed' }
        });
    }

    async rejectPayment(paymentId: number, notes?: string) {
        return this.prisma.payment.update({
            where: { id: paymentId },
            data: { 
                status: 'rejected',
                notes
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // System Settings
    // ═══════════════════════════════════════════════════════════
    async getSystemSettings() {
        return this.prisma.systemInfo.findMany();
    }

    async updateSystemSetting(key: string, value: string) {
        return this.prisma.systemInfo.upsert({
            where: { key },
            create: { key, value },
            update: { value }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // Helper Methods
    // ═══════════════════════════════════════════════════════════
    private async getRevenueByMonth(months: number) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const payments = await this.prisma.payment.findMany({
            where: {
                status: 'completed',
                createdAt: { gte: startDate }
            },
            select: {
                amount: true,
                createdAt: true
            }
        });

        const revenueMap = new Map<string, number>();
        
        for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            revenueMap.set(key, 0);
        }

        payments.forEach(payment => {
            const date = new Date(payment.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = revenueMap.get(key) || 0;
            revenueMap.set(key, current + Number(payment.amount));
        });

        return Array.from(revenueMap.entries())
            .map(([month, revenue]) => ({ month, revenue }))
            .reverse();
    }

    private async getUserGrowth(months: number) {
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const users = await this.prisma.user.findMany({
            where: {
                createdAt: { gte: startDate }
            },
            select: {
                createdAt: true
            }
        });

        const growthMap = new Map<string, number>();
        
        for (let i = 0; i < months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            growthMap.set(key, 0);
        }

        users.forEach(user => {
            const date = new Date(user.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const current = growthMap.get(key) || 0;
            growthMap.set(key, current + 1);
        });

        return Array.from(growthMap.entries())
            .map(([month, users]) => ({ month, users }))
            .reverse();
    }

    // ═══════════════════════════════════════════════════════════
    // Activity Logs
    // ═══════════════════════════════════════════════════════════
    async getActivityLogs(filters?: {
        userId?: number;
        action?: string;
        page?: number;
        limit?: number;
    }) {
        // سيتم تنفيذه لاحقاً بعد إضافة جدول ActivityLog
        return {
            logs: [],
            total: 0,
            page: filters?.page || 1,
            limit: filters?.limit || 20
        };
    }
}
