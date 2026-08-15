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
        if (!dto.email && !dto.phone) {
            throw new UnauthorizedException('الرجاء إدخال البريد الإلكتروني أو رقم الهاتف');
        }

        // Find patient by email or phone
        const patient = await this.prisma.patient.findFirst({
            where: { 
                OR: [
                    { email: dto.email || undefined },
                    { phone: dto.phone || undefined }
                ]
            },
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

        if (dto.email) {
            const existingEmail = await this.prisma.patient.findFirst({
                where: {
                    email: dto.email,
                    NOT: { id: patientId },
                },
            });
            if (existingEmail) {
                throw new ConflictException('البريد الإلكتروني مستخدم بالفعل');
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

    async updateAvatar(patientId: number, avatarUrl: string) {
        const updated = await this.prisma.patient.update({
            where: { id: patientId },
            data: { avatar: avatarUrl },
            select: {
                id: true,
                avatar: true,
                updatedAt: true,
            },
        });
        return updated;
    }

    async getClinics() {
        const users = await this.prisma.user.findMany({
            where: {
                role: { in: ['USER', 'ADMIN'] },
                status: 'active',
                // استثناء مراكز التجميل — يتم تصنيفها عبر الإعداد clinic_category
                NOT: {
                    settings: {
                        some: { key: 'clinic_category', value: 'beauty_center' },
                    },
                },
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
                        key: { in: ['clinic_name', 'clinic_specialty', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url', 'lat', 'lng', 'working_hours_start', 'working_hours_end'] },
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

                const working_hours = (settingsMap['working_hours_start'] && settingsMap['working_hours_end'])
                    ? `${settingsMap['working_hours_start']} - ${settingsMap['working_hours_end']}`
                    : u.working_hours;

                return {
                    ...u,
                    settings: undefined,
                    clinicReviews: undefined,
                    working_hours,
                    avgRating,
                    totalReviews,
                    clinic_name: resolvedClinicName,
                    clinic_specialty: settingsMap['clinic_specialty'] || u.clinic_specialty,
                    clinic_logo: settingsMap['clinic_logo'] || null,
                    clinic_description: settingsMap['clinic_description'] || null,
                    location_url: settingsMap['location_url'] || null,
                    clinic_address: settingsMap['address'] || u.clinic_address,
                    clinic_phone: settingsMap['phone'] || u.clinic_phone,
                    lat: settingsMap['lat'] ? parseFloat(settingsMap['lat']) : null,
                    lng: settingsMap['lng'] ? parseFloat(settingsMap['lng']) : null,
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
                role: true,
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
                        key: { in: ['clinic_name', 'clinic_specialty', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url', 'lat', 'lng', 'working_hours_start', 'working_hours_end'] },
                    },
                    select: { key: true, value: true },
                },
                clinicDoctors: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        role: true,
                        name: true,
                        specialty: true,
                        avatar: true,
                        workingHours: true,
                        workingDays: true,
                        patientDuration: true,
                        certifications: true,
                        experienceYears: true,
                        doctorReviews: {
                            select: { rating: true },
                        },
                    }
                }
            },
        });

        if (!clinic) {
            throw new NotFoundException('العيادة غير موجودة');
        }

        const settingsMap: Record<string, string> = {};
        clinic.settings.forEach((s) => { settingsMap[s.key] = s.value; });

        const working_hours = (settingsMap['working_hours_start'] && settingsMap['working_hours_end'])
            ? `${settingsMap['working_hours_start']} - ${settingsMap['working_hours_end']}`
            : clinic.working_hours;

        return {
            ...clinic,
            settings: undefined,
            working_hours,
            clinic_name: settingsMap['clinic_name'] || clinic.clinic_name,
            clinic_specialty: settingsMap['clinic_specialty'] || clinic.clinic_specialty,
            clinic_logo: settingsMap['clinic_logo'] || null,
            clinic_description: settingsMap['clinic_description'] || null,
            location_url: settingsMap['location_url'] || null,
            clinic_address: settingsMap['address'] || clinic.clinic_address,
            clinic_phone: settingsMap['phone'] || clinic.clinic_phone,
            lng: settingsMap['lng'] ? parseFloat(settingsMap['lng']) : null,
            clinicDoctors: clinic.clinicDoctors.map((doc: any) => {
                const reviews = doc.doctorReviews || [];
                const totalReviews = reviews.length;
                const avgRating = totalReviews > 0
                    ? Math.round((reviews.reduce((s: number, r: any) => s + r.rating, 0) / totalReviews) * 10) / 10
                    : 0;
                const { doctorReviews: _, ...rest } = doc;
                return { ...rest, avgRating, totalReviews };
            }),
        };
    }

    async getPharmacies() {
        const users = await this.prisma.user.findMany({
            where: {
                role: 'PHARMACY',
                status: 'active',
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                clinic_name: true, // Used as Pharmacy Name
                clinic_address: true,
                clinic_phone: true,
                working_hours: true,
                settings: {
                    where: {
                        key: { in: ['clinic_name', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url', 'lat', 'lng'] },
                    },
                    select: { key: true, value: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        return users.map((u) => {
            const settingsMap: Record<string, string> = {};
            u.settings.forEach((s) => { settingsMap[s.key] = s.value; });
            const resolvedPharmacyName = settingsMap['clinic_name'] || u.clinic_name;

            return {
                ...u,
                settings: undefined,
                clinic_name: resolvedPharmacyName,
                clinic_logo: settingsMap['clinic_logo'] || null,
                clinic_description: settingsMap['clinic_description'] || null,
                location_url: settingsMap['location_url'] || null,
                clinic_address: settingsMap['address'] || u.clinic_address,
                clinic_phone: settingsMap['phone'] || u.clinic_phone,
                lat: settingsMap['lat'] ? parseFloat(settingsMap['lat']) : null,
                lng: settingsMap['lng'] ? parseFloat(settingsMap['lng']) : null,
            };
        }).filter(u => u.clinic_name);
    }

    // ─── مراكز التجميل ──────────────────────────────────────────────────────

    async getBeautyCenters() {
        // نجلب مراكز التجميل بناءً على إعداد clinic_category = beauty_center
        // هذا يعمل لكل المستخدمين بصرف النظر عن الـ role (USER, ADMIN, BEAUTY)
        const users = await this.prisma.user.findMany({
            where: {
                status: 'active',
                OR: [
                    // تصنيف عبر الإعداد (الطريقة الجديدة الصحيحة)
                    {
                        settings: {
                            some: { key: 'clinic_category', value: 'beauty_center' },
                        },
                    },
                    // أو عبر الـ role القديم للتوافق مع البيانات الموجودة
                    { role: 'BEAUTY' as any },
                ],
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
                working_hours: true,
                settings: {
                    where: {
                        key: { in: ['clinic_name', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url', 'lat', 'lng'] },
                    },
                    select: { key: true, value: true },
                },
                clinicReviews: {
                    select: { rating: true },
                },
                beautyServices: {
                    where: { isActive: true },
                    select: { id: true, name: true, icon: true, price: true, duration: true },
                    take: 6,
                },
            },
            orderBy: { name: 'asc' },
        });

        return users.map((u) => {
            const settingsMap: Record<string, string> = {};
            u.settings.forEach((s) => { settingsMap[s.key] = s.value; });

            const totalReviews = u.clinicReviews?.length || 0;
            const avgRating = totalReviews > 0
                ? +(u.clinicReviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
                : 0;

            return {
                ...u,
                settings: undefined,
                clinicReviews: undefined,
                avgRating,
                totalReviews,
                clinic_name: settingsMap['clinic_name'] || u.clinic_name,
                clinic_logo: settingsMap['clinic_logo'] || null,
                clinic_description: settingsMap['clinic_description'] || null,
                location_url: settingsMap['location_url'] || null,
                clinic_address: settingsMap['address'] || u.clinic_address,
                clinic_phone: settingsMap['phone'] || u.clinic_phone,
                lat: settingsMap['lat'] ? parseFloat(settingsMap['lat']) : null,
                lng: settingsMap['lng'] ? parseFloat(settingsMap['lng']) : null,
            };
        }).filter(u => u.clinic_name);
    }

    async getBeautyCenterById(centerId: number) {
        const center = await this.prisma.user.findUnique({
            where: { id: centerId },
            select: {
                id: true,
                role: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                clinic_name: true,
                clinic_address: true,
                clinic_phone: true,
                working_hours: true,
                settings: {
                    where: {
                        key: { in: ['clinic_name', 'clinic_specialty', 'clinic_logo', 'clinic_description', 'address', 'phone', 'location_url', 'lat', 'lng', 'working_hours_start', 'working_hours_end'] },
                    },
                    select: { key: true, value: true },
                },
                clinicReviews: {
                    select: { rating: true },
                },
                beautyServices: {
                    where: { isActive: true },
                    select: { id: true, name: true, description: true, icon: true, price: true, duration: true },
                },
            },
        });

        if (!center) throw new NotFoundException('مركز التجميل غير موجود');

        const settingsMap: Record<string, string> = {};
        center.settings.forEach((s) => { settingsMap[s.key] = s.value; });

        const totalReviews = center.clinicReviews?.length || 0;
        const avgRating = totalReviews > 0
            ? +(center.clinicReviews!.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
            : 0;

        const working_hours = (settingsMap['working_hours_start'] && settingsMap['working_hours_end'])
            ? `${settingsMap['working_hours_start']} - ${settingsMap['working_hours_end']}`
            : center.working_hours;

        return {
            ...center,
            settings: undefined,
            clinicReviews: undefined,
            avgRating,
            totalReviews,
            working_hours,
            clinic_name: settingsMap['clinic_name'] || center.clinic_name,
            clinic_specialty: settingsMap['clinic_specialty'] || 'مركز تجميل وعناية بالبشرة',
            clinic_logo: settingsMap['clinic_logo'] || null,
            clinic_description: settingsMap['clinic_description'] || null,
            location_url: settingsMap['location_url'] || null,
            clinic_address: settingsMap['address'] || center.clinic_address,
            clinic_phone: settingsMap['phone'] || center.clinic_phone,
            lat: settingsMap['lat'] ? parseFloat(settingsMap['lat']) : null,
            lng: settingsMap['lng'] ? parseFloat(settingsMap['lng']) : null,
        };
    }

    async getPrescriptions(patientId: number) {
        return this.prisma.prescription.findMany({
            where: { patientId },
            include: {
                doctor: {
                    select: { id: true, name: true, clinic_name: true }
                },
                pharmacy: {
                    select: { id: true, name: true, clinic_name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async sendPrescriptionToPharmacy(patientId: number, prescriptionId: number, pharmacyId: number) {
        // 1. Verify the prescription belongs to this patient and is in PENDING status
        const prescription = await this.prisma.prescription.findFirst({
            where: { id: prescriptionId, patientId },
            include: {
                doctor: { select: { id: true, name: true, clinic_name: true } },
            }
        });

        if (!prescription) {
            throw new NotFoundException('الوصفة غير موجودة');
        }

        if (prescription.status !== 'PENDING') {
            throw new ConflictException('هذه الوصفة تم إرسالها مسبقاً أو تم صرفها');
        }

        // 2. Verify the pharmacy exists and is active
        const pharmacy = await this.prisma.user.findFirst({
            where: { id: pharmacyId, role: 'PHARMACY', status: 'active' },
            select: { id: true, name: true, clinic_name: true }
        });

        if (!pharmacy) {
            throw new NotFoundException('الصيدلية غير موجودة أو غير نشطة');
        }

        // 3. Get patient info for notification
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
            select: { fullName: true }
        });

        // 4. Update prescription atomically
        const updatedPrescription = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.prescription.update({
                where: { id: prescriptionId },
                data: {
                    pharmacyId,
                    status: 'SENT_TO_PHARMACY'
                },
                include: {
                    doctor: { select: { id: true, name: true, clinic_name: true } },
                    pharmacy: { select: { id: true, name: true, clinic_name: true } },
                }
            });

            // 5. Create notification for the pharmacy
            await tx.notification.create({
                data: {
                    userId: pharmacyId,
                    type: 'NEW_PRESCRIPTION',
                    title: 'وصفة طبية جديدة',
                    message: `وصفة طبية جديدة من د. ${prescription.doctor?.name || 'طبيب'} للمريض ${patient?.fullName || 'مريض'} بانتظار الصرف.`,
                    priority: 'HIGH',
                }
            });

            return updated;
        });

        return updatedPrescription;
    }
}
