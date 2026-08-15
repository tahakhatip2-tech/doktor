import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BeautyServicesService {
    constructor(private prisma: PrismaService) {}

    async findAll(userId: number) {
        return this.prisma.beautyService.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number, userId: number) {
        const service = await this.prisma.beautyService.findFirst({
            where: { id, userId },
        });
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    async create(userId: number, data: any) {
        return this.prisma.beautyService.create({
            data: {
                userId,
                name: data.name,
                description: data.description,
                duration: data.duration,
                price: data.price,
                icon: data.icon,
                isActive: data.isActive ?? true,
            },
        });
    }

    async update(id: number, userId: number, data: any) {
        await this.findOne(id, userId); // Ensure it exists and belongs to user
        return this.prisma.beautyService.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                duration: data.duration,
                price: data.price,
                icon: data.icon,
                isActive: data.isActive,
            },
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId); // Ensure it exists and belongs to user
        return this.prisma.beautyService.delete({
            where: { id },
        });
    }
}
