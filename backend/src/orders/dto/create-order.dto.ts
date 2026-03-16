import { IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  couponId?: string;
}
