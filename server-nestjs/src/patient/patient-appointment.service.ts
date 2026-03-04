import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientAppointmentDto, CancelAppointmentDto } from './patient-appointment.dto';

@Injectable()
export class PatientAppointmentService {
    constructor(private prisma: PrismaService) { }

    async createAppointment(patientId: number, dto: CreatePatientAppointmentDto) {
        // Verify clinic exists
        const clinic = await this.prisma.user.findUnique({
            where: { id: dto.clinicId },
        });

        if (!clinic) {
            throw new NotFoundException('العيادة غير موجودة');
        }

        // Get patient data
        const patient = await this.prisma.patient.findUnique({
            where: { id: patientId },
        });

        if (!patient) {
            throw new NotFoundException('المريض غير موجود');
        }

        // Validate appointment date is in the future
        const appointmentDate = new Date(dto.appointmentDate);
        if (appointmentDate < new Date()) {
            throw new BadRequestException('لا يمكن حجز موعد في الماضي');
        }

        // ─── التحقق من عدم تعارض الموعد مع مواعيد موجودة ───────────────────
        const duration = dto.duration || 30;
        const endDate = new Date(appointmentDate.getTime() + duration * 60000);

        const conflictingAppointment = await this.prisma.appointment.findFirst({
            where: {
                userId: dto.clinicId,
                status: { notIn: ['cancelled'] },
                AND: [
                    { appointmentDate: { lt: endDate } },
                    { appointmentDate: { gte: new Date(appointmentDate.getTime() - duration * 60000) } },
                ],
            },
        });

        if (conflictingAppointment) {
            throw new BadRequestException('هذا الموعد محجوز بالفعل، يرجى اختيار وقت آخر');
        }
        // ─────────────────────────────────────────────────────────────────────

        // Create appointment with pending status
        const appointment = await this.prisma.appointment.create({
            data: {
                userId: dto.clinicId,
                patientUserId: patientId,
                phone: patient.phone,
                customerName: dto.customerName ? dto.customerName : patient.fullName,
                appointmentDate: appointmentDate,
                status: 'pending', // Waiting for doctor confirmation
                notes: dto.notes,
                duration: dto.duration || 30,
                type: 'consultation',
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        clinic_name: true,
                        clinic_phone: true,
                    },
                },
            },
        });

        // Create notification for patient
        await this.prisma.patientNotification.create({
            data: {
                patientId: patientId,
                type: 'appointment_created',
                title: 'تم إرسال طلب الموعد',
                message: `تم إرسال طلب موعد إلى ${clinic.clinic_name || clinic.name}. في انتظار التأكيد من الطبيب.`,
                appointmentId: appointment.id,
            },
        });

        // Create notification for doctor
        await this.prisma.notification.create({
            data: {
                userId: dto.clinicId,
                type: 'NEW_APPOINTMENT_REQUEST',
                title: 'طلب موعد جديد',
                message: `طلب موعد جديد من ${patient.fullName} في ${new Date(dto.appointmentDate).toLocaleString('ar-EG')}`,
                priority: 'HIGH',
                appointmentId: appointment.id,
            },
        });

        return appointment;
    }

    async getMyAppointments(patientId: number, status?: string) {
        const where: any = {
            patientUserId: patientId,
        };

        if (status) {
            where.status = status;
        }

        const appointments = await this.prisma.appointment.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        clinic_name: true,
                        clinic_address: true,
                        clinic_phone: true,
                        clinic_specialty: true,
                    },
                },
            },
            orderBy: {
                appointmentDate: 'desc',
            },
        });

        return appointments;
    }

    async getUpcomingAppointments(patientId: number) {
        const now = new Date();

        const appointments = await this.prisma.appointment.findMany({
            where: {
                patientUserId: patientId,
                appointmentDate: {
                    gte: now,
                },
                status: {
                    in: ['pending', 'confirmed'],
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        clinic_name: true,
                        clinic_address: true,
                        clinic_phone: true,
                        clinic_specialty: true,
                    },
                },
            },
            orderBy: {
                appointmentDate: 'asc',
            },
        });

        return appointments;
    }

    async getAppointmentById(patientId: number, appointmentId: number) {
        const appointment = await this.prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientUserId: patientId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        clinic_name: true,
                        clinic_address: true,
                        clinic_phone: true,
                        clinic_specialty: true,
                    },
                },
                medicalRecords: true,
            },
        });

        if (!appointment) {
            throw new NotFoundException('الموعد غير موجود');
        }

        return appointment;
    }

    async cancelAppointment(patientId: number, appointmentId: number, dto: CancelAppointmentDto) {
        const appointment = await this.prisma.appointment.findFirst({
            where: {
                id: appointmentId,
                patientUserId: patientId,
            },
            include: {
                user: true,
            },
        });

        if (!appointment) {
            throw new NotFoundException('الموعد غير موجود');
        }

        // Check if appointment can be cancelled
        if (appointment.status === 'completed') {
            throw new BadRequestException('لا يمكن إلغاء موعد مكتمل');
        }

        if (appointment.status === 'cancelled') {
            throw new BadRequestException('الموعد ملغي بالفعل');
        }

        // Update appointment status
        const updatedAppointment = await this.prisma.appointment.update({
            where: { id: appointmentId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
                cancellationReason: dto.reason || 'تم الإلغاء من قبل المريض',
            },
        });

        // Notify patient
        await this.prisma.patientNotification.create({
            data: {
                patientId: patientId,
                type: 'appointment_cancelled',
                title: 'تم إلغاء الموعد',
                message: `تم إلغاء موعدك مع ${appointment.user?.clinic_name || appointment.user?.name || 'العيادة'}`,
                appointmentId: appointment.id,
            },
        });

        // Notify doctor
        if (appointment.userId) {
            await this.prisma.notification.create({
                data: {
                    userId: appointment.userId,
                    type: 'APPOINTMENT_CANCELLED',
                    title: 'تم إلغاء موعد',
                    message: `تم إلغاء الموعد من قبل ${appointment.customerName}. السبب: ${dto.reason || 'غير محدد'}`,
                    priority: 'MEDIUM',
                    appointmentId: appointment.id,
                },
            });
        }

        return updatedAppointment;
    }

    async getMedicalRecords(patientId: number) {
        const records = await this.prisma.medicalRecord.findMany({
            where: {
                patientUserId: patientId,
            },
            include: {
                appointment: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                clinic_name: true,
                                clinic_specialty: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return records;
    }
}
