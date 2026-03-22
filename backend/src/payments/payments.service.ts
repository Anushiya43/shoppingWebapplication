import { Injectable, Logger } from '@nestjs/common';
import * as Razorpay from 'razorpay';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private razorpay: any;
  private readonly logger = new Logger(PaymentsService.name);

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });
  }

  async createOrder(amount: number, receipt: string) {
    const options = {
      amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: receipt,
    };

    try {
      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      this.logger.error('Error creating Razorpay order', error);
      throw error;
    }
  }

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(text)
      .digest('hex');

    return generated_signature === signature;
  }
}
