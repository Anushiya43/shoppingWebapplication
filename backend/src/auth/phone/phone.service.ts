import { Injectable, UnauthorizedException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';

@Injectable()
export class PhoneService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) { }

  async requestOtp(phoneNumber: string) {
    if (!phoneNumber) {
      throw new BadRequestException('Phone number is required');
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Store OTP in the Otp table, not the User table
    await this.prisma.otp.upsert({
      where: { phoneNumber },
      update: { otp, expiresAt: otpExpires },
      create: { phoneNumber, otp, expiresAt: otpExpires },
    });

    // Check if user exists just for the frontend flag
    const user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    // SIMULATED SMS
    console.log(`[SMS Service] Sending OTP ${otp} to ${phoneNumber}`);

    return {
      message: 'OTP sent successfully',
      phoneNumber,
      isNewUser: !user || user.firstName === 'User'
    };
  }

  async verifyOtp(phoneNumber: string, otp: string, firstName?: string, lastName?: string) {
    // 1. Find and verify OTP in the Otp table
    const otpRecord = await this.prisma.otp.findUnique({
      where: { phoneNumber },
    });

    if (!otpRecord || otpRecord.otp !== otp || otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // 2. OTP is valid, now find or create user
    let user = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      // Create user ONLY AFTER verification is successful
      user = await this.prisma.user.create({
        data: {
          phoneNumber,
          email: `${phoneNumber}@phone.com`, // Placeholder email
          firstName: firstName || 'User',
          lastName: lastName || 'New',
          role: 'CUSTOMER',
        },
      });
    } else if (firstName || lastName) {
      // Update name if provided and user already exists
      const updateData: any = {};
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      user = await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
    }

    // 3. Cleanup: Delete the OTP record
    await this.prisma.otp.delete({
      where: { phoneNumber },
    });

    // 4. Generate tokens
    return this.authService.generateTokens(user);
  }
}
