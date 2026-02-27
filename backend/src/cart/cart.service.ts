import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,
    ) { }

    async getCart(userId: string): Promise<Cart> {
        let cart = await this.cartRepository.findOne({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
        });

        if (!cart) {
            cart = this.cartRepository.create({
                user: { id: userId } as User,
            });
            await this.cartRepository.save(cart);
            // Re-fetch to ensure relations are initialized (empty array)
            const newCart = await this.cartRepository.findOne({
                where: { id: cart.id },
                relations: ['items', 'items.product'],
            });

            if (!newCart) {
                throw new Error('Failed to create cart');
            }
            return newCart;
        }

        // Sort items by created date to keep stable order
        if (cart.items) {
            cart.items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }

        return cart;
    }

    async addToCart(userId: string, createCartItemDto: CreateCartItemDto): Promise<Cart> {
        const cart = await this.getCart(userId);
        const { productId, quantity } = createCartItemDto;

        let cartItem = cart.items.find((item) => item.product.id === productId);

        if (cartItem) {
            cartItem.quantity += quantity;
            await this.cartItemRepository.save(cartItem);
        } else {
            cartItem = this.cartItemRepository.create({
                cart,
                product: { id: productId } as any,
                quantity,
            });
            await this.cartItemRepository.save(cartItem);
        }

        return this.getCart(userId);
    }

    async updateQuantity(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
        const cart = await this.getCart(userId);
        const cartItem = cart.items.find((item) => item.id === itemId);

        if (!cartItem) {
            throw new NotFoundException('Cart item not found');
        }

        cartItem.quantity = updateCartItemDto.quantity;
        await this.cartItemRepository.save(cartItem);

        return this.getCart(userId);
    }

    async removeFromCart(userId: string, itemId: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        const cartItem = cart.items.find((item) => item.id === itemId);

        if (cartItem) {
            await this.cartItemRepository.remove(cartItem);
        }

        return this.getCart(userId);
    }

    async updateQuantityByProductId(userId: string, productId: string, quantity: number): Promise<Cart> {
        const cart = await this.getCart(userId);
        const cartItem = cart.items.find((item) => item.product.id === productId);

        if (!cartItem) {
            throw new NotFoundException('Cart item not found in cart for this product');
        }

        cartItem.quantity = quantity;
        await this.cartItemRepository.save(cartItem);

        return this.getCart(userId);
    }

    async removeByProductId(userId: string, productId: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        const cartItem = cart.items.find((item) => item.product.id === productId);

        if (cartItem) {
            await this.cartItemRepository.remove(cartItem);
        }

        return this.getCart(userId);
    }

    async syncCart(userId: string, items: { productId: string; quantity: number }[]): Promise<Cart> {
        const cart = await this.getCart(userId);

        for (const item of items) {
            const existingItem = cart.items.find((i) => i.product.id === item.productId);
            if (existingItem) {
                // Option 1: Add quantities (merge)
                // existingItem.quantity += item.quantity;
                // await this.cartItemRepository.save(existingItem);

                // Option 2: Max (keep the one with more?) or just skip if exists?
                // Let's go with Add quantities, but usually sync happens on login, we might want to be careful.
                // User request: "When the user logs back in it'll resume from the cart saved inside of the database"
                // This implies DB is truth. But we also want to add local items involved in the "guest session".
                // Let's add them.
                existingItem.quantity += item.quantity;
                await this.cartItemRepository.save(existingItem);
            } else {
                const newItem = this.cartItemRepository.create({
                    cart,
                    product: { id: item.productId } as any,
                    quantity: item.quantity,
                });
                await this.cartItemRepository.save(newItem);
            }
        }

        return this.getCart(userId);
    }
}
