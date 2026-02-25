import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User, UserRole } from '../users/entities/user.entity';

@Controller('orders')
@UseGuards(AuthenticatedGuard) // Protect all routes
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    const user = req.user as User;
    return this.ordersService.create(user.id, createOrderDto);
  }

  @Get()
  findAll(@Request() req) {
    const user = req.user as User;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.PHARMACIST) {
      throw new ForbiddenException('Access denied');
    }
    return this.ordersService.findAll();
  }

  @Get('my')
  findByUser(@Request() req) {
    const user = req.user as User;
    return this.ordersService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const user = req.user as User;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.PHARMACIST) {
      throw new ForbiddenException('Access denied');
    }
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }
}
