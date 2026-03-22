import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderStatus, Prisma } from '@prisma/client';
import { CouponsService } from '../coupons/coupons.service';
import { EmailService } from '../common/services/email.service';
import { PaymentsService } from '../payments/payments.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private couponsService: CouponsService,
    private emailService: EmailService,
    private paymentsService: PaymentsService,
  ) { }

  private calculateShipping(totalAmount: number): number {
    if (totalAmount === 0) return 0;
    const threshold = Number(process.env.SHIPPING_THRESHOLD) || 500;
    const cost = Number(process.env.SHIPPING_COST) || 50;
    return totalAmount >= threshold ? 0 : cost;
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const cart = await this.cartService.getCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot place an order with an empty cart');
    }

    // Calculate totals and prepare items
    const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await this.prisma.product.findFirst({
        where: { id: item.productId, isDeleted: false },
      });

      if (!product) {
        throw new BadRequestException(`Product ${item.product.name} is no longer available`);
      }

      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const price = Number(product.price);
      const discountedPrice = product.discountPercentage
        ? price * (1 - Number(product.discountPercentage) / 100)
        : price;

      totalAmount += discountedPrice * item.quantity;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: new Prisma.Decimal(discountedPrice),
      });
    }

    // Handle Coupon
    let discountAmount = 0;
    let validatedCoupon: any = null;

    if (createOrderDto.couponId) {
      validatedCoupon = await this.couponsService.findOne(createOrderDto.couponId);

      if (!validatedCoupon) {
        throw new BadRequestException('Invalid coupon code');
      }

      if (new Date() > validatedCoupon.expiryDate) {
        throw new BadRequestException('Coupon has expired');
      }
      if (totalAmount < Number(validatedCoupon.minAmount)) {
        throw new BadRequestException(`Minimum purchase amount of ₹${validatedCoupon.minAmount} required`);
      }

      const untypedCoupon = validatedCoupon as any;
      if (untypedCoupon.usageLimit !== null && untypedCoupon.usedCount >= untypedCoupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }

      if (validatedCoupon.type === 'PERCENTAGE') {
        discountAmount = totalAmount * (Number(validatedCoupon.value) / 100);
      } else {
        discountAmount = Number(validatedCoupon.value);
      }
    }

    const shippingCost = this.calculateShipping(totalAmount);
    const finalAmount = Math.max(0, totalAmount - discountAmount + shippingCost);

    const result = await this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount: new Prisma.Decimal(finalAmount),
          shippingCost: new Prisma.Decimal(shippingCost),
          discountAmount: new Prisma.Decimal(discountAmount),
          couponId: createOrderDto.couponId,
          shippingAddress: createOrderDto.shippingAddress,
          paymentMethod: (createOrderDto.paymentMethod as any) || 'COD',
          paymentStatus: 'PENDING',
          orderItems: {
            create: orderItemsData,
          },
        },
        include: {
          orderItems: true,
        },
      });

      // If online payment, create Razorpay order and update the order
      if (createOrderDto.paymentMethod === 'ONLINE') {
        try {
          const razorpayOrder = await this.paymentsService.createOrder(finalAmount, order.id);
          await (tx.order as any).update({
            where: { id: order.id },
            data: { razorpayOrderId: razorpayOrder.id },
          });
          // Attach razorpayOrderId to the response object for the controller to return
          (order as any).razorpayOrderId = razorpayOrder.id;
        } catch (error) {
          // If Razorpay order creation fails, the transaction will rollback
          throw new BadRequestException('Failed to initiate online payment. Please try again or use COD.');
        }
      }

      if (createOrderDto.couponId) {
        await (tx.coupon as any).update({
          where: { id: createOrderDto.couponId },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });

    // Check for low stock and alert - done outside transaction
    this.checkLowStockAndAlert(orderItemsData);

    return result;
  }

  private async checkLowStockAndAlert(items: Prisma.OrderItemCreateManyOrderInput[]) {
    for (const item of items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product && product.stock <= product.minStock) {
        const adminEmail = process.env.MAIL_FROM || 'admin@shoppingapp.com';
        await this.emailService.sendLowStockAlert(
          adminEmail,
          product.name,
          product.stock,
          product.minStock,
        );
      }
    }
  }

  async expireUnpaidOrders() {
    const expiryMinutes = Number(process.env.ORDER_EXPIRY_MINUTES) || 30;
    const expiryMs = expiryMinutes * 60 * 1000;
    const thirtyMinutesAgo = new Date(Date.now() - expiryMs);
    
    const expiredOrders = await (this.prisma.order as any).findMany({
      where: {
        paymentMethod: 'ONLINE',
        paymentStatus: 'PENDING',
        status: { not: 'CANCELLED' },
        createdAt: { lt: thirtyMinutesAgo },
      },
      include: { orderItems: true }
    });

    for (const order of expiredOrders) {
      await this.prisma.$transaction(async (tx) => {
        await (tx.order as any).update({
          where: { id: order.id },
          data: { status: 'CANCELLED' }
        });

        // Restore stock
        for (const item of (order as any).orderItems) {
          await (tx.product as any).update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
      });
    }
  }

  async getOrders(userId: string): Promise<Order[]> {
    await this.expireUnpaidOrders();
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(userId: string, orderId: string): Promise<Order | null> {
    await this.expireUnpaidOrders();
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async getAllOrdersForAdmin(): Promise<Order[]> {
    await this.expireUnpaidOrders();
    return this.prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateOrderStatus(orderId: string, updateData: { status?: OrderStatus; paymentStatus?: any; trackingNumber?: string }): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  async verifyPayment(orderId: string, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const isValid = this.paymentsService.verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      throw new BadRequestException('Invalid payment signature');
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
      },
    });
  }

  async cancelOrder(userId: string, orderId: string): Promise<Order> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Only pending or confirmed orders can be cancelled');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      if (order.couponId) {
        await (tx.coupon as any).update({
          where: { id: order.couponId },
          data: {
            usedCount: { decrement: 1 },
          },
        });
      }

      return updatedOrder;
    });
  }

  async getOrCreateRazorpayOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true }
    });

    if (!order || order.userId !== userId) {
      throw new BadRequestException('Order not found');
    }

    if ((order as any).status === 'CANCELLED') {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    if ((order as any).paymentStatus === 'PAID') {
      throw new BadRequestException('Order is already paid');
    }

    if ((order as any).paymentMethod !== 'ONLINE') {
        throw new BadRequestException('Only online orders can be paid via Razorpay');
    }

    if ((order as any).razorpayOrderId) {
      return { razorpayOrderId: (order as any).razorpayOrderId };
    }

    // Generate new Razorpay order
    try {
      const razorpayOrder = await this.paymentsService.createOrder(Number(order.totalAmount), order.id);
      await (this.prisma.order as any).update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id },
      });
      return { razorpayOrderId: razorpayOrder.id };
    } catch (error) {
      throw new BadRequestException('Failed to create Razorpay order');
    }
  }
}
