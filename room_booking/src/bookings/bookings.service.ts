import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBookingDto, BookingsQueryDto, RoomAvailabilityQueryDto,
} from './dto/booking.dto';

import { Logger } from '@nestjs/common';

const MIN_DURATION_MS = 15 * 60 * 1000;       
const MAX_DURATION_MS = 8 * 60 * 60 * 1000;  

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateBookingDto) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('endTime must be after startTime');
    }
    const duration = endTime.getTime() - startTime.getTime();
    if (duration < MIN_DURATION_MS) {
      throw new BadRequestException('Booking duration must be at least 15 minutes');
    }
    if (duration > MAX_DURATION_MS) {
      throw new BadRequestException('Booking duration must not exceed 8 hours');
    }

    return this.prisma.$transaction(async (tx) => {
      const rooms = await tx.$queryRaw<any[]>`
        SELECT id, "isActive" FROM rooms WHERE id = ${dto.roomId} FOR UPDATE
      `;

      if (!rooms.length) {
        throw new NotFoundException('Room not found');
      }
      if (!rooms[0].isActive) {
        throw new BadRequestException('Room is not available for booking');
      }

      const conflict = await tx.booking.findFirst({
        where: {
          roomId: dto.roomId,
          status: BookingStatus.Active,
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      });

      if (conflict) {
        throw new ConflictException('Room is already booked for this time interval');
      }

      return tx.booking.create({
        data: {
          userId,
          roomId: dto.roomId,
          startTime,
          endTime,
          title: dto.title,
          status: BookingStatus.Active,
        },
        include: {
          room: true,
        },
      });
    });
  }

  async findMyBookings(userId: string, query: BookingsQueryDto) {
    const {
      page = 1,
      limit = 10,
      date,
      status,
      roomId,
      sortBy = 'startTime',
      sortOrder = 'asc',
    } = query;

    const where: any = { userId };

    if (status) where.status = status;
    if (roomId) where.roomId = roomId;

    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      where.startTime = { gte: dayStart, lte: dayEnd };
    }

    const [total, data] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          room: true,
        },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancel(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.userId !== userId) throw new ForbiddenException('Access denied');
    if (booking.status !== BookingStatus.Active) {
      throw new BadRequestException('Only active bookings can be cancelled');
    }
    if (booking.startTime <= new Date()) {
      throw new BadRequestException('Cannot cancel a booking that has already started');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.Cancelled },
    });
  }

  async getRoomAvailability(roomId: string, query: RoomAvailabilityQueryDto) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const from = new Date(query.from);
    const to = new Date(query.to);

    return this.prisma.booking.findMany({
      where: {
        roomId,
        status: { in: [BookingStatus.Active, BookingStatus.Completed] },
        AND: [
          { startTime: { lt: to } },
          { endTime: { gt: from } },
        ],
      },
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        title: true,
        status: true,
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async completeExpiredBookings() {
    const now = new Date();
    const result = await this.prisma.booking.updateMany({
      where: {
        status: BookingStatus.Active,
        endTime: { lte: now },
      },
      data: { status: BookingStatus.Completed },
    });

    if (result.count > 0) {
      this.logger.log(`Completed ${result.count} expired booking(s)`);
    }
  }

}
