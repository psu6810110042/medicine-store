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
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { User, UserRole } from '../users/entities/user.entity';

// ✅ Upload
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('orders')
@UseGuards(AuthenticatedGuard) // Protect all routes
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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

  @Patch(':id/items')
  addItems(
    @Request() req,
    @Param('id') id: string,
    @Body() addItemsToOrderDto: AddItemsToOrderDto,
  ) {
    const user = req.user as User;
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.PHARMACIST) {
      throw new ForbiddenException('Access denied');
    }
    return this.ordersService.addItemsToOrder(id, addItemsToOrderDto);
  }

  // =========================================================
  // ✅ NEW: Submit payment slip
  // POST /orders/:id/payment
  // form-data:
  //   slip: (file)  <-- สำคัญ: ต้องชื่อ slip
  //   method: BANK_TRANSFER | PROMPTPAY
  //   note: string
  // =========================================================
  @Post(':id/payment')
  @UseInterceptors(
    FileInterceptor('slip', {
      storage: diskStorage({
        destination: './uploads/slips',
        filename: (_, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        const ok = /image\/(png|jpeg|jpg)/.test(file.mimetype);
        cb(ok ? null : new BadRequestException('Only png/jpg/jpeg allowed'), ok);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async submitPayment(
    @Request() req,
    @Param('id') id: string,
    @UploadedFile() slip: Express.Multer.File,
    @Body() body: { method?: 'BANK_TRANSFER' | 'PROMPTPAY'; note?: string },
  ) {
    const user = req.user as User;

    // ✅ ให้ customer เท่านั้นส่งสลิป (กันเภสัช/แอดมินกดส่งมั่ว)
    if (user.role !== UserRole.CUSTOMER) {
      throw new ForbiddenException('Only customer can submit payment');
    }

    if (!slip) {
      throw new BadRequestException('Slip file is required');
    }

    const method =
      body.method === 'PROMPTPAY' ? 'PROMPTPAY' : 'BANK_TRANSFER';

    const slipUrl = `/uploads/slips/${slip.filename}`;

    // ✅ ไปทำงานต่อใน service เพื่อ update DB (ไม่กระทบ route เดิม)
    return this.ordersService.submitPayment(id, user.id, {
      method,
      note: body.note ?? '',
      slipUrl,
    });
  }
}