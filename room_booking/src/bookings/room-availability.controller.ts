import { Controller as NestController } from '@nestjs/common';
import {  Get,  Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import {
  RoomAvailabilityQueryDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

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
    @Query() query: RoomAvailabilityQueryDto,hfguggh
  ) {
    return this.bookingsService.getRoomAvailability(roomId, query);
  }
}