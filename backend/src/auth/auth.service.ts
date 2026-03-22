import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User, Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validateUser(details: { 
    email: string; 
    firstName: string; 
    lastName: string; 
    googleId: string; 
    role?: Role 
  }): Promise<User> {
    let user = await this.prisma.user.findUnique({
      where: { email: details.email },
    });

    if (user) {
      if (user.isBlocked) {
        throw new UnauthorizedException('Your account is temporarily disabled. Please contact support at support@shoppingapp.com for assistance.');
      }
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: details.googleId },
        });
      }
      return user;
    }

    user = await this.prisma.user.create({
      data: {
        email: details.email,
        firstName: details.firstName,
        lastName: details.lastName,
        googleId: details.googleId,
        password: null, 
        role: details.role || 'CUSTOMER',
      },
    });

    return user;
  }

  async generateTokens(user: User) {
    const payload = { 
        sub: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: (process.env.JWT_EXPIRES_IN || '1h') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.REFRESH_TOKEN_SECRET,
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as any,
      }),
    ]);

    await this.updateRefreshToken(user.id, refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role
      }
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefreshToken },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.isBlocked || !user.refreshToken) {
      throw new UnauthorizedException('Your account is temporarily disabled. Please contact support at support@shoppingapp.com for assistance.');
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied');
    }

    return this.generateTokens(user);
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.updateMany({
      where: {
        id: userId,
        refreshToken: { not: null },
      },
      data: { refreshToken: null },
    });
  }
}
