import { Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, RoomsQueryDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: RoomsQueryDto) {
    const {
      page = 1,
      limit = 10,
      name,
      location,
      minCapacity,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      showAll = false,
    } = query;

    const where: any = {};

    if (!showAll) {
      where.isActive = true;
    }
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (minCapacity) {
      where.capacity = { gte: minCapacity };
    }

    const [total, data] = await Promise.all([
      this.prisma.room.count({ where }),
      this.prisma.room.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(dto: CreateRoomDto) {
    const existing = await this.prisma.room.findUnique({
      where: { name: dto.name },
    });
    if (existing) throw new ConflictException('Room with this name already exists');

    return this.prisma.room.create({ data: dto });
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.room.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (existing) throw new ConflictException('Room with this name already exists');
    }

    return this.prisma.room.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.room.delete({ where: { id } });
    return { message: 'Room deleted successfully' };
  }
}
