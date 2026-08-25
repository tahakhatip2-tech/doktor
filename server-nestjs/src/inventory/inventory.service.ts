import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(pharmacyId: number) {
    return this.prisma.pharmacyInventory.findMany({
      where: { pharmacyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, pharmacyId: number) {
    const item = await this.prisma.pharmacyInventory.findFirst({
      where: { id, pharmacyId },
    });
    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }
    return item;
  }

  async create(pharmacyId: number, data: CreateInventoryDto) {
    return this.prisma.pharmacyInventory.create({
      data: {
        ...data,
        pharmacyId,
      },
    });
  }

  async update(id: number, pharmacyId: number, data: UpdateInventoryDto) {
    await this.findOne(id, pharmacyId); // verify exists
    return this.prisma.pharmacyInventory.update({
      where: { id },
      data,
    });
  }

  async remove(id: number, pharmacyId: number) {
    await this.findOne(id, pharmacyId);
    return this.prisma.pharmacyInventory.delete({
      where: { id },
    });
  }

  async getLowStock(pharmacyId: number) {
    return this.prisma.pharmacyInventory.findMany({
      where: {
        pharmacyId,
        stock: { lte: 10 },
      },
      orderBy: { stock: 'asc' },
    });
  }
}
