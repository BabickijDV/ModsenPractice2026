import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController, RoomAvailabilityController } from './bookings.controller';

@Module({
  providers: [BookingsService],
  controllers: [BookingsController, RoomAvailabilityController],
})
export class BookingsModule {}
