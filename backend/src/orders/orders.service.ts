import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/products.entity';
import { CreateOrderDto } from './dto/create-order.dto';
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

      for (const itemDto of createOrderDto.items) {
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

        // Deduct stock
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

      // Status logic: if there is a prescription image, it goes to PRESCRIPTION, else PENDING_REVIEW
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

    // Restore stock if cancelled
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
            product.inStock = true; // since it's > 0
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
}
