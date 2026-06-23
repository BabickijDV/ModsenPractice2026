import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController, } from './bookings.controller';
import { RoomAvailabilityController } from './room-availability.controller';

@Module({
  providers: [BookingsService],
  controllers: [BookingsController, RoomAvailabilityController],
})
export class BookingsModule {}
