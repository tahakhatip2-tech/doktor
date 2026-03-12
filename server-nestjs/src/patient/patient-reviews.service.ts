import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientReviewsService {
  constructor(private prisma: PrismaService) {}

  // جلب تقييمات عيادة مع الإحصائيات
  async getClinicReviews(clinicId: number) {
    const reviews = await this.prisma.clinicReview.findMany({
      where: { clinicId },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        patient: {
          select: { fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const total = reviews.length;
    const avgRating = total > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
      : 0;

    // توزيع النجوم
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

  // إضافة أو تعديل تقييم
  async upsertReview(
    clinicId: number,
    patientId: number,
    rating: number,
    comment?: string,
  ) {
    try {
      // التحقق أن التقييم بين 1 و 5
      if (rating < 1 || rating > 5) {
        throw new BadRequestException('التقييم يجب أن يكون بين 1 و 5');
      }

      // تم تعطيل هذا الشرط مؤقتاً لتسهيل التجربة
      /*
      const hasCompleted = await this.prisma.appointment.findFirst({
        where: {
          userId: clinicId,
          patientUserId: patientId,
          status: 'completed',
        },
      });

      if (!hasCompleted) {
        throw new ForbiddenException('يمكنك التقييم فقط بعد إتمام زيارة في هذه العيادة');
      }
      */

      const review = await this.prisma.clinicReview.upsert({
        where: {
          clinicId_patientId: { clinicId, patientId },
        },
        create: { clinicId, patientId, rating, comment },
        update: { rating, comment },
      });

      return review;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  // جلب تقييم مريض معين لعيادة (للتحقق إن كان قد قيّم)
  async getMyReview(clinicId: number, patientId: number) {
    return this.prisma.clinicReview.findUnique({
      where: { clinicId_patientId: { clinicId, patientId } },
    });
  }

  // جلب تقييمات عيادة للطبيب (بوابة الطبيب)
  async getDoctorReviews(doctorId: number) {
    return this.getClinicReviews(doctorId);
  }
}
