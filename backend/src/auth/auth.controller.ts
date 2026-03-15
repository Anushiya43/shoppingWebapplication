import { Controller, Get, Req, UseGuards, Res, Post, Body, UnauthorizedException, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './google-auth.guard';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google/customer')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCustomer(@Req() req) {
    // This will trigger the GoogleStrategy, and state will be handled by the guard
  }

  @Get('google/admin')
  @UseGuards(GoogleAuthGuard)
  async googleAuthAdmin(@Req() req) {
    // This will trigger the GoogleStrategy
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(@Req() req, @Res() res, @Query('state') state: string) {
    const user = req.user;
    
    // Redirect addresses based on port
    const customerUrl = 'http://localhost:3001/auth-success';
    const adminUrl = 'http://localhost:3002/auth-success';

    // Role-based validation before token generation
    if (state === 'admin' && user.role !== 'ADMIN') {
        return res.redirect(`${adminUrl}?error=admin_only`);
    }

    const tokens = await this.authService.generateTokens(user);
    const redirectUrl = state === 'admin' ? adminUrl : customerUrl;

    return res.redirect(
        `${redirectUrl}?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}&user_id=${tokens.user.id}`
    );
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    if (!body.userId || !body.refreshToken) {
        throw new UnauthorizedException('Invalid request');
    }
    return this.authService.refreshTokens(body.userId, body.refreshToken);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN') // Example: Only admins can see profiles of all logged in sessions? Or just testing RBAC
  @Post('logout')
  async logout(@Req() req) {
    await this.authService.logout(req.user.id);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('profile')
  async getProfile(@Req() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Get('admin-only')
  async adminOnly() {
    return { message: 'Welcome, Admin!' };
  }
}
