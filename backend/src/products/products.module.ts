import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { CategoriesModule } from '../categories/categories.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, CategoriesModule, ReviewsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
