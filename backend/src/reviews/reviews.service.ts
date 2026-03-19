import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByProduct(productId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
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
}
