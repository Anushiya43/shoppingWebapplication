import { Controller, Post, Body, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { OrdersService } from '../orders/orders.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
  ) {}

  @Post('verify')
  async verifyPayment(
    @Body('orderId') orderId: string,
    @Body('razorpay_order_id') razorpayOrderId: string,
    @Body('razorpay_payment_id') razorpayPaymentId: string,
    @Body('razorpay_signature') razorpaySignature: string,
  ) {
    // This will verify signature AND update order to PAID
    return this.ordersService.verifyPayment(
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    );
  }
}
