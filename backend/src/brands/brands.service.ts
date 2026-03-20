import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBrandDto) {
    return this.prisma.brand.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      where: { isDeleted: false },
      include: {
        _count: {
          select: { products: { where: { isDeleted: false } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, isDeleted: false },
      include: {
        products: {
          where: { isDeleted: false },
        },
      },
    });
    if (!brand) throw new NotFoundException('Brand not found');
    return brand;
  }

  async update(id: string, data: UpdateBrandDto) {
    try {
      await this.findOne(id);
      return await this.prisma.brand.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException('Brand not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.brand.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new NotFoundException('Brand not found');
    }
  }
}
