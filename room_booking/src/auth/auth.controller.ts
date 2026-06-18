import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'регистрация ' })
  @ApiResponse({ status: 201, description: 'создание - возврат токена' })
  @ApiResponse({ status: 409, description: 'Email невалиден' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'вход' })
  @ApiResponse({ status: 200, description: 'вход - возврат токена' })
  @ApiResponse({ status: 401, description: 'неверные данные' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
