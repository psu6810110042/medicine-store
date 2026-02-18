import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100 })
  category: string;

  // Using 'decimal' is best practice for money to prevent floating-point math errors
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text')
  description: string;

  // Stores properties; could also be 'json' or 'jsonb' if using PostgreSQL
  @Column('text', { nullable: true })
  properties: string;

  @Column('text', { nullable: true })
  warnings: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  inStock: boolean;

  // ยาควบคุม (Controlled Drug)
  @Column({ default: false })
  isControlled: boolean;

  @Column({ default: false })
  requiresPrescription: boolean;

  @Column('int', { default: 0 })
  stockQuantity: number;

  @Column({ nullable: true })
  batchNumber: string;

  // Using 'date' allows for efficient queries (e.g., finding expired stock)
  @Column({ type: 'date', nullable: true })
  expiryDate: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  activeIngredient: string;

  // Automatically manages timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
