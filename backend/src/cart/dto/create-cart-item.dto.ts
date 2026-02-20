import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateCartItemDto {
    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsNumber()
    @Min(1)
    quantity: number;
}
