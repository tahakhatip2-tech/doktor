import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async getFinanceStats(clinicId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get all completed records
    const records = await this.prisma.medicalRecord.findMany({
      where: {
        appointment: {
          userId: clinicId,
          status: 'completed',
        },
        feeAmount: {
          not: null, // Ensure feeAmount exists
        },
      },
      select: {
        feeAmount: true,
        createdAt: true,
      },
    });

    let todayIncome = 0;
    let monthIncome = 0;
    let totalIncome = 0;

    records.forEach(record => {
      const amount = Number(record.feeAmount) || 0;
      totalIncome += amount;

      const recordDate = new Date(record.createdAt);
      
      if (recordDate >= today) {
        todayIncome += amount;
      }
      
      if (recordDate >= firstDayOfMonth) {
        monthIncome += amount;
      }
    });

    return {
      todayIncome,
      monthIncome,
      totalIncome,
      totalTransactions: records.length,
    };
  }

  async getFinanceHistory(clinicId: number, limit = 50) {
    const records = await this.prisma.medicalRecord.findMany({
      where: {
        appointment: {
          userId: clinicId,
          status: 'completed',
        },
        feeAmount: {
          not: null,
        },
      },
      select: {
        id: true,
        feeAmount: true,
        feeDetails: true,
        createdAt: true,
        appointment: {
          select: {
            customerName: true,
            type: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return records.map(record => ({
      id: record.id,
      patientName: record.appointment.customerName || 'غير معروف',
      date: record.createdAt,
      amount: Number(record.feeAmount) || 0,
      details: record.feeDetails || 'كشفية عادية',
      type: record.appointment.type,
      status: 'paid'
    }));
  }

  async getFinanceChart(clinicId: number) {
     const thirtyDaysAgo = new Date();
     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

     const records = await this.prisma.medicalRecord.findMany({
        where: {
          appointment: {
            userId: clinicId,
            status: 'completed',
          },
          feeAmount: {
            not: null,
          },
          createdAt: {
            gte: thirtyDaysAgo,
          }
        },
        select: {
          feeAmount: true,
          createdAt: true,
        },
      });

      // Group by date
      const dailyIncome: Record<string, number> = {};
      
      records.forEach(record => {
        const dateStr = record.createdAt.toISOString().split('T')[0];
        const amount = Number(record.feeAmount) || 0;
        
        if (!dailyIncome[dateStr]) {
           dailyIncome[dateStr] = 0;
        }
        dailyIncome[dateStr] += amount;
      });

      // Convert to array format for Recharts
      return Object.entries(dailyIncome)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, amount]) => ({
            date,
            amount
      }));
  }
}
