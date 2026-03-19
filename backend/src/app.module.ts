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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
