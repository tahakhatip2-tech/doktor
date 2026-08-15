import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientReviewsService {
  constructor(private prisma: PrismaService) {}

  // ─── تقييمات العيادة ─────────────────────────────────────

  async getClinicReviews(clinicId: number) {
    const reviews = await this.prisma.clinicReview.findMany({
      where: { clinicId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: { select: { fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const total = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: total,
      distribution,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        patientName: r.patient.fullName,
        patientAvatar: r.patient.avatar,
      })),
    };
  }

  async upsertReview(
    clinicId: number,
    patientId: number,
    rating: number,
    comment?: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('التقييم يجب أن يكون بين 1 و 5');
    }

    const review = await this.prisma.clinicReview.upsert({
      where: { clinicId_patientId: { clinicId, patientId } },
      create: { clinicId, patientId, rating, comment },
      update: { rating, comment },
    });

    return review;
  }

  async getMyReview(clinicId: number, patientId: number) {
    return this.prisma.clinicReview.findUnique({
      where: { clinicId_patientId: { clinicId, patientId } },
    });
  }

  // ─── تقييمات الأطباء ─────────────────────────────────────

  async getDoctorReviewsById(clinicDoctorId: number) {
    const reviews = await this.prisma.doctorReview.findMany({
      where: { clinicDoctorId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: { select: { fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const total = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    return {
      avgRating: Math.round(avgRating * 10) / 10,
      totalReviews: total,
      distribution,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        patientName: r.patient.fullName,
        patientAvatar: r.patient.avatar,
      })),
    };
  }

  async upsertDoctorReview(
    clinicDoctorId: number,
    patientId: number,
    rating: number,
    comment?: string,
  ) {
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('التقييم يجب أن يكون بين 1 و 5');
    }

    // التحقق من وجود موعد مكتمل مع هذا الطبيب
    const hasCompleted = await this.prisma.appointment.findFirst({
      where: {
        clinicDoctorId,
        patientUserId: patientId,
        status: 'completed',
      },
    });

    if (!hasCompleted) {
      throw new ForbiddenException('يمكنك التقييم فقط بعد إتمام موعد مع هذا الطبيب');
    }

    return this.prisma.doctorReview.upsert({
      where: { clinicDoctorId_patientId: { clinicDoctorId, patientId } },
      create: { clinicDoctorId, patientId, rating, comment },
      update: { rating, comment },
    });
  }

  async getMyDoctorReview(clinicDoctorId: number, patientId: number) {
    return this.prisma.doctorReview.findUnique({
      where: { clinicDoctorId_patientId: { clinicDoctorId, patientId } },
    });
  }
}
