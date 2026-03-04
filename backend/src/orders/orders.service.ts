import {
    BadRequestException,
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/products.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddItemsToOrderDto } from './dto/add-items-to-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,
        private readonly dataSource: DataSource,
    ) { }

    async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let totalAmount = 0;
            const orderItemsToSave: OrderItem[] = [];

            const cart = await queryRunner.manager.findOne(Cart, {
                where: { user: { id: userId } }
            });

            for (const itemDto of createOrderDto.items) {
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: itemDto.productId },
                });

                if (cart) {
                    await queryRunner.manager.delete(CartItem, {
                        cart: { id: cart.id },
                        product: { id: itemDto.productId }
                    });
                }

                if (!product) {
                    throw new NotFoundException(`Product ${itemDto.productId} not found`);
                }

                if (product.stockQuantity < itemDto.quantity) {
                    throw new BadRequestException(
                        `Not enough stock for ${product.name}. Available: ${product.stockQuantity}`,
                    );
                }

                product.stockQuantity -= itemDto.quantity;
                if (product.stockQuantity === 0) {
                    product.inStock = false;
                }

                await queryRunner.manager.save(product);

                const orderItem = new OrderItem();
                orderItem.product = product;
                orderItem.quantity = itemDto.quantity;
                orderItem.priceAtTime = product.price;

                totalAmount += product.price * itemDto.quantity;
                orderItemsToSave.push(orderItem);
            }

            const order = new Order();
            order.user = { id: userId } as any;
            order.totalAmount = totalAmount;
            order.prescriptionImage = createOrderDto.prescriptionImage;
            order.shippingAddress = createOrderDto.shippingAddress;
            order.notes = createOrderDto.notes;
            order.items = orderItemsToSave;

            if (createOrderDto.prescriptionImage) {
                order.status = OrderStatus.PRESCRIPTION;
            }

            const savedOrder = await queryRunner.manager.save(Order, order);

            await queryRunner.commitTransaction();

            return this.findOne(savedOrder.id);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(): Promise<Order[]> {
        return this.orderRepository.find({
            relations: ['user', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Order[]> {
        return this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ['items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['user', 'items', 'items.product'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${id} not found`);
        }

        return order;
    }

    async updateStatus(
        id: string,
        updateOrderStatusDto: UpdateOrderStatusDto,
    ): Promise<Order> {
        const order = await this.findOne(id);
        order.status = updateOrderStatusDto.status;

        if (updateOrderStatusDto.status === OrderStatus.CANCELLED) {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                for (const item of order.items) {
                    const product = await queryRunner.manager.findOne(Product, {
                        where: { id: item.productId },
                    });

                    if (product) {
                        product.stockQuantity += item.quantity;
                        product.inStock = true;
                        await queryRunner.manager.save(product);
                    }
                }
                await queryRunner.manager.save(Order, order);
                await queryRunner.commitTransaction();
            } catch (err) {
                await queryRunner.rollbackTransaction();
                throw err;
            } finally {
                await queryRunner.release();
            }
        } else {
            await this.orderRepository.save(order);
        }

        return order;
    }

    async addItemsToOrder(
        id: string,
        dto: AddItemsToOrderDto,
    ): Promise<Order> {
        const order = await this.findOne(id);

        if (order.status !== OrderStatus.PRESCRIPTION) {
            throw new BadRequestException(
                'Items can only be added to orders with PRESCRIPTION status',
            );
        }

        if (!dto.items || dto.items.length === 0) {
            throw new BadRequestException('At least one item is required');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const existingItem of order.items) {
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: existingItem.productId },
                });
                if (product) {
                    product.stockQuantity += existingItem.quantity;
                    product.inStock = true;
                    await queryRunner.manager.save(product);
                }
            }

            await queryRunner.manager.delete(OrderItem, { orderId: id });

            let totalAmount = 0;
            const newItems: OrderItem[] = [];

            for (const itemDto of dto.items) {
                const product = await queryRunner.manager.findOne(Product, {
                    where: { id: itemDto.productId },
                });

                if (!product) {
                    throw new NotFoundException(`Product ${itemDto.productId} not found`);
                }

                if (product.stockQuantity < itemDto.quantity) {
                    throw new BadRequestException(
                        `Not enough stock for ${product.name}. Available: ${product.stockQuantity}`,
                    );
                }

                product.stockQuantity -= itemDto.quantity;
                if (product.stockQuantity === 0) product.inStock = false;
                await queryRunner.manager.save(product);

                const item = new OrderItem();
                item.order = { id } as Order;
                item.product = product;
                item.quantity = itemDto.quantity;
                item.priceAtTime = product.price;

                totalAmount += product.price * itemDto.quantity;
                newItems.push(item);
            }

            for (const item of newItems) {
                await queryRunner.manager
                    .createQueryBuilder()
                    .insert()
                    .into(OrderItem)
                    .values({
                        orderId: id,
                        productId: item.product.id,
                        quantity: item.quantity,
                        priceAtTime: item.priceAtTime,
                    })
                    .execute();
            }

            await queryRunner.manager.update(Order, id, { totalAmount });

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }

        return this.findOne(id);
    }

    async submitPayment(
        orderId: string,
        userId: string,
        payload: {
            method: 'BANK_TRANSFER' | 'PROMPTPAY';
            note: string;
            slipUrl: string;
        },
    ): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['user', 'items', 'items.product'],
        });

        if (!order) {
            throw new NotFoundException(`Order with ID ${orderId} not found`);
        }

        if (order.user?.id !== userId) {
            throw new ForbiddenException('This order does not belong to you');
        }

        const hasPaidTag = (order.notes ?? '').includes('[PAYMENT_SUBMITTED]');
        if (hasPaidTag) {
            throw new BadRequestException('Payment already submitted');
        }

        const paymentText = [
            '[PAYMENT_SUBMITTED]',
            `method=${payload.method}`,
            `slipUrl=${payload.slipUrl}`,
            `note=${payload.note ?? ''}`,
            `paidAt=${new Date().toISOString()}`,
        ].join(' | ');

        order.notes = order.notes
            ? `${order.notes}\n${paymentText}`
            : paymentText;

        await this.orderRepository.save(order);
        return this.findOne(orderId);
    }
}