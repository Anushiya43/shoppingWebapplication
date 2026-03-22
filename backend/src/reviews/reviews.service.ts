import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment } = createReviewDto;

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: {
        productId,
        userId,
      },
    });

    if (existingReview) {
      return this.prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }

    return this.prisma.review.create({
      data: {
        rating,
        comment,
        isApproved: true, // Default to approved, but can be moderated
        product: { connect: { id: productId } },
        user: { connect: { id: userId } },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, isApproved: boolean) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    return this.prisma.review.update({
      where: { id },
      data: { isApproved },
    });
  }

  async remove(id: string, userId?: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');

    // If userId is provided, ensure only the author can delete
    if (userId && review.userId !== userId) {
      throw new ConflictException('Unauthorized to delete this review');
    }

    return this.prisma.review.delete({ where: { id } });
  }

  async findByProduct(productId: string, isAdmin = false) {
    const reviews = await this.prisma.review.findMany({
      where: { 
        productId,
        ...(isAdmin ? {} : { isApproved: true }) 
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(
      reviews.map(async (review) => {
        const orderCount = await this.prisma.orderItem.count({
          where: {
            productId,
            order: {
              userId: review.userId,
              status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
            },
          },
        });

        return {
          ...review,
          isVerified: orderCount > 0,
        };
      }),
    );
  }

  async findAll() {
    const reviews = await this.prisma.review.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return Promise.all(
      reviews.map(async (review) => {
        const orderCount = await this.prisma.orderItem.count({
          where: {
            productId: review.productId,
            order: {
              userId: review.userId,
              status: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
            },
          },
        });

        return {
          ...review,
          isVerified: orderCount > 0,
        };
      }),
    );
  }
}
