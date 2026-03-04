import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { PaymentStatus } from '../entities/order.entity';

export class UpdateOrderPaymentDto {
    @IsEnum(['BANK_TRANSFER', 'PROMPTPAY'])
    method: 'BANK_TRANSFER' | 'PROMPTPAY';

    @IsString()
    @IsOptional()
    slipUrl?: string;

    @IsString()
    @IsOptional()
    note?: string;
}
