import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AppointmentsService', () => {
    let service: AppointmentsService;
    let prismaService: PrismaService;

    const mockPrismaService = {
        appointment: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
        },
        contact: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppointmentsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<AppointmentsService>(AppointmentsService);
        prismaService = module.get<PrismaService>(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return all appointments for a user', async () => {
            const mockAppointments = [
                {
                    id: 1,
                    phone: '+962791234567',
                    customerName: 'أحمد محمد',
                    appointmentDate: new Date('2026-01-15T10:00:00.000Z'),
                    status: 'confirmed',
                    userId: 1,
                },
                {
                    id: 2,
                    phone: '+962797654321',
                    customerName: 'محمد أحمد',
                    appointmentDate: new Date('2026-01-16T11:00:00.000Z'),
                    status: 'pending',
                    userId: 1,
                },
            ];

            mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await service.findAll(1, {});

            expect(result).toEqual(mockAppointments);
            expect(prismaService.appointment.findMany).toHaveBeenCalledWith({
                where: { userId: 1 },
                include: expect.any(Object),
                orderBy: { appointmentDate: 'desc' },
            });
        });

        it('should filter appointments by status', async () => {
            const mockAppointments = [
                {
                    id: 1,
                    phone: '+962791234567',
                    customerName: 'أحمد محمد',
                    appointmentDate: new Date('2026-01-15T10:00:00.000Z'),
                    status: 'confirmed',
                    userId: 1,
                },
            ];

            mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await service.findAll(1, { status: 'confirmed' });

            expect(result).toEqual(mockAppointments);
            expect(prismaService.appointment.findMany).toHaveBeenCalledWith({
                where: { userId: 1, status: 'confirmed' },
                include: expect.any(Object),
                orderBy: { appointmentDate: 'desc' },
            });
        });
    });

    describe('getToday', () => {
        it('should return today\'s appointments', async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const mockAppointments = [
                {
                    id: 1,
                    phone: '+962791234567',
                    customerName: 'أحمد محمد',
                    appointmentDate: new Date(),
                    status: 'confirmed',
                    userId: 1,
                },
            ];

            mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);

            const result = await service.getToday(1);

            expect(result).toEqual(mockAppointments);
            expect(prismaService.appointment.findMany).toHaveBeenCalledWith({
                where: {
                    userId: 1,
                    appointmentDate: {
                        gte: expect.any(Date),
                        lt: expect.any(Date),
                    },
                },
                include: expect.any(Object),
                orderBy: { appointmentDate: 'asc' },
            });
        });
    });

    describe('create', () => {
        it('should create a new appointment', async () => {
            const createData = {
                phone: '+962791234567',
                customerName: 'أحمد محمد',
                appointmentDate: new Date('2026-01-15T10:00:00.000Z'),
                status: 'confirmed',
            };

            const mockAppointment = {
                id: 1,
                ...createData,
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

            const result = await service.create(1, createData);

            expect(result).toEqual(mockAppointment);
            expect(prismaService.appointment.create).toHaveBeenCalledWith({
                data: {
                    ...createData,
                    userId: 1,
                },
                include: expect.any(Object),
            });
        });

        it('should create contact if not exists', async () => {
            const createData = {
                phone: '+962791234567',
                customerName: 'أحمد محمد',
                appointmentDate: new Date('2026-01-15T10:00:00.000Z'),
            };

            mockPrismaService.contact.findFirst.mockResolvedValue(null);
            mockPrismaService.contact.create.mockResolvedValue({
                id: 1,
                phone: '+962791234567',
                name: 'أحمد محمد',
                userId: 1,
            });

            const mockAppointment = {
                id: 1,
                ...createData,
                userId: 1,
                patientId: 1,
            };

            mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

            await service.create(1, createData);

            expect(prismaService.contact.findFirst).toHaveBeenCalled();
            expect(prismaService.contact.create).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update an appointment', async () => {
            const updateData = {
                status: 'completed',
                notes: 'تم إكمال الموعد',
            };

            const mockAppointment = {
                id: 1,
                phone: '+962791234567',
                customerName: 'أحمد محمد',
                appointmentDate: new Date('2026-01-15T10:00:00.000Z'),
                ...updateData,
                userId: 1,
            };

            mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);
            mockPrismaService.appointment.update.mockResolvedValue(mockAppointment);

            const result = await service.update(1, 1, updateData);

            expect(result).toEqual(mockAppointment);
            expect(prismaService.appointment.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: expect.any(Object),
            });
        });

        it('should throw NotFoundException if appointment not found', async () => {
            mockPrismaService.appointment.findUnique.mockResolvedValue(null);

            await expect(service.update(1, 999, { status: 'completed' }))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should delete an appointment', async () => {
            const mockAppointment = {
                id: 1,
                userId: 1,
            };

            mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);
            mockPrismaService.appointment.delete.mockResolvedValue(mockAppointment);

            const result = await service.remove(1, 1);

            expect(result).toEqual(mockAppointment);
            expect(prismaService.appointment.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
        });

        it('should throw NotFoundException if appointment not found', async () => {
            mockPrismaService.appointment.findUnique.mockResolvedValue(null);

            await expect(service.remove(1, 999))
                .rejects
                .toThrow(NotFoundException);
        });
    });

    describe('getStats', () => {
        it('should return appointment statistics', async () => {
            const mockStats = {
                total: 100,
                confirmed: 60,
                pending: 20,
                cancelled: 10,
                completed: 10,
            };

            mockPrismaService.appointment.count.mockResolvedValueOnce(100);
            mockPrismaService.appointment.count.mockResolvedValueOnce(60);
            mockPrismaService.appointment.count.mockResolvedValueOnce(20);
            mockPrismaService.appointment.count.mockResolvedValueOnce(10);
            mockPrismaService.appointment.count.mockResolvedValueOnce(10);

            const result = await service.getStats(1);

            expect(result).toBeDefined();
            expect(prismaService.appointment.count).toHaveBeenCalledTimes(5);
        });
    });

    describe('isSlotAvailable', () => {
        it('should return true if slot is available', async () => {
            mockPrismaService.appointment.findMany.mockResolvedValue([]);

            const appointmentDate = new Date('2026-01-15T10:00:00.000Z');
            const result = await service.isSlotAvailable(1, appointmentDate, 30);

            expect(result).toBe(true);
        });

        it('should return false if slot is occupied', async () => {
            const existingAppointment = {
                id: 1,
                appointmentDate: new Date('2026-01-15T10:00:00.000Z'),
                duration: 30,
            };

            mockPrismaService.appointment.findMany.mockResolvedValue([existingAppointment]);

            const appointmentDate = new Date('2026-01-15T10:15:00.000Z');
            const result = await service.isSlotAvailable(1, appointmentDate, 30);

            expect(result).toBe(false);
        });
    });
});
