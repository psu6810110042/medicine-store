import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    ValidateNested,
    Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class AddItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}

export class AddItemsToOrderDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AddItemDto)
    items: AddItemDto[];
}
