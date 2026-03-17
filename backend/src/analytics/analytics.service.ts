import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [totalRevenueResult, activeOrdersCount, totalUsersCount] = await Promise.all([
      // Total Revenue from Delivered Orders
      this.prisma.order.aggregate({
        where: { status: 'DELIVERED' },
        _sum: { totalAmount: true },
      }),
      // Active Orders (Not Delivered or Cancelled)
      this.prisma.order.count({
        where: {
          status: {
            notIn: ['DELIVERED', 'CANCELLED'],
          },
        },
      }),
      // Total Users
      this.prisma.user.count(),
    ]);

    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    // Revenue by Month for current year
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = await this.prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "createdAt") as month,
        SUM("totalAmount") as revenue
      FROM "Order"
      WHERE 
        EXTRACT(YEAR FROM "createdAt") = ${currentYear}
        AND status = 'DELIVERED'
      GROUP BY month
      ORDER BY month ASC
    `;

    // Format monthly revenue for frontend (12 months array)
    const formattedMonthlyRevenue = Array(12).fill(0).map((_, i) => {
      const monthData = (monthlyRevenue as any[]).find(m => Number(m.month) === i + 1);
      return monthData ? Number(monthData.revenue) : 0;
    });

    return {
      totalRevenue: Number(totalRevenue),
      activeOrders: activeOrdersCount,
      totalUsers: totalUsersCount,
      monthlyRevenue: formattedMonthlyRevenue,
    };
  }
}
