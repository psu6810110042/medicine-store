import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
    ) { }

    async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
        const newCategory = this.categoryRepository.create({
            id: createCategoryDto.id || randomUUID(),
            name: createCategoryDto.name,
            icon: createCategoryDto.icon || 'folder',
        });
        return this.categoryRepository.save(newCategory);
    }

    async findAll(): Promise<Category[]> {
        return this.categoryRepository.find();
    }

    async findById(id: string): Promise<Category | null> {
        return this.categoryRepository.findOne({ where: { id } });
    }

    async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
        await this.categoryRepository.update(id, updateCategoryDto);
        const updatedCategory = await this.findById(id);
        if (!updatedCategory) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return updatedCategory;
    }

    async remove(id: string): Promise<void> {
        await this.categoryRepository.delete(id);
    }
}
