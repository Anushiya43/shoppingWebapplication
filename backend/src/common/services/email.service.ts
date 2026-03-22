import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');
  }

  async sendLowStockAlert(adminEmail: string, productName: string, currentStock: number, threshold: number) {
    const msg = {
      to: adminEmail,
      from: process.env.MAIL_FROM || 'admin@shoppingapp.com', // Verified sender in SendGrid
      subject: `⚠️ Low Stock Alert: ${productName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e11d48;">Inventory Warning</h2>
          <p>The product <strong>${productName}</strong> has fallen below its critical stock threshold.</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Current Stock:</strong> ${currentStock}</p>
            <p style="margin: 5px 0;"><strong>Threshold:</strong> ${threshold}</p>
          </div>
          <p>Please restock this item soon to avoid missed sales opportunities.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">This is an automated alert from your ShoppingApp Dashboard.</p>
        </div>
      `,
    };

    try {
      if (!process.env.SENDGRID_API_KEY) {
        this.logger.warn('SENDGRID_API_KEY not set. Skipping email.');
        return;
      }
      await sgMail.send(msg);
      this.logger.log(`Low stock alert sent for ${productName} to ${adminEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send email alert for ${productName}`, error.response?.body || error);
    }
  }
}
