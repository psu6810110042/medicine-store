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

    @Patch(':id/payment')
    async submitPayment(
        @Request() req,
        @Param('id') id: string,
        @Body() body: { method: 'BANK_TRANSFER' | 'PROMPTPAY'; note?: string; slipUrl?: string },
    ) {
        const user = req.user as User;

        // Only customer can submit payment
        if (user.role !== UserRole.CUSTOMER) {
            throw new ForbiddenException('Only customer can submit payment');
        }

        if (!body.slipUrl) {
            throw new BadRequestException('Slip URL is required');
        }

        const method = body.method === 'PROMPTPAY' ? 'PROMPTPAY' : 'BANK_TRANSFER';

        return this.ordersService.submitPayment(id, user.id, {
            method,
            note: body.note ?? '',
            slipUrl: body.slipUrl,
        });
    }
}
