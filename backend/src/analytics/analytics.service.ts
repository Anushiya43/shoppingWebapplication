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

    // Top 5 Products by Sales (Only from Successful Orders)
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: {
          status: 'DELIVERED'
        }
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const productsDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, price: true },
        });
        
        if (!product) return null;
        
        return {
          name: product.name,
          price: product.price,
          sales: item._sum.quantity,
        };
      })
    ).then(items => items.filter(i => i !== null));

    // Repeat Customer Rate (Only Successful Customers)
    const ordersByUser = await this.prisma.order.groupBy({
      by: ['userId'],
      where: { status: 'DELIVERED' },
      _count: { id: true },
    });

    const repeatCustomersCount = ordersByUser.filter(u => u._count.id > 1).length;
    const repeatCustomerRate = totalUsersCount > 0 
      ? (repeatCustomersCount / totalUsersCount) * 100 
      : 0;

    // Average Order Value
    const totalOrdersCount = await this.prisma.order.count({
      where: { status: 'DELIVERED' }
    });
    const avgOrderValue = totalOrdersCount > 0 
      ? Number(totalRevenue) / totalOrdersCount 
      : 0;

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
      topProducts: productsDetails,
      repeatCustomerRate: Math.round(repeatCustomerRate),
      avgOrderValue: Math.round(avgOrderValue),
      monthlyRevenue: formattedMonthlyRevenue,
    };
  }
}
