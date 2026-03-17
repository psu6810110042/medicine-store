import { IsEnum, IsNotEmpty } from 'class-validator';

export enum OutOfStockDecision {
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}

export class RespondOutOfStockDecisionDto {
  @IsEnum(OutOfStockDecision)
  @IsNotEmpty()
  decision: OutOfStockDecision;
}
