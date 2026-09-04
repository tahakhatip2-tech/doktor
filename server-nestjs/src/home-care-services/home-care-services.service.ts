import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeCareServicesService {
    constructor(private prisma: PrismaService) {}

    async findAll(userId: number) {
        return this.prisma.service.findMany({
            where: {
                userId,
                category: 'home_care'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne(id: number, userId: number) {
        const service = await this.prisma.service.findFirst({
            where: {
                id,
                userId,
                category: 'home_care'
            }
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        return service;
    }

    async create(userId: number, data: any) {
        return this.prisma.service.create({
            data: {
                ...data,
                userId,
                category: 'home_care',
                price: data.price ? String(data.price) : null
            }
        });
    }

    async update(id: number, userId: number, data: any) {
        await this.findOne(id, userId); // Verify ownership

        if (data.price !== undefined && data.price !== null) {
            data.price = String(data.price);
        }

        return this.prisma.service.update({
            where: { id },
            data
        });
    }

    async remove(id: number, userId: number) {
        await this.findOne(id, userId); // Verify ownership

        return this.prisma.service.delete({
            where: { id }
        });
    }
}
