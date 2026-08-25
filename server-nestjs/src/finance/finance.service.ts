import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getFinanceStats(userId: number, role: string) {
    if (role === 'PHARMACY') {
      return this.getPharmacyStats(userId);
    }
    return this.getClinicStats(userId);
  }

  async getFinanceHistory(userId: number, limit = 50, role: string) {
    if (role === 'PHARMACY') {
      return this.getPharmacyHistory(userId, limit);
    }
    return this.getClinicHistory(userId, limit);
  }

  async getFinanceChart(userId: number, role: string) {
    if (role === 'PHARMACY') {
      return this.getPharmacyChart(userId);
    }
    return this.getClinicChart(userId);
  }

  // ─── CLINIC / BEAUTY ──────────────────────────────────────────────────────

  private async getClinicStats(clinicId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const records = await this.prisma.medicalRecord.findMany({
      where: {
        appointment: { userId: clinicId, status: 'completed' },
        feeAmount: { not: null },
      },
      select: { feeAmount: true, createdAt: true },
    });

    let todayIncome = 0, monthIncome = 0, totalIncome = 0;
    records.forEach(record => {
      const amount = Number(record.feeAmount) || 0;
      totalIncome += amount;
      const recordDate = new Date(record.createdAt);
      if (recordDate >= today) todayIncome += amount;
      if (recordDate >= firstDayOfMonth) monthIncome += amount;
    });

    return { todayIncome, monthIncome, totalIncome, totalTransactions: records.length };
  }

  private async getClinicHistory(clinicId: number, limit: number) {
    const records = await this.prisma.medicalRecord.findMany({
      where: {
        appointment: { userId: clinicId, status: 'completed' },
        feeAmount: { not: null },
      },
      select: {
        id: true,
        feeAmount: true,
        feeDetails: true,
        createdAt: true,
        appointment: { select: { customerName: true, type: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return records.map(record => ({
      id: record.id,
      patientName: record.appointment.customerName || 'غير معروف',
      date: record.createdAt,
      amount: Number(record.feeAmount) || 0,
      details: record.feeDetails || 'كشفية عادية',
      type: record.appointment.type,
      status: 'paid',
    }));
  }

  private async getClinicChart(clinicId: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const records = await this.prisma.medicalRecord.findMany({
      where: {
        appointment: { userId: clinicId, status: 'completed' },
        feeAmount: { not: null },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { feeAmount: true, createdAt: true },
    });

    const dailyIncome: Record<string, number> = {};
    records.forEach(record => {
      const dateStr = record.createdAt.toISOString().split('T')[0];
      const amount = Number(record.feeAmount) || 0;
      if (!dailyIncome[dateStr]) dailyIncome[dateStr] = 0;
      dailyIncome[dateStr] += amount;
    });

    return Object.entries(dailyIncome)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }

  // ─── PHARMACY ─────────────────────────────────────────────────────────────

  private async getPharmacyStats(pharmacyId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const sales = await this.prisma.pharmacySale.findMany({
      where: { pharmacyId, status: 'completed' },
      select: { totalAmount: true, createdAt: true, prescriptionId: true },
    });

    let todayIncome = 0, monthIncome = 0, totalIncome = 0;
    let prescriptionsDispensed = 0;

    sales.forEach(sale => {
      const amount = Number(sale.totalAmount) || 0;
      totalIncome += amount;
      if (sale.prescriptionId) prescriptionsDispensed++;
      const saleDate = new Date(sale.createdAt);
      if (saleDate >= today) todayIncome += amount;
      if (saleDate >= firstDayOfMonth) monthIncome += amount;
    });

    // Pending prescriptions count
    const pendingPrescriptions = await this.prisma.prescription.count({
      where: { pharmacyId, status: 'SENT_TO_PHARMACY' },
    });

    return {
      todayIncome,
      monthIncome,
      totalIncome,
      totalTransactions: sales.length,
      prescriptionsDispensed,
      pendingPrescriptions,
    };
  }

  private async getPharmacyHistory(pharmacyId: number, limit: number) {
    const sales = await this.prisma.pharmacySale.findMany({
      where: { pharmacyId, status: 'completed' },
      select: {
        id: true,
        totalAmount: true,
        customerName: true,
        prescriptionId: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            inventory: { select: { name: true } },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return sales.map(sale => ({
      id: sale.id,
      patientName: sale.customerName || 'عميل عام',
      date: sale.createdAt,
      amount: Number(sale.totalAmount) || 0,
      details: sale.items[0]?.inventory?.name
        ? `${sale.items[0].inventory.name}${sale.items.length > 1 ? ' وأخرى...' : ''}`
        : (sale.prescriptionId ? `وصفة #${sale.prescriptionId}` : 'مبيعات أدوية'),
      type: sale.prescriptionId ? 'prescription' : 'direct',
      status: 'paid',
    }));
  }

  private async getPharmacyChart(pharmacyId: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await this.prisma.pharmacySale.findMany({
      where: {
        pharmacyId,
        status: 'completed',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const dailySales: Record<string, number> = {};
    sales.forEach(sale => {
      const dateStr = sale.createdAt.toISOString().split('T')[0];
      const amount = Number(sale.totalAmount) || 0;
      if (!dailySales[dateStr]) dailySales[dateStr] = 0;
      dailySales[dateStr] += amount;
    });

    return Object.entries(dailySales)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, amount]) => ({ date, amount }));
  }

  // ─── Pharmacy Advanced Analytics ──────────────────────────────────────────

  async getPharmacyAdvancedStats(pharmacyId: number) {
    // Top selling medications
    const topItems = await this.prisma.pharmacySaleItem.groupBy({
      by: ['inventoryId'],
      where: {
        sale: { pharmacyId, status: 'completed' },
        inventoryId: { not: null },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topItemsWithNames = await Promise.all(
      topItems.map(async (item) => {
        const inv = item.inventoryId
          ? await this.prisma.pharmacyInventory.findUnique({
              where: { id: item.inventoryId },
              select: { name: true, price: true },
            })
          : null;
        return {
          name: inv?.name || 'غير معروف',
          totalSold: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.subtotal) || 0,
        };
      })
    );

    // Low stock items (stock < 10)
    const lowStock = await this.prisma.pharmacyInventory.findMany({
      where: { pharmacyId, stock: { lt: 10 } },
      select: { id: true, name: true, stock: true, expiryDate: true },
      orderBy: { stock: 'asc' },
      take: 5,
    });

    // Pending prescriptions
    const pendingRx = await this.prisma.prescription.findMany({
      where: { pharmacyId, status: 'SENT_TO_PHARMACY' },
      select: {
        id: true,
        createdAt: true,
        patient: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      topMedications: topItemsWithNames,
      lowStock,
      pendingPrescriptions: pendingRx.map(rx => ({
        id: rx.id,
        patientName: rx.patient?.name || 'غير معروف',
        date: rx.createdAt,
      })),
    };
  }
}
