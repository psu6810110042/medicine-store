import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ForbiddenException} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User, UserRole } from 'src/users/entities/user.entity';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@Request() req, @Body() createProductDto: CreateProductDto) {
      const user = req.user as User;
      if (!user || req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Access denied')
      }
        return this.productsService.create(createProductDto);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('minPrice') minPrice?: number,
        @Query('maxPrice') maxPrice?: number,
        @Query('inStock') inStock?: string,
        @Query('isControlled') isControlled?: string,
        @Query('ids') ids?: string,
        @Query('sortBy') sortBy?: string,
        @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
    ) {
        return this.productsService.findAll({
            search,
            categoryId,
            minPrice,
            maxPrice,
            inStock: inStock === 'true' ? true : inStock === 'false' ? false : undefined,
            isControlled: isControlled === 'true' ? true : isControlled === 'false' ? false : undefined,
            ids: ids ? ids.split(',') : undefined,
            sortBy,
            sortOrder,
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.productsService.findById(id);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
      const user = req.user as User;
      if (!user || req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Access denied')
      }
        return this.productsService.update(id, updateProductDto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {  
      const user = req.user as User;
      if (!user || req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Access denied')
      }
        return this.productsService.remove(id);
    }
}

