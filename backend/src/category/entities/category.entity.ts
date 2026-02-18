import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/products.entity';

@Entity('categories')
export class Category {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column()
    icon: string;

    @OneToMany(() => Product, (product) => product.category)
    products: Product[];

    count?: number;
}
