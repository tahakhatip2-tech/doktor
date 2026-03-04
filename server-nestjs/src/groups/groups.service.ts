import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
    constructor(private prisma: PrismaService) { }

    async findAll(userId: number) {
        return this.prisma.group.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { contacts: true, posts: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(userId: number, data: any) {
        return this.prisma.group.create({
            data: {
                ...data,
                userId,
            },
        });
    }

    async update(id: number, userId: number, data: any) {
        return this.prisma.group.update({
            where: { id, userId },
            data,
        });
    }

    async remove(id: number, userId: number) {
        return this.prisma.group.delete({
            where: { id, userId },
        });
    }
}
