import { Controller, Get, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  listAll() {
    return this.orders.listAll();
  }

  @Get('search')
  search(@Query('email') email: string) {
    return this.orders.searchByEmail(email);
  }

  @Get('stats')
  stats(@Query('status') status?: string) {
    return this.orders.stats(status);
  }
}
