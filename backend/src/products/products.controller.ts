import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindAllProductDto } from './dto/find-all-product.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CategoriesService } from '../categories/categories.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly categoriesService: CategoriesService,
  ) {}

  private async getFolderName(categoryId: string): Promise<string> {
    try {
      const category = await this.categoriesService.findOne(categoryId);
      const categoryName = category.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      return `shopping-app/${categoryName}`;
    } catch (e) {
      return 'shopping-app/uncategorized';
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() data: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageUrl = data.imageUrl || '';
    const imageGallery: string[] = [];
    
    if (files && files.length > 0) {
      const folder = await this.getFolderName(data.categoryId);
      
      // First file is the main image if not provided
      for (let i = 0; i < files.length; i++) {
        const uploadResult = await this.cloudinaryService.uploadImage(files[i], folder);
        if (i === 0 && !imageUrl) {
          imageUrl = uploadResult.secure_url;
        }
        imageGallery.push(uploadResult.secure_url);
      }
    }

    return this.productsService.create({
      ...data,
      imageUrl,
      imageGallery,
    });
  }

  @Get()
  findAll(@Query() query: FindAllProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const currentProduct = await this.productsService.findOne(id);
    const imageGallery: string[] = [];

    if (files && files.length > 0) {
      const categoryId = updateData.categoryId || currentProduct.categoryId;
      const folder = await this.getFolderName(categoryId);
      
      for (const file of files) {
        const uploadResult = await this.cloudinaryService.uploadImage(file, folder);
        imageGallery.push(uploadResult.secure_url);
      }

      // If main image was not updated via URL but files were uploaded, 
      // we can optionally update the main image to the first file
      if (!updateData.imageUrl) {
        updateData.imageUrl = imageGallery[0];
      }
    }

    return this.productsService.update(id, {
      ...updateData,
      imageGallery: imageGallery.length > 0 ? imageGallery : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    
    if (product.imageUrl) {
      // Extract public ID: https://res.cloudinary.com/cloud_name/image/upload/v12345/shopping-app/category/id.jpg
      // We need 'shopping-app/category/id'
      const parts = product.imageUrl.split('/');
      const publicIdWithExt = parts.slice(-3).join('/'); // shopping-app/category/id.jpg
      const publicId = publicIdWithExt.split('.')[0];
      
      if (publicId && publicId.includes('shopping-app')) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return this.productsService.remove(id);
  }
}
