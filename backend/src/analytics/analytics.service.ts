import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStats(range: string = 'all') {
    const now = new Date();
    let startDate: Date | undefined;

    if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const whereClause = startDate ? { createdAt: { gte: startDate } } : {};
    const whereDeliveredClause = { ...whereClause, status: 'DELIVERED' as const };

    const [totalRevenueResult, activeOrdersCount, totalUsersCount, abandonedCartsCount] = await Promise.all([
      // Total Revenue
      this.prisma.order.aggregate({
        where: whereDeliveredClause,
        _sum: { totalAmount: true },
      }),
      // Active Orders
      this.prisma.order.count({
        where: {
          ...whereClause,
          status: {
            notIn: ['DELIVERED', 'CANCELLED'],
          },
        },
      }),
      // Total Users
      this.prisma.user.count({ where: whereClause }),
      // Abandoned Carts (Carts with items)
      this.prisma.cart.count({
        where: {
          items: {
            some: {}
          }
        }
      })
    ]);

    const totalRevenue = totalRevenueResult._sum.totalAmount || 0;

    // Conversion Rate: (Delivered Orders / Total Users)
    const deliveredOrdersCount = await this.prisma.order.count({
      where: whereDeliveredClause
    });
    const conversionRate = totalUsersCount > 0 ? (deliveredOrdersCount / totalUsersCount) * 100 : 0;

    // Top 5 Products
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: whereDeliveredClause
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
          price: Math.round(Number(product.price) * 100) / 100,
          sales: item._sum.quantity || 0,
        };
      })
    ).then(items => items.filter(i => i !== null));

    // User Location Analytics (Grouping by state from Address)
    const locationStats = await this.prisma.address.groupBy({
      by: ['state'],
      _count: { userId: true },
      where: {
        user: whereClause
      },
      orderBy: {
        _count: { userId: 'desc' }
      },
      take: 5
    });

    const formattedLocations = locationStats.map(loc => ({
      name: loc.state,
      value: loc._count.userId
    }));

    // Repeat Customer Rate (Only Successful Customers)
    const ordersByUser = await this.prisma.order.groupBy({
      by: ['userId'],
      where: whereDeliveredClause,
      _count: { id: true },
    });

    const repeatCustomersCount = ordersByUser.filter(u => u._count.id > 1).length;
    const repeatCustomerRate = totalUsersCount > 0 
      ? (repeatCustomersCount / totalUsersCount) * 100 
      : 0;

    // Average Order Value
    const avgOrderValue = deliveredOrdersCount > 0 
      ? Number(totalRevenue) / deliveredOrdersCount 
      : 0;

    // Revenue by Month for current year
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    
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

    const formattedMonthlyRevenue = Array(12).fill(0).map((_, i) => {
      const monthData = (monthlyRevenue as any[]).find(m => Number(m.month) === i + 1);
      return monthData ? Number(monthData.revenue) : 0;
    });

    // Calculate MoM Growth
    const currentMonthRevenue = formattedMonthlyRevenue[currentMonthIndex];
    const prevMonthRevenue = currentMonthIndex > 0 ? formattedMonthlyRevenue[currentMonthIndex - 1] : 0;
    
    let momGrowth = 0;
    if (prevMonthRevenue > 0) {
      momGrowth = ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;
    } else if (currentMonthRevenue > 0) {
      momGrowth = 100;
    }

    // Daily Revenue for the selected range (last 7 or 30 days)
    const dailyRevenueResults = await this.prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        SUM("totalAmount") as revenue
      FROM "Order"
      WHERE 
        status = 'DELIVERED'
        ${startDate ? Prisma.sql`AND "createdAt" >= ${startDate}` : Prisma.empty}
      GROUP BY date
      ORDER BY date ASC
    `;

    const dailyRevenue = (dailyRevenueResults as any[]).map(d => ({
      date: new Date(d.date).toLocaleDateString(),
      revenue: Number(d.revenue)
    }));

    // Today's Revenue specifically
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayResult = await this.prisma.order.aggregate({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: today }
      },
      _sum: { totalAmount: true }
    });
    const todayRevenue = todayResult._sum.totalAmount || 0;

    // Revenue by Category
    const categoryRevenue = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: {
        order: whereDeliveredClause
      },
    });

    const categoryStats = await Promise.all(
      categoryRevenue.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          include: { category: true },
        });
        return {
          categoryName: product?.category?.name || 'Unknown',
          revenue: Number(item._sum.quantity) * Number(product?.price || 0),
        };
      })
    );

    const consolidatedCategoryStats = categoryStats.reduce((acc, curr) => {
      const existing = acc.find(a => a.name === curr.categoryName);
      if (existing) {
        existing.value += curr.revenue;
      } else {
        acc.push({ name: curr.categoryName, value: curr.revenue });
      }
      return acc;
    }, [] as { name: string, value: number }[]).map(c => ({
      ...c,
      value: Math.round(c.value * 100) / 100
    }));

    return {
      totalRevenue: Number(totalRevenue),
      activeOrders: activeOrdersCount,
      totalUsers: totalUsersCount,
      abandonedCarts: abandonedCartsCount,
      conversionRate: Math.round(conversionRate * 10) / 10,
      locationStats: formattedLocations,
      topProducts: productsDetails,
      repeatCustomerRate: Math.round(repeatCustomerRate),
      avgOrderValue: Math.round(avgOrderValue),
      monthlyRevenue: formattedMonthlyRevenue,
      momGrowth: Math.round(momGrowth),
      categoryRevenue: consolidatedCategoryStats,
      todayRevenue: Number(todayRevenue),
      dailyRevenue: dailyRevenue,
    };
  }

  async exportStats(range: string): Promise<string> {
    const stats = await this.getStats(range);
    
    // Helper to escape CSV values
    const escape = (val: any) => {
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
    };

    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', `₹${stats.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['Active Orders', stats.activeOrders],
      ['Total Users', stats.totalUsers],
      ['Conversion Rate', `${stats.conversionRate}%`],
      ['Abandoned Carts', stats.abandonedCarts],
      ['Repeat Customer Rate', `${stats.repeatCustomerRate}%`],
      ['Average Order Value', `₹${stats.avgOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
      ['MoM Growth', `${stats.momGrowth}%`],
      [''],
      ['Category Split'],
      ...stats.categoryRevenue.map(c => [c.name, `₹${c.value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]),
      [''],
      ['Location Split'],
      ...stats.locationStats.map(l => [l.name, l.value]),
      [''],
      ['Top Products'],
      ...stats.topProducts.map(p => [(p as any).name, `${(p as any).sales} sold`, `₹${(p as any).price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`]),
    ];

    // Add Byte Order Mark (BOM) for Excel UTF-8 support
    const bom = '\ufeff';
    const csvContent = rows.map(r => r.map(escape).join(',')).join('\n');
    return bom + csvContent;
  }
}
