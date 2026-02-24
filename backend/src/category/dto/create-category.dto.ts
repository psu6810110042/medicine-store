import { IsString, IsOptional } from 'class-validator';

export class CreateCategoryDto {
    @IsOptional()
    @IsString()
    id?: string;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    icon?: string;
}
