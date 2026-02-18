import { Controller , Get, Param, NotFoundException} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll() {
    return "Hello from products page";
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return "product";
  }
}

