import { IsArray, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateProductDto } from './update-product.dto';

export class BulkUpdateDto {
  @IsArray()
  @IsString({ each: true })
  ids: string[];

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateProductDto)
  data: UpdateProductDto;
}
