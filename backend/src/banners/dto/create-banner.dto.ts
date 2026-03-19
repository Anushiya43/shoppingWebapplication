import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBannerDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
