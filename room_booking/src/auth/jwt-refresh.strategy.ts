import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JWT_REFRESH_SECRET, AUTH_ERRORS } from './auth.constants';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: { sub: string }) {
    const refreshToken = req.body?.refreshToken;
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!tokenRecord) {
      throw new UnauthorizedException(AUTH_ERRORS.INVALID_REFRESH_TOKEN);
    }
    if (tokenRecord.isRevoked) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_REVOKED);
    }
    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_ERRORS.REFRESH_TOKEN_EXPIRED);
    }
    return {
      id: tokenRecord.userId,
      refreshTokenId: tokenRecord.id,
    };
  }
}
