import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, MinLength, MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(500)
  capacity: number;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  location: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'изменение имени комнаты' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(500)
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class RoomsQueryDto {
  @ApiPropertyOptional({ description: 'номер страницы, чтобы не возвращать сразу море данных', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'размер страницы', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'поиск по названию' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'поиск по расположению' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'мин вместимость' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minCapacity?: number;

  @ApiPropertyOptional({
    description: 'сортировка',
    enum: ['name', 'capacity', 'createdAt'],
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'capacity' | 'createdAt' = 'createdAt';

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'видимость неактивных комнат',
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  showAll?: boolean = false;
}
