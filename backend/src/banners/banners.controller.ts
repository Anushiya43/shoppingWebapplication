import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('banners')
export class BannersController {
  constructor(
    private readonly bannersService: BannersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'shopping-app/banners',
      );
      createBannerDto.imageUrl = uploadResult.secure_url;
    }

    if (!createBannerDto.imageUrl) {
      throw new BadRequestException('Banner image is required');
    }

    return this.bannersService.create(createBannerDto as Required<CreateBannerDto>);
  }

  @Get()
  findAll(@Query('active') active?: string) {
    const onlyActive = active === 'true';
    return this.bannersService.findAll(onlyActive);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      const currentBanner = await this.bannersService.findOne(id);
      const uploadResult = await this.cloudinaryService.uploadImage(
        file,
        'shopping-app/banners',
      );
      updateBannerDto.imageUrl = uploadResult.secure_url;

      // Cleanup old image
      if (currentBanner.imageUrl) {
        const parts = currentBanner.imageUrl.split('/');
        const publicIdWithExt = parts.slice(-3).join('/'); // shopping-app/banners/id.jpg
        const publicId = publicIdWithExt.split('.')[0];
        if (publicId && publicId.includes('shopping-app')) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
    }
    return this.bannersService.update(id, updateBannerDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    const banner = await this.bannersService.findOne(id);
    if (banner.imageUrl) {
      const parts = banner.imageUrl.split('/');
      const publicIdWithExt = parts.slice(-3).join('/'); // shopping-app/banners/id.jpg
      const publicId = publicIdWithExt.split('.')[0];
      if (publicId && publicId.includes('shopping-app')) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }
    return this.bannersService.remove(id);
  }
}
