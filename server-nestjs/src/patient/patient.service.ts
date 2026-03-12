import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPatientDto, LoginPatientDto, UpdatePatientProfileDto } from './patient.dto';

@Injectable()
export class PatientService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterPatientDto) {
        // Check if phone already exists
        const existingPhone = await this.prisma.patient.findUnique({
            where: { phone: dto.phone },
        });
        if (existingPhone) {
            throw new ConflictException('رقم الهاتف مستخدم بالفعل، يرجى تسجيل الدخول');
        }

        // Auto-generate email from phone if not provided
        const email = dto.email || `${dto.phone}@hakeem.jo`;

        // Check if auto-generated or provided email already exists
        const existingEmail = await this.prisma.patient.findUnique({
            where: { email },
        });
        if (existingEmail) {
            throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create patient
        const patient = await this.prisma.patient.create({
            data: {
                email,
                password: hashedPassword,
                fullName: dto.fullName,
                phone: dto.phone,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                gender: dto.gender,
                address: dto.address,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                dateOfBirth: true,
                gender: true,
                address: true,
                createdAt: true,
            },
        });

        const token = this.jwtService.sign({
            sub: patient.id,
            phone: patient.phone,
            type: 'patient',
        });

        return { patient, token };
    }

    async login(dto: LoginPatientDto) {
        // Find patient by email
        const patient = await this.prisma.patient.findUnique({
            where: { email: dto.email },
        });

        if (!patient) {
            throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        if (!patient.isActive) {
            throw new UnauthorizedException('الحساب غير نشط');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, patient.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }

        const token = this.jwtService.sign({
            sub: patient.id,
            email: patient.email,
            type: 'patient',
        });

        const { password, ...patientData } = patient;
        return { patient: patientData, token };
    }

    async getProfile(patientId: number) {
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                dateOfBirth: true,
                gender: true,
                bloodType: true,
                allergies: true,
                chronicDiseases: true,
                emergencyContact: true,
                address: true,
                nationalId: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!patient) {
            throw new NotFoundException('المريض غير موجود');
        }

        return patient;
    }

    async updateProfile(patientId: number, dto: UpdatePatientProfileDto) {
        if (dto.phone) {
            const existingPhone = await this.prisma.patient.findFirst({
                where: {
                    phone: dto.phone,
                    NOT: { id: patientId },
                },
            });
            if (existingPhone) {
                throw new ConflictException('رقم الهاتف مستخدم بالفعل');
            }
        }

        const updatedPatient = await this.prisma.patient.update({
            where: { id: patientId },
            data: {
                ...dto,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                phone: true,
                avatar: true,
                dateOfBirth: true,
                gender: true,
                bloodType: true,
                allergies: true,
                chronicDiseases: true,
                emergencyContact: true,
                address: true,
                nationalId: true,
                updatedAt: true,
            },
        });

        return updatedPatient;
    }

    async getClinics() {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'USER',
                status: 'active',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                clinic_name: true,
                clinic_address: true,
                clinic_phone: true,
                clinic_specialty: true,
                working_hours: true,
                settings: {
                    where: {
                        key: { in: ['clinic_name', 'clinic_specialty', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url'] },
                    },
                    select: { key: true, value: true },
                },
                clinicReviews: {
                    select: { rating: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        // Merge settings keys into each clinic object
        return users
            .map((u) => {
                const settingsMap: Record<string, string> = {};
                u.settings.forEach((s) => { settingsMap[s.key] = s.value; });
                const resolvedClinicName = settingsMap['clinic_name'] || u.clinic_name;

                // حساب متوسط التقييم وعدد التقييمات
                const totalReviews = u.clinicReviews?.length || 0;
                const sumRating = totalReviews > 0 ? u.clinicReviews!.reduce((acc, curr) => acc + curr.rating, 0) : 0;
                const avgRating = totalReviews > 0 ? +(sumRating / totalReviews).toFixed(1) : 0;

                return {
                    ...u,
                    settings: undefined,
                    clinicReviews: undefined,
                    avgRating,
                    totalReviews,
                    clinic_name: resolvedClinicName,
                    clinic_specialty: settingsMap['clinic_specialty'] || u.clinic_specialty,
                    clinic_logo: settingsMap['clinic_logo'] || null,
                    clinic_description: settingsMap['clinic_description'] || null,
                    location_url: settingsMap['location_url'] || null,
                    clinic_address: settingsMap['address'] || u.clinic_address,
                    clinic_phone: settingsMap['phone'] || u.clinic_phone,
                };
            })
            // Only return clinics that have a name
            .filter((u) => u.clinic_name);
    }

    async getClinicById(clinicId: number) {
        const clinic = await this.prisma.user.findUnique({
            where: { id: clinicId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                clinic_name: true,
                clinic_address: true,
                clinic_phone: true,
                clinic_specialty: true,
                working_hours: true,
                settings: {
                    where: {
                        key: { in: ['clinic_name', 'clinic_specialty', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url'] },
                    },
                    select: { key: true, value: true },
                },
            },
        });

        if (!clinic) {
            throw new NotFoundException('العيادة غير موجودة');
        }

        const settingsMap: Record<string, string> = {};
        clinic.settings.forEach((s) => { settingsMap[s.key] = s.value; });

        return {
            ...clinic,
            settings: undefined,
            clinic_name: settingsMap['clinic_name'] || clinic.clinic_name,
            clinic_specialty: settingsMap['clinic_specialty'] || clinic.clinic_specialty,
            clinic_logo: settingsMap['clinic_logo'] || null,
            clinic_description: settingsMap['clinic_description'] || null,
            location_url: settingsMap['location_url'] || null,
            clinic_address: settingsMap['address'] || clinic.clinic_address,
            clinic_phone: settingsMap['phone'] || clinic.clinic_phone,
        };
    }
}
