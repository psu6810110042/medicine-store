import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async create(category: Partial<Category>): Promise<Category> {
        const newCategory = this.categoryRepository.create(category);
        return this.categoryRepository.save(newCategory);
    }

    async findById(id: string): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { id } });
    }
}
