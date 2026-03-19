import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async create(createCouponDto: CreateCouponDto) {
    return this.prisma.coupon.create({
      data: {
        ...createCouponDto,
        expiryDate: new Date(createCouponDto.expiryDate),
      },
    });
  }

  async findActive() {
    const now = new Date();
    const coupons = await this.prisma.coupon.findMany({
      where: {
        expiryDate: { gt: now },
      },
      orderBy: { expiryDate: 'asc' },
    });
    
    // Filter by usage limit in memory (cast to any to bypass Prisma client sync issues)
    return (coupons as any[]).filter(c => c.usageLimit === null || c.usedCount < c.usageLimit);
  }

  async findAll() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { id },
    });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async update(id: string, updateCouponDto: UpdateCouponDto) {
    const data: any = { ...updateCouponDto };
    if (updateCouponDto.expiryDate) {
      data.expiryDate = new Date(updateCouponDto.expiryDate);
    }

    return this.prisma.coupon.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.coupon.delete({
      where: { id },
    });
  }

  async validateCoupon(code: string, amount: number, userId?: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      throw new BadRequestException('Invalid coupon code');
    }

    // Check if the user has already used this coupon (Limit 1 per customer)
    if (userId) {
      const existingOrder = await this.prisma.order.findFirst({
        where: {
          userId,
          couponId: coupon.id,
          status: { not: 'CANCELLED' } // Don't count cancelled orders
        }
      });

      if (existingOrder) {
        throw new BadRequestException('You have already used this coupon');
      }
    }

    // Check expiry
    if (new Date() > new Date(coupon.expiryDate)) {
      throw new BadRequestException('Coupon has expired');
    }

    // Check minimum amount
    if (amount < Number(coupon.minAmount)) {
      throw new BadRequestException(`Minimum purchase amount of ₹${coupon.minAmount} required`);
    }

    // Check usage limit
    const untypedCoupon = coupon as any;
    if (untypedCoupon.usageLimit !== null && untypedCoupon.usedCount >= untypedCoupon.usageLimit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    return coupon;
  }

  async incrementUsage(id: string) {
    return (this.prisma.coupon as any).update({
      where: { id },
      data: {
        usedCount: { increment: 1 },
      },
    });
  }
}
