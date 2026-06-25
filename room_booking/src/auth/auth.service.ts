// src/auth/auth.service.ts
import { Injectable, ConflictException, UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, AUTH_ERRORS,
} from './auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException(AUTH_ERRORS.EMAIL_TAKEN);
    }

    const passwordHash = await argon2.hash(dto.password);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });

    const tokens = await this.generateTokenPair(user.id, user.email);

    return {
      ...tokens,
      user: this.sanitize(user),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const passwordValid = await argon2.verify(user.passwordHash, dto.password);

    if (!passwordValid) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    const tokens = await this.generateTokenPair(user.id, user.email);

    return {
      ...tokens,
      user: this.sanitize(user),
    };
  }

  async refresh(userId: string, refreshTokenId: string) {
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { isRevoked: true },
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const tokens = await this.generateTokenPair(user.id, user.email);

    return {
      ...tokens,
      user: this.sanitize(user),
    };
  }

  async logout(refreshTokenId: string) {
    await this.prisma.refreshToken.update({
      where: { id: refreshTokenId },
      data: { isRevoked: true },
    });

    return { message: 'Logged out successfully' };
  }

  private async generateTokenPair(userId: string, email: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, email },
      {
        secret: JWT_ACCESS_SECRET,
        expiresIn: '15m' as any,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: JWT_REFRESH_SECRET,
        expiresIn: '7d' as any,
      },
    );

    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  private sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}