import { Controller, Get, Post, Put, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // Admin endpoints
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async getAllOrders() {
    return this.ordersService.getAllOrdersForAdmin();
  }

  @Put('admin/:id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async updateStatus(
    @Param('id') orderId: string,
    @Body() updateData: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(orderId, updateData);
  }

  @Post()
  async createOrder(@Req() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.id, createOrderDto);
  }

  @Get()
  async getOrders(@Req() req) {
    return this.ordersService.getOrders(req.user.id);
  }

  @Get(':id')
  async getOrderById(@Req() req, @Param('id') orderId: string) {
    return this.ordersService.getOrderById(req.user.id, orderId);
  }

  @Put(':id/cancel')
  async cancelOrder(@Req() req, @Param('id') orderId: string) {
    return this.ordersService.cancelOrder(req.user.id, orderId);
  }
}
