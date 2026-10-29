import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.authService.register(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
    const result = await this.authService.login(dto);
    this.setRefreshCookie(res, result.refreshToken);
    return { user: result.user, accessToken: result.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  async logout(
    @CurrentUser() user: any,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const refreshToken = (req as any).cookies?.refresh_token;
    if (refreshToken) {
      await this.authService.logout(user.id, refreshToken);
    }
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const refreshToken = (req as any).cookies?.refresh_token;
    if (!refreshToken) {
      return res.status(401).send({ message: 'No refresh token' });
    }
    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async me(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  private setRefreshCookie(res: FastifyReply, token: string) {
    res.setCookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
  }
}
