import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClinicDoctorsService {
  constructor(private prisma: PrismaService) {}

  // جلب جميع أطباء العيادة
  async findAll(clinicId: number) {
    return this.prisma.clinicDoctor.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // إضافة طبيب جديد
  async create(clinicId: number, data: {
    name: string;
    specialty?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
  }) {
    return this.prisma.clinicDoctor.create({
      data: {
        clinicId,
        name: data.name,
        specialty: data.specialty,
        phone: data.phone,
        workingHours: data.workingHours,
        hourlyRate: data.hourlyRate,
      },
    });
  }

  // تعديل بيانات طبيب
  async update(clinicId: number, id: number, data: {
    name?: string;
    specialty?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
    isActive?: boolean;
  }) {
    const doctor = await this.prisma.clinicDoctor.findFirst({ where: { id } });
    if (!doctor) throw new NotFoundException('الطبيب غير موجود');
    if (doctor.clinicId !== clinicId) throw new ForbiddenException('غير مصرح لك');

    return this.prisma.clinicDoctor.update({
      where: { id },
      data,
    });
  }

  // حذف طبيب
  async remove(clinicId: number, id: number) {
    const doctor = await this.prisma.clinicDoctor.findFirst({ where: { id } });
    if (!doctor) throw new NotFoundException('الطبيب غير موجود');
    if (doctor.clinicId !== clinicId) throw new ForbiddenException('غير مصرح لك');

    // نجعل المواعيد والسجلات لا تشير لهذا الطبيب بدل الحذف الكسري
    await this.prisma.appointment.updateMany({
      where: { clinicDoctorId: id },
      data: { clinicDoctorId: null },
    });
    await this.prisma.medicalRecord.updateMany({
      where: { treatingDoctorId: id },
      data: { treatingDoctorId: null },
    });

    return this.prisma.clinicDoctor.delete({ where: { id } });
  }
}
