import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as argon2 from 'argon2';


@Injectable()
export class AuthService {
    constructor(
    private prisma: PrismaService,
    ) {}

    async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        });
        co