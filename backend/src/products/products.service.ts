import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService,
  ) {}

  async create(data: CreateProductDto & { imageGallery?: string[] }): Promise<Product> {
    try {
      const { imageGallery, ...productData } = data;
      return await this.prisma.product.create({
        data: {
          ...productData,
          price: new Prisma.Decimal(productData.price),
          discountPercentage: new Prisma.Decimal(productData.discountPercentage || 0),
          stock: Number(productData.stock),
          minStock: productData.minStock !== undefined ? Number(productData.minStock) : undefined,
          images: {
            create: imageGallery?.map(url => ({ url })) || []
          }
        },
        include: { images: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A product with this name already exists');
        }
      }
      if (error instanceof Error && error.name === 'PrismaClientValidationError') {
        throw new ConflictException('Database validation failed. Please ensure all required fields are provided correctly.');
      }
      throw error;
    }
  }

  async findAll(query: { categoryId?: string; search?: string; page?: number; limit?: number }) {
    const { categoryId, search, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where: Prisma.ProductWhereInput = {
      isDeleted: false,
    };

    if (categoryId) where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { 
          category: true,
          brand: true,
          images: true 
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      meta: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string): Promise<Product & { category: any; images: any[]; reviews: any[] }> {
    const product = await this.prisma.product.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: true,
        brand: true,
        images: true,
      },
    });

    if (!product || product.isDeleted) {
      throw new NotFoundException('Product not found or has been discontinued');
    }

    const reviews = await this.reviewsService.findByProduct(id);

    return {
      ...product,
      reviews,
    } as any;
  }

  async update(id: string, data: UpdateProductDto & { imageGallery?: string[] }): Promise<Product> {
    try {
      const { imageGallery, ...productData } = data;
      
      // Ensure we don't update a deleted product
      await this.findOne(id);

      return await this.prisma.product.update({
        where: { id },
        data: {
          ...productData,
          price: productData.price !== undefined ? new Prisma.Decimal(productData.price) : undefined,
          stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
          minStock: productData.minStock !== undefined ? Number(productData.minStock) : undefined,
          discountPercentage: productData.discountPercentage !== undefined ? new Prisma.Decimal(productData.discountPercentage) : undefined,
          ...(imageGallery && {
            images: {
              deleteMany: {},
              create: imageGallery.map(url => ({ url }))
            }
          })
        },
        include: { images: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('A product with this name already exists');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException('Product not found');
        }
      }
      throw error;
    }
  }

  async remove(id: string): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new NotFoundException('Product not found');
    }
  }

  async getLowStock() {
    return this.prisma.product.findMany({
      where: {
        isDeleted: false,
        stock: {
          lte: this.prisma.product.fields.minStock as any, // This might not work directly in where
        },
      },
      include: { category: true, brand: true },
    });
  }

  // Workaround for stock <= minStock
  async getLowStockFixed() {
    const products = await this.prisma.product.findMany({
      where: { isDeleted: false },
      include: { category: true, brand: true },
    });
    return products.filter(p => p.stock <= p.minStock);
  }

  async batchUpdate(ids: string[], data: UpdateProductDto) {
    const { price, stock, minStock, discountPercentage } = data;
    
    return this.prisma.product.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        ...(price !== undefined && { price: new Prisma.Decimal(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(minStock !== undefined && { minStock: Number(minStock) }),
        ...(discountPercentage !== undefined && { discountPercentage: new Prisma.Decimal(discountPercentage) }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.brandId && { brandId: data.brandId }),
      },
    });
  }
}
