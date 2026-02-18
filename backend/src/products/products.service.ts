import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/products.entity';

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product)
        private productsRepository: Repository<Product>,
    ) { }

    async create(product: Partial<Product>): Promise<Product> {
        const newProduct = this.productsRepository.create(product);
        return this.productsRepository.save(newProduct);
    }

    async findById(id: string): Promise<Product | null> {
        return this.productsRepository.findOne({ where: { id } });
    }
}
