import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Plan, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
    constructor(private prisma: PrismaService) { }

    async getPlans(): Promise<Plan[]> {
        return this.prisma.plan.findMany({
            orderBy: { price: 'asc' },
        });
    }

    async getUserSubscription(userId: number) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                subscriptionStatus: true,
                plan: true,
                expiryDate: true,
            },
        });
    }

    // This will be expanded with Stripe integration
    async createCheckoutSession(userId: number, planId: number) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

        if (!user || !plan) {
            throw new Error('User or Plan not found');
        }

        // Placeholder for Stripe logic
        // return { url: 'https://checkout.stripe.com/...' };

        // For now, simulate a free upgrade or direct activation for testing
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                planId: plan.id,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
            }
        });

        return { success: true, message: `Plan ${plan.name} activated` };
    }

    async createManualSubscription(userId: number, planName: string, receiptFilename?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const plan = await this.prisma.plan.findUnique({ where: { name: planName } }); // name is unique in schema

        if (!user || !plan) {
            throw new Error('User or Plan not found');
        }

        // Record the payment/request
        await this.prisma.payment.create({
            data: {
                userId: userId,
                amount: plan.price,
                method: 'dinarak_manual',
                status: 'pending',
                receiptUrl: receiptFilename,
                notes: `Subscription request for ${plan.name}`
            }
        });

        // If it's the Free Trial, activate immediately? 
        // Or wait for approval even for Free Trial? "Billed manually" usually implies waiting.
        // But "Free Trial" usually is auto-active.
        if (plan.price.toNumber() === 0) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    planId: plan.id,
                    subscriptionStatus: SubscriptionStatus.ACTIVE, // Assuming ACTIVE for trial
                    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            });
            return { success: true, message: 'Free Trial Activated' };
        }

        // For paid plans, set status to PENDING or just record payment.
        // We don't have PENDING in SubscriptionStatus enum (FREE, TRIAL, ACTIVE, PAST_DUE, CANCELED).
        // So maybe don't change subscriptionStatus yet, or keep it FREE/TRIAL until approved.

        return { success: true, message: 'Request received. Waiting for approval.' };
    }
}
