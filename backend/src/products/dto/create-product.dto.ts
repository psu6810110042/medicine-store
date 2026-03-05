import { IsString, IsNumber, IsBoolean, IsOptional, IsNotEmpty, Min, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsString()
    @IsOptional()
    id: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    categoryId: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    price: number;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsOptional()
    properties?: string;

    @IsString()
    @IsOptional()
    warnings?: string;

    @IsString()
    @IsOptional()
    image?: string;

    @IsBoolean()
    @IsOptional()
    inStock?: boolean;

    @IsBoolean()
    @IsOptional()
    isControlled?: boolean;

    @IsBoolean()
    @IsOptional()
    requiresPrescription?: boolean;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    @IsOptional()
    stockQuantity?: number;

    @IsString()
    @IsOptional()
    batchNumber?: string;

    @IsString()
    @IsOptional()
    expiryDate?: string;

    @IsString()
    @IsOptional()
    manufacturer?: string;

    @IsString()
    @IsOptional()
    activeIngredient?: string;
}
