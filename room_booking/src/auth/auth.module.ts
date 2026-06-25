
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtRefreshGuard } from './jwt-refresh.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}), 
  ],
  providers: [
    AuthService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}