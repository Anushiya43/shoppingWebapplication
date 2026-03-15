import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [AuthModule, PrismaModule, CategoriesModule, ProductsModule, CloudinaryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
