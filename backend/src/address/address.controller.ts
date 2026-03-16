import { Controller, Get, Post, Body, Put, Param, Delete, Patch, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';

@Controller('address')
@UseGuards(JwtAuthGuard)
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressService.create(userId, createAddressDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string) {
    return this.addressService.findAll(userId);
  }

  @Put(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateAddressDto: Partial<CreateAddressDto>,
  ) {
    return this.addressService.update(userId, id, updateAddressDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.addressService.remove(userId, id);
  }

  @Patch(':id/default')
  setDefault(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.addressService.setDefault(userId, id);
  }
}
