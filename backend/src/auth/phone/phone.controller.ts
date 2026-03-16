import { Controller, Post, Body } from '@nestjs/common';
import { PhoneService } from './phone.service';
import { RequestOtpDto, VerifyOtpDto } from './dto/phone-auth.dto';

@Controller('auth/phone')
export class PhoneController {
  constructor(private readonly phoneService: PhoneService) {}

  @Post('request-otp')
  async requestOtp(@Body() body: RequestOtpDto) {
    return this.phoneService.requestOtp(body.phoneNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    return this.phoneService.verifyOtp(
      body.phoneNumber,
      body.otp,
      body.firstName,
      body.lastName,
    );
  }
}
