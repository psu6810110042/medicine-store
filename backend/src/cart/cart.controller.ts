import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @UseGuards(AuthenticatedGuard)
    @Get()
    getCart(@Request() req) {
        return this.cartService.getCart(req.user.id);
    }

    @UseGuards(AuthenticatedGuard)
    @Post()
    addToCart(@Request() req, @Body() createCartItemDto: CreateCartItemDto) {
        return this.cartService.addToCart(req.user.id, createCartItemDto);
    }

    @UseGuards(AuthenticatedGuard)
    @Post('sync')
    syncCart(@Request() req, @Body() items: { productId: string; quantity: number }[]) {
        return this.cartService.syncCart(req.user.id, items);
    }

    @UseGuards(AuthenticatedGuard)
    @Patch('items/:itemId')
    updateQuantity(
        @Request() req,
        @Param('itemId') itemId: string,
        @Body() updateCartItemDto: UpdateCartItemDto,
    ) {
        return this.cartService.updateQuantity(req.user.id, itemId, updateCartItemDto);
    }

    @UseGuards(AuthenticatedGuard)
    @Delete('items/:itemId')
    removeFromCart(@Request() req, @Param('itemId') itemId: string) {
        return this.cartService.removeFromCart(req.user.id, itemId);
    }
}
