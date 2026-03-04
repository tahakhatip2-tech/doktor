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
        // Find patient by phone number
        const patient = await this.prisma.patient.findUnique({
            where: { phone: dto.phone },
        });

        if (!patient) {
            throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيحة');
        }

        if (!patient.isActive) {
            throw new UnauthorizedException('الحساب غير نشط');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, patient.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('رقم الهاتف أو كلمة المرور غير صحيحة');
        }

        const token = this.jwtService.sign({
            sub: patient.id,
            phone: patient.phone,
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
        return this.prisma.user.findMany({
            where: {
                role: 'USER',
                status: 'active',
                clinic_name: { not: null },
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
            },
            orderBy: { clinic_name: 'asc' },
        });
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
            },
        });

        if (!clinic) {
            throw new NotFoundException('العيادة غير موجودة');
        }

        return clinic;
    }
}
