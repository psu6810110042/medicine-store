import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    OneToOne,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Cart } from '../../cart/entities/cart.entity';

export enum UserRole {
    CUSTOMER = 'customer',
    PHARMACIST = 'pharmacist',
    ADMIN = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    fullName: string;

    @Column()
    phone: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
    })
    role: UserRole;

    @Column({ type: 'jsonb', nullable: true })
    address?: {
        street: string;
        district: string;
        province: string;
        postalCode: string;
    };

    @Column({ type: 'jsonb', nullable: true })
    healthData?: {
        allergies: string[];
        chronicDiseases: string[];
        currentMedications: string[];
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Order, (order) => order.user)
    orders: Order[];

    @OneToOne(() => Cart, (cart) => cart.user)
    cart: Cart;
}
