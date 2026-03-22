import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Patch, Delete } from '@nestjs/common';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.id, createReviewDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string, @Request() req) {
    const isAdmin = req.user?.role === 'ADMIN';
    return this.reviewsService.findByProduct(productId, isAdmin);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateStatus(@Param('id') id: string, @Body('isApproved') isApproved: boolean) {
    return this.reviewsService.updateStatus(id, isApproved);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    // Service handles checking if user is owner or admin
    return this.reviewsService.remove(id, req.user.role === 'ADMIN' ? undefined : req.user.id);
  }
}
