import { Controller, Post, Body } from '@nestjs/common';
import { PhoneService } from './phone.service';

@Controller('auth/phone')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Post('request-otp')
  async requestOtp(@Body('phoneNumber') phoneNumber: string) {
    return this.phoneService.requestOtp(phoneNumber);
  }

  @Post('verify-otp')
  async verifyOtp(
    @Body('phoneNumber') phoneNumber: string,
    @Body('otp') otp: string,
    @Body('firstName') firstName?: string,
    @Body('lastName') lastName?: string,
  ) {
    return this.phoneService.verifyOtp(phoneNumber, otp, firstName, lastName);
  }
}
