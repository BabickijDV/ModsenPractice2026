// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { JwtRefreshGuard } from './jwt-refresh.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация — возвращает пару токенов' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход — возвращает пару токенов' })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные данные' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Обновить пару токенов по refresh-токену' })
  @ApiResponse({ status: 200, description: 'Новая пара токенов' })
  @ApiResponse({ status: 401, description: 'Refresh-токен недействителен' })
  refresh(@CurrentUser() user: any) {
    return this.authService.refresh(user.id, user.refreshTokenId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ summary: 'Выход — отзывает refresh-токен' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  logout(@CurrentUser() user: any) {
    return this.authService.logout(user.refreshTokenId);
  }
}