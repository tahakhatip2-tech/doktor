import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(data: any) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new ConflictException('البريد الإلكتروني مستخدم مسبقاً');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const pharmacy = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        clinic_name: data.clinic_name,
        role: 'PHARMACY',
      },
    });

    const payload = { sub: pharmacy.id, email: pharmacy.email, role: pharmacy.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: pharmacy.id,
        email: pharmacy.email,
        name: pharmacy.name,
        clinic_name: pharmacy.clinic_name,
        role: pharmacy.role,
      },
    };
  }

  async login(data: any) {
    const pharmacy = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!pharmacy || pharmacy.role !== 'PHARMACY') {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const isMatch = await bcrypt.compare(data.password, pharmacy.password);
    if (!isMatch) {
      throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    }

    const payload = { sub: pharmacy.id, email: pharmacy.email, role: pharmacy.role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: pharmacy.id,
        email: pharmacy.email,
        name: pharmacy.name,
        clinic_name: pharmacy.clinic_name,
        role: pharmacy.role,
      },
    };
  }

  async getProfile(pharmacyId: number) {
    try {
      const pharmacy = await this.prisma.user.findUnique({
        where: { id: pharmacyId },
      });
      if (!pharmacy) {
        throw new NotFoundException('الصيدلية غير موجودة');
      }
      const { password, ...result } = pharmacy as any;
      return result;
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error(
        `getProfile(${pharmacyId}) failed: ${err?.message || err}`,
        err?.stack,
      );
      throw new InternalServerErrorException(
        err?.message?.includes("Can't reach database server")
          ? 'تعذّر الاتصال بقاعدة البيانات. حاول مرة أخرى بعد قليل.'
          : 'فشل تحميل بيانات الصيدلية',
      );
    }
  }

  async getDashboardStats(pharmacyId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalPrescriptions, dispensedPrescriptions, pendingPrescriptions, todayPrescriptions] = await Promise.all([
      this.prisma.prescription.count({ where: { pharmacyId } }),
      this.prisma.prescription.count({ where: { pharmacyId, status: 'DISPENSED' } }),
      this.prisma.prescription.count({ where: { pharmacyId, status: 'PENDING' } }),
      this.prisma.prescription.count({ where: { pharmacyId, createdAt: { gte: today } } }),
    ]);

    return {
      totalPrescriptions,
      dispensedPrescriptions,
      pendingPrescriptions,
      todayPrescriptions,
    };
  }

  async getPrescriptions(pharmacyId: number, status?: string) {
    const whereClause: any = { pharmacyId };
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    return this.prisma.prescription.findMany({
      where: whereClause,
      include: {
        patient: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            gender: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
            clinic_name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async dispensePrescription(pharmacyId: number, prescriptionId: number) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, pharmacyId },
    });

    if (!prescription) {
      throw new NotFoundException('الوصفة غير موجودة');
    }

    return this.prisma.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'DISPENSED',
        dispensedAt: new Date(),
      },
    });
  }

  async getSettings(pharmacyId: number) {
    const pharmacy = await this.prisma.user.findUnique({
      where: { id: pharmacyId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        clinic_name: true,
        clinic_address: true,
        clinic_phone: true,
        clinic_logo: true,
        working_hours: true,
      },
    });

    const settingsList = await this.prisma.setting.findMany({
      where: { userId: pharmacyId },
    });

    const settingsObj: any = {};
    settingsList.forEach(s => {
      settingsObj[s.key] = s.value;
    });

    return { ...pharmacy, settings: settingsObj };
  }

  async updateSettings(pharmacyId: number, data: any) {
    const { settings, ...userUpdates } = data || {};

    if (
      typeof userUpdates.avatar === 'string' &&
      userUpdates.avatar.startsWith('data:')
    ) {
      this.logger.warn(
        `updateSettings(${pharmacyId}) received a base64 avatar — ignoring. ` +
          `Use POST /pharmacy/upload-logo to upload images.`,
      );
      delete userUpdates.avatar;
    }

    try {
      if (Object.keys(userUpdates).length > 0) {
        await this.prisma.user.update({
          where: { id: pharmacyId },
          data: userUpdates,
        });
      }

      if (settings && Object.keys(settings).length > 0) {
        for (const [key, value] of Object.entries(settings)) {
          await this.prisma.setting.upsert({
            where: {
              userId_key: {
                userId: pharmacyId,
                key: key,
              },
            },
            update: { value: String(value) },
            create: {
              userId: pharmacyId,
              key: key,
              value: String(value),
            },
          });
        }
      }

      return this.getProfile(pharmacyId);
    } catch (err: any) {
      this.logger.error(
        `updateSettings(${pharmacyId}) failed: ${err?.message || err}`,
        err?.stack,
      );
      throw new InternalServerErrorException(
        err?.message || 'فشل تحديث بيانات الصيدلية',
      );
    }
  }

  async updateAvatar(pharmacyId: number, avatarUrl: string) {
    try {
      await this.prisma.user.update({
        where: { id: pharmacyId },
        data: { avatar: avatarUrl, clinic_logo: avatarUrl },
      });
      return this.getProfile(pharmacyId);
    } catch (err: any) {
      this.logger.error(
        `updateAvatar(${pharmacyId}) failed: ${err?.message || err}`,
        err?.stack,
      );
      throw new InternalServerErrorException(
        err?.message || 'فشل حفظ شعار الصيدلية',
      );
    }
  }
}
