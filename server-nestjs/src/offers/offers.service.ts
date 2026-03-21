import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
    constructor(private prisma: PrismaService) {}

    // ── الطبيب: إنشاء عرض ─────────────────────────────────────────────
    async create(userId: number, dto: CreateOfferDto) {
        return this.prisma.offer.create({
            data: {
                userId,
                title: dto.title,
                content: dto.content,
                image: dto.image,
                isPermanent: dto.isPermanent,
                startDate: dto.startDate ? new Date(dto.startDate) : new Date(),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
            include: { user: { select: { id: true, name: true, clinic_name: true, avatar: true, clinic_specialty: true } }, likes: true },
        });
    }

    // ── الطبيب: جلب عروضه ─────────────────────────────────────────────
    async findMyOffers(userId: number) {
        const offers = await this.prisma.offer.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { 
                    select: { 
                        id: true, name: true, clinic_name: true, avatar: true, clinic_specialty: true,
                        settings: {
                            where: { key: { in: ['clinic_description', 'clinic_logo', 'clinic_name', 'doctor_name'] } },
                            select: { key: true, value: true }
                        }
                    } 
                },
                likes: true,
                _count: { select: { likes: true } },
            },
        });

        return offers.map(offer => {
            const { settings, ...userData } = offer.user as any;
            const settingsMap = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]));
            return {
                ...offer,
                user: {
                    ...userData,
                    name: settingsMap['doctor_name'] || userData.name,
                    clinic_name: settingsMap['clinic_name'] || userData.clinic_name,
                    clinic_specialty: settingsMap['clinic_description'] || userData.clinic_specialty,
                    clinic_logo: settingsMap['clinic_logo'] || null,
                }
            };
        });
    }

    // ── الطبيب: حذف عرض ───────────────────────────────────────────────
    async delete(userId: number, offerId: number) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer) throw new NotFoundException('العرض غير موجود');
        if (offer.userId !== userId) throw new ForbiddenException('غير مصرح');
        await this.prisma.offer.delete({ where: { id: offerId } });
        return { success: true };
    }

    // ── المريض: جلب كل العروض النشطة (Feed) ────────────────────────────
    async getActiveFeed(patientId?: number) {
        const now = new Date();
        const offers = await this.prisma.offer.findMany({
            where: {
                isActive: true,
                OR: [
                    { isPermanent: true },
                    { endDate: { gte: now }, startDate: { lte: now } },
                ],
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { 
                    select: { 
                        id: true, 
                        name: true, 
                        clinic_name: true, 
                        avatar: true, 
                        clinic_specialty: true, 
                        phone: true,
                        settings: {
                            where: { key: { in: ['clinic_description', 'clinic_logo', 'clinic_name', 'doctor_name'] } },
                            select: { key: true, value: true }
                        }
                    } 
                },
                likes: true,
                _count: { select: { likes: true } },
            },
        });

        return offers.map(offer => {
            const { settings, ...userData } = offer.user;
            const settingsMap = Object.fromEntries((settings || []).map(s => [s.key, s.value]));
            return {
                ...offer,
                user: {
                    ...userData,
                    name: settingsMap['doctor_name'] || userData.name,
                    clinic_name: settingsMap['clinic_name'] || userData.clinic_name,
                    clinic_specialty: settingsMap['clinic_description'] || userData.clinic_specialty,
                    clinic_description: settingsMap['clinic_description'] || userData.clinic_specialty || null,
                    clinic_logo: settingsMap['clinic_logo'] || null,
                },
                likesCount: offer._count.likes,
                isLikedByMe: patientId
                    ? offer.likes.some(l => l.patientId === patientId)
                    : false,
            };
        });
    }

    // ── المريض: إعجاب / إلغاء إعجاب ────────────────────────────────────
    async toggleLike(offerId: number, patientId: number) {
        const existing = await this.prisma.offerLike.findUnique({
            where: { offerId_patientId: { offerId, patientId } },
        });

        if (existing) {
            await this.prisma.offerLike.delete({ where: { id: existing.id } });
            return { liked: false };
        } else {
            await this.prisma.offerLike.create({ data: { offerId, patientId } });
            return { liked: true };
        }
    }
}
