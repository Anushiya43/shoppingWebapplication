import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  async getCart(@Req() req) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('add')
  async addItem(@Req() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, addToCartDto);
  }

  @Put('item/:id')
  async updateItem(@Req() req, @Param('id') itemId: string, @Body('quantity') quantity: number) {
    return this.cartService.updateItemQuantity(req.user.id, itemId, quantity);
  }

  @Delete('item/:id')
  async removeItem(@Req() req, @Param('id') itemId: string) {
    return this.cartService.removeItem(req.user.id, itemId);
  }

  @Delete('clear')
  async clearCart(@Req() req) {
    return this.cartService.clearCart(req.user.id);
  }
}
