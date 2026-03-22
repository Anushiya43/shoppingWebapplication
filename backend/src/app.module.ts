import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { PrismaModule } from './prisma/prisma.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { AddressModule } from './address/address.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UsersModule } from './users/users.module';
import { BannersModule } from './banners/banners.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CouponsModule } from './coupons/coupons.module';
import { BrandsModule } from './brands/brands.module';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    CommonModule,
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CloudinaryModule,
    CartModule,
    OrdersModule,
    AddressModule,
    AnalyticsModule,
    UsersModule,
    BannersModule,
    CouponsModule,
    ReviewsModule,
    BrandsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
