import { Injectable, NotFoundException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class ClinicDoctorsService {
  constructor(private prisma: PrismaService) {}

  // جلب جميع موظفي العيادة
  async findAll(clinicId: number) {
    const doctors = await this.prisma.clinicDoctor.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });
    // نُعيد البيانات بدون passwordHash
    return doctors.map(({ passwordHash, ...d }) => ({
      ...d,
      hasLogin: !!passwordHash,
    }));
  }

  // إضافة موظف جديد
  async create(clinicId: number, data: {
    name: string;
    role?: string;
    specialty?: string;
    email?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
    username?: string;
    password?: string;
  }) {
    let passwordHash: string | undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.clinicDoctor.create({
      data: {
        clinicId,
        name: data.name,
        role: data.role || 'doctor',
        specialty: data.specialty,
        email: data.email,
        phone: data.phone,
        workingHours: data.workingHours,
        hourlyRate: data.hourlyRate,
        username: data.username || null,
        passwordHash: passwordHash || null,
      },
    }).then(({ passwordHash: _, ...d }) => ({ ...d, hasLogin: !!_ }));
  }

  // تعديل بيانات موظف
  async update(clinicId: number, id: number, data: {
    name?: string;
    role?: string;
    specialty?: string;
    email?: string;
    phone?: string;
    workingHours?: string;
    hourlyRate?: number;
    isActive?: boolean;
    username?: string;
    password?: string;
  }) {
    const doctor = await this.prisma.clinicDoctor.findFirst({ where: { id } });
    if (!doctor) throw new NotFoundException('الموظف غير موجود');
    if (doctor.clinicId !== clinicId) throw new ForbiddenException('غير مصرح لك');

    const updateData: any = { ...data };
    delete updateData.password;

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    return this.prisma.clinicDoctor.update({
      where: { id },
      data: updateData,
    }).then(({ passwordHash, ...d }) => ({ ...d, hasLogin: !!passwordHash }));
  }

  // حذف موظف
  async remove(clinicId: number, id: number) {
    const doctor = await this.prisma.clinicDoctor.findFirst({ where: { id } });
    if (!doctor) throw new NotFoundException('الموظف غير موجود');
    if (doctor.clinicId !== clinicId) throw new ForbiddenException('غير مصرح لك');

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

  // تسجيل دخول موظف/طبيب
  async loginAsStaff(username: string, password: string) {
    const staff = await this.prisma.clinicDoctor.findFirst({
      where: { username, isActive: true },
    });

    if (!staff || !staff.passwordHash) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const isMatch = await bcrypt.compare(password, staff.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const { passwordHash, ...safeStaff } = staff;
    return { ...safeStaff, hasLogin: true };
  }
}
