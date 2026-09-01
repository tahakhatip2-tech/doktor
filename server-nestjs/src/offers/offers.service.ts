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
                            where: { key: { in: ['clinic_description', 'clinic_logo', 'clinic_name', 'clinic_specialty'] } },
                            select: { key: true, value: true }
                        }
                    } 
                },
                likes: true,
                comments: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true } },
                        patient: { select: { id: true, fullName: true, avatar: true } }
                    },
                    orderBy: { createdAt: 'asc' }
                },
                _count: { select: { likes: true, comments: true } },
            },
        });

        return offers.map(offer => {
            const { settings, ...userData } = offer.user as any;
            const settingsMap = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]));
            return {
                ...offer,
                isLiked: (offer.likes as any[])?.some(like => like.userId === userId),
                user: {
                    ...userData,
                    name: userData.name, // Always use profile name, ignore doctor_name from whatsapp settings to match patient.service.ts
                    clinic_name: settingsMap['clinic_name'] || userData.clinic_name,
                    clinic_specialty: settingsMap['clinic_specialty'] || settingsMap['clinic_description'] || userData.clinic_specialty,
                    clinic_logo: settingsMap['clinic_logo'] || null,
                },
                comments: (offer.comments || []).map((c: any) => ({
                    id: c.id,
                    offerId: c.offerId,
                    content: c.content,
                    createdAt: c.createdAt,
                    user: c.patient
                        ? { id: c.patient.id, name: c.patient.fullName, avatar: c.patient.avatar }
                        : c.user
                            ? { id: c.user.id, name: c.user.name, avatar: c.user.avatar }
                            : null,
                })),
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

    // ── الطبيب: تسجيل الإعجاب بعرض ───────────────────────────────────────────────
    async toggleLikeForDoctor(offerId: number, userId: number) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer) throw new NotFoundException('العرض غير موجود');

        const existingLike = await this.prisma.offerLike.findUnique({
            where: {
                offerId_userId: { offerId, userId }
            }
        });

        if (existingLike) {
            await this.prisma.offerLike.delete({ where: { id: existingLike.id } });
            return { success: true, liked: false };
        } else {
            await this.prisma.offerLike.create({
                data: { offerId, userId }
            });
            return { success: true, liked: true };
        }
    }

    // ── المريض: جلب كل العروض النشطة (Feed) ────────────────────────────
    async getActiveFeed(patientId?: number) {
        const now = new Date();

        // Run the two queries in parallel for speed
        const [offers, patientLikes] = await Promise.all([
            this.prisma.executeWithRetry(() =>
                this.prisma.offer.findMany({
                    where: {
                        isActive: true,
                        OR: [
                            { isPermanent: true },
                            { endDate: { gte: now }, startDate: { lte: now } },
                        ],
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 50, // limit for performance
                    select: {
                        id: true,
                        title: true,
                        content: true,
                        image: true,
                        isPermanent: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true,
                        isSponsored: true,
                        sponsorName: true,
                        sponsorLogo: true,
                        sponsorPhone: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                clinic_name: true,
                                avatar: true,
                                clinic_specialty: true,
                                phone: true,
                                settings: {
                                    where: { key: { in: ['clinic_logo', 'clinic_name', 'clinic_specialty'] } },
                                    select: { key: true, value: true }
                                }
                            }
                        },
                        // Only fetch last 3 comments (not all of them)
                        comments: {
                            take: 3,
                            orderBy: { createdAt: 'desc' },
                            select: {
                                id: true,
                                offerId: true,
                                content: true,
                                createdAt: true,
                                user: { select: { id: true, name: true, avatar: true } },
                                patient: { select: { id: true, fullName: true, avatar: true } }
                            },
                        },
                        _count: { select: { likes: true, comments: true } },
                    },
                })
            ),
            // Fetch only which offer IDs this patient has liked (much lighter)
            patientId
                ? this.prisma.offerLike.findMany({
                    where: { patientId },
                    select: { offerId: true },
                })
                : Promise.resolve([]),
        ]);

        const likedOfferIds = new Set((patientLikes as any[]).map((l: any) => l.offerId));

        return offers.map(offer => {
            const { settings, ...userData } = offer.user as any;
            const settingsMap = Object.fromEntries((settings || []).map((s: any) => [s.key, s.value]));
            return {
                ...offer,
                isSponsored: (offer as any).isSponsored ?? false,
                sponsorName: (offer as any).sponsorName ?? null,
                sponsorLogo: (offer as any).sponsorLogo ?? null,
                sponsorPhone: (offer as any).sponsorPhone ?? null,
                user: {
                    ...userData,
                    clinic_name: settingsMap['clinic_name'] || userData.clinic_name,
                    clinic_specialty: settingsMap['clinic_specialty'] || userData.clinic_specialty,
                    clinic_logo: settingsMap['clinic_logo'] || null,
                },
                comments: (offer.comments || []).reverse().map((c: any) => ({
                    id: c.id,
                    offerId: c.offerId,
                    content: c.content,
                    createdAt: c.createdAt,
                    user: c.patient
                        ? { id: c.patient.id, name: c.patient.fullName, avatar: c.patient.avatar }
                        : c.user
                            ? { id: c.user.id, name: c.user.name, avatar: c.user.avatar }
                            : null,
                })),
                likesCount: offer._count.likes,
                commentsCount: offer._count.comments,
                isLikedByMe: likedOfferIds.has(offer.id),
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

    // ── الطبيب: إضافة تعليق ────────────────────────────────────
    async addComment(offerId: number, userId: number, content: string) {
        return this.prisma.offerComment.create({
            data: { offerId, userId, content },
            include: { user: { select: { id: true, name: true, avatar: true } } }
        });
    }

    // ── المريض: إضافة تعليق ────────────────────────────────────
    async addPatientComment(offerId: number, patientId: number, content: string) {
        const offer = await this.prisma.offer.findUnique({ where: { id: offerId } });
        if (!offer) throw new NotFoundException('العرض غير موجود');

        const comment = await this.prisma.offerComment.create({
            data: { offerId, patientId, content },
            include: { patient: { select: { id: true, fullName: true, avatar: true } } }
        });

        return {
            id: comment.id,
            offerId: comment.offerId,
            content: comment.content,
            createdAt: comment.createdAt,
            user: {
                id: comment.patient!.id,
                name: comment.patient!.fullName,
                avatar: comment.patient!.avatar,
            },
        };
    }
}
