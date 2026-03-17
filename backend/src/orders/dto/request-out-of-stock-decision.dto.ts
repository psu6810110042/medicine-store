import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RequestOutOfStockDecisionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}
