import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto & { imageUrl: string }) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  async findAll(onlyActive: boolean = false) {
    return this.prisma.banner.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) {
      throw new NotFoundException(`Banner with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
