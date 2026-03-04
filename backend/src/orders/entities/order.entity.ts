import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  PRESCRIPTION = 'PRESCRIPTION',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
  STOCK = 'STOCK',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING_REVIEW,
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ nullable: true })
  prescriptionImage?: string;

  @Column({ type: 'jsonb', nullable: true })
  shippingAddress?: {
    street: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Payment Fields
  @Column({ nullable: true })
  paymentMethod?: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.UNPAID,
  })
  paymentStatus: PaymentStatus;

  @Column({ nullable: true })
  paymentSlipUrl?: string;

  @Column({ type: 'text', nullable: true })
  paymentNote?: string;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
