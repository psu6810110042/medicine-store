import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AddressDto {
  @IsString() street: string;
  @IsString() district: string;
  @IsString() province: string;
  @IsString() postalCode: string;
}

class HealthDataDto {
  @IsString({ each: true }) @IsOptional() allergies: string[];
  @IsString({ each: true }) @IsOptional() chronicDiseases: string[];
  @IsString({ each: true }) @IsOptional() currentMedications: string[];
}

export class UpdateProfileDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HealthDataDto)
  healthData?: HealthDataDto;
}
