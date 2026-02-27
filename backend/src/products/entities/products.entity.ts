import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';

@Entity('products')
export class Product {
    @PrimaryColumn()
    id: string;

    @Column({ length: 255 })
    name: string;

    @ManyToOne(() => Category, (category) => category.products)
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ nullable: true })
    categoryId: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column('text')
    description: string;

    @Column('text', { nullable: true })
    properties: string;

    @Column('text', { nullable: true })
    warnings: string;

    @Column({ nullable: true })
    image: string;

    @Column({ default: true })
    inStock: boolean;

    @Column({ default: false })
    isControlled: boolean;

    @Column({ default: false })
    requiresPrescription: boolean;

    @Column('int', { default: 0 })
    stockQuantity: number;

    @Column({ nullable: true })
    batchNumber: string;

    @Column({ type: 'date', nullable: true })
    expiryDate: string;

    @Column({ nullable: true })
    manufacturer: string;

    @Column({ nullable: true })
    activeIngredient: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
    orderItems: OrderItem[];
}
