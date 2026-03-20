import { IsNumberString, IsNotEmpty } from 'class-validator';

export class ValidateCouponDto {
  @IsNumberString()
  @IsNotEmpty()
  amount: string;
}
