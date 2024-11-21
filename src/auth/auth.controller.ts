import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { JwtAuthGuard } from 'src/guards/auth.guard';
import { SetupDto } from './dto/setup.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify-2fa')
  async verify2FA(@Body() verify2FADto: Verify2faDto) {
    return this.authService.verify2FA(verify2FADto);
  }

  @Post('setup/complete')
  @UseGuards(JwtAuthGuard)
  async completeSetup(@Req() req: any, @Body() setupDto: SetupDto) {
    await this.authService.markSetupAsComplete(req.user.id, setupDto);
    return { message: 'Setup completed' };
  }

  @Get('check-setup')
  @UseGuards(JwtAuthGuard)
  async checkSetup(@Req() req: any) {
    return await this.authService.isSetupCompleted(req.user.id);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
