import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './entities/products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';


@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) { }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const productData = {
      ...createProductDto,
      id: createProductDto.id || randomUUID(),
    };
    const newProduct = this.productsRepository.create(productData);
    return this.productsRepository.save(newProduct);
  }

  async findAll(params: {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isControlled?: boolean;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  } = {}): Promise<Product[]> {
    const { search, categoryId, minPrice, maxPrice, inStock, isControlled, sortBy, sortOrder } = params;

    const where: any = {};

    if (categoryId && categoryId !== 'all-categories') {
      where.categoryId = categoryId;
    }

    if (inStock !== undefined) {
      where.inStock = inStock;
    }

    if (isControlled !== undefined) {
      where.isControlled = isControlled;
    }

    // Price range
    if (minPrice !== undefined && maxPrice !== undefined) {
      where.price = Between(minPrice, maxPrice);
    } else if (minPrice !== undefined) {
      where.price = MoreThanOrEqual(minPrice);
    } else if (maxPrice !== undefined) {
      where.price = LessThanOrEqual(maxPrice);
    }

    // Search query (name or description)
    if (search) {
      where.name = ILike(`%${search}%`);
      // Note: simple OR logic with TypeORM 'find' can be tricky if combining with other AND conditions.
      // For simple cases, we might need multiple where clauses in an array for OR, but that duplicates other conditions.
      // Or use QueryBuilder. For now, let's stick to simple find.
      // If we want OR for name/description, we have to duplicate other checks or use query builder.
      // Let's use QueryBuilder for better flexibility.

      const query = this.productsRepository.createQueryBuilder('product');

      if (categoryId && categoryId !== 'all-categories') {
        query.andWhere('product.categoryId = :categoryId', { categoryId });
      }

      if (inStock !== undefined) {
        query.andWhere('product.inStock = :inStock', { inStock });
      }

      if (isControlled !== undefined) {
        query.andWhere('product.isControlled = :isControlled', { isControlled });
      }

      if (minPrice !== undefined) {
        query.andWhere('product.price >= :minPrice', { minPrice });
      }

      if (maxPrice !== undefined) {
        query.andWhere('product.price <= :maxPrice', { maxPrice });
      }

      if (search) {
        query.andWhere(
          '(product.name ILIKE :search OR product.description ILIKE :search)',
          { search: `%${search}%` }
        );
      }

      if (sortBy) {
        const order = sortOrder || 'ASC';
        // Prevent injection by checking allowed sort fields
        const allowedSortFields = ['price', 'name', 'createdAt'];
        if (allowedSortFields.includes(sortBy)) {
          query.orderBy(`product.${sortBy}`, order);
        } else {
          query.orderBy('product.name', 'ASC');
        }
      } else {
        query.orderBy('product.name', 'ASC');
      }

      return query.getMany();
    }

    // If no search, we can fallback to standard find or just use query builder for everything.
    // QueryBuilder is safer for the mixed structure.
    // Let's copy the logic above but without the 'if (search)' block wrapping.

    const query = this.productsRepository.createQueryBuilder('product');

    if (categoryId && categoryId !== 'all-categories') {
      query.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (inStock !== undefined) {
      query.andWhere('product.inStock = :inStock', { inStock });
    }

    if (isControlled !== undefined) {
      query.andWhere('product.isControlled = :isControlled', { isControlled });
    }

    if (minPrice !== undefined) {
      query.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (sortBy) {
      const order = sortOrder || 'ASC';
      const allowedSortFields = ['price', 'name', 'createdAt'];
      if (allowedSortFields.includes(sortBy)) {
        query.orderBy(`product.${sortBy}`, order);
      } else {
        query.orderBy('product.name', 'ASC');
      }
    } else {
      query.orderBy('product.name', 'ASC');
    }

    return query.getMany();
  }

  async findById(id: string): Promise<Product | null> {
    return this.productsRepository.findOne({ where: { id } });
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.productsRepository.update(id, updateProductDto);
    const updatedProduct = await this.findById(id);
    if (!updatedProduct) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    await this.productsRepository.delete(id);
  }
}
