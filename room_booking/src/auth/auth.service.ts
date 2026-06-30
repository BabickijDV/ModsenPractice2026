import { Injectable, ConflictException, UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, AUTH_ERRORS, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN,
} from './auth.constants';
import { JwtSignOptions } from '@nestjs/jwt';

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

    // Явная проверка на null — удовлетворяет строгому режиму TypeScript
    if (!user) {
      throw new NotFoundException(AUTH_ERRORS.USER_NOT_FOUND);
    }

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
    const accessOptions: JwtSignOptions = {
      secret: JWT_ACCESS_SECRET,
      expiresIn: JWT_ACCESS_EXPIRES_IN as JwtSignOptions['expiresIn'],
    };
    const refreshOptions: JwtSignOptions = {
      secret: JWT_REFRESH_SECRET,
      expiresIn: JWT_REFRESH_EXPIRES_IN as JwtSignOptions['expiresIn'],
    };
    const accessToken = this.jwtService.sign({ sub: userId, email }, accessOptions);
    const refreshToken = this.jwtService.sign({ sub: userId }, refreshOptions);
    const decoded = this.jwtService.decode(refreshToken) as { exp: number };
    const expiresAt = new Date(decoded.exp * 1000);
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });
    return { accessToken, refreshToken };
  }

  private sanitize(user: User) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
