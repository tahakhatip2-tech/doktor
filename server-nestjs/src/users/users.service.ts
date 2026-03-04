import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, SubscriptionStatus, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// نوع آمن للإنشاء — يمنع تمرير role أو subscriptionStatus من الخارج
type SafeCreateUserInput = {
    email: string;
    password: string;
    name?: string;
    phone?: string;
};

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: SafeCreateUserInput): Promise<User> {
        // التحقق من البريد الإلكتروني
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new ConflictException('البريد الإلكتروني مستخدم من قبل');
        }

        // التحقق من رقم الهاتف
        if (data.phone) {
            const existingPhone = await this.prisma.user.findUnique({
                where: { phone: data.phone },
            });

            if (existingPhone) {
                throw new ConflictException('رقم الهاتف مستخدم من قبل');
            }
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // فترة التجربة: 7 أيام
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        return this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                phone: data.phone,
                // ─── أمان حرج: الدور دائماً USER عند التسجيل ───
                role: UserRole.USER,
                subscriptionStatus: SubscriptionStatus.TRIAL,
                expiryDate: expiryDate,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { plan: true }
        });
    }

    async findById(id: number): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { plan: true }
        });

        // Auto-expire check
        if (user && user.expiryDate && new Date() > user.expiryDate && user.subscriptionStatus !== SubscriptionStatus.CANCELED) {
            // ... logic ...
        }

        return user;
    }

    async findAll(): Promise<User[]> {
        return this.prisma.user.findMany({
            include: { plan: true },
        });
    }

    async findByPhone(phone: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { phone },
        });
    }

    async update(id: number, data: any): Promise<User> {
        const updateData = { ...data };

        // Check if phone is being updated and if it's already taken by another user
        if (updateData.phone) {
            const existingUser = await this.prisma.user.findUnique({
                where: { phone: updateData.phone },
            });

            if (existingUser && existingUser.id !== id) {
                throw new ConflictException('رقم الهاتف مستخدم من قبل');
            }
        }

        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        return this.prisma.user.update({
            where: { id },
            data: updateData,
        });
    }
}
