import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  CreateBookingDto,
  BookingsQueryDto,
  RoomAvailabilityQueryDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'создание брони' })
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'vjb ,hjyb' })
  findMy(
    @CurrentUser('id') userId: string,
    @Query() query: BookingsQueryDto,
  ) {
    return this.bookingsService.findMyBookings(userId, query);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'отмена брони' })
  @ApiParam({ name: 'id', type: String })
  cancel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) bookingId: string,
  ) {
    return this.bookingsService.cancel(userId, bookingId);
  }
}

import { Controller as NestController } from '@nestjs/common';

@ApiTags('Rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@NestController('rooms/:roomId/availability')
export class RoomAvailabilityController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'занятость комнаты за какое-то время' })
  @ApiParam({ name: 'roomId', type: String })
  getAvailability(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() query: RoomAvailabilityQueryDto,
  ) {
    return this.bookingsService.getRoomAvailability(roomId, query);
  }
}
