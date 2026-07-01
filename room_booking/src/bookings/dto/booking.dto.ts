import { IsString, IsUUID, IsDateString, MinLength, MaxLength, IsOptional, IsInt, Min, Max, IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingStatus } from '@prisma/client';
import { IsIn } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty()
  @IsUUID()
  roomId!: string;

  @ApiProperty()
  @IsDateString()
  startTime!: string;

  @ApiProperty()
  @IsDateString()
  endTime!: string;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;
}

export class BookingsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'фильтр по дате' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ enum: BookingStatus })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'фильтр по ID комнаты' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ enum: ['startTime', 'status'], default: 'startTime' })
  @IsOptional()
  @IsIn(['startTime', 'status'])
  sortBy?: 'startTime' | 'status' = 'startTime';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

export class RoomAvailabilityQueryDto {
  @ApiProperty({ description: 'начало' })
  @IsDateString()
  from!: string;

  @ApiProperty({ description: 'конец' })
  @IsDateString()
  to!: string;
}
