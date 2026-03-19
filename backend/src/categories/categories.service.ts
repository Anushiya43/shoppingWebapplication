import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCategoryDto) {
    return this.prisma.category.create({
      data,
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
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
    const category = await this.prisma.category.findFirst({
      where: { id, isDeleted: false },
      include: { 
        products: {
          where: { isDeleted: false }
        } 
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: UpdateCategoryDto) {
    try {
      await this.findOne(id);
      return await this.prisma.category.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException('Category not found');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.category.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new NotFoundException('Category not found');
    }
  }
}
