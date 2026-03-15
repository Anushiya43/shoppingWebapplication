import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'client_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, id } = profile;
    
    // Determine the role based on the 'state' parameter passed in the login URL
    const state = req.query.state;
    const role = state === 'admin' ? 'ADMIN' : 'CUSTOMER';

    const userDetails = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      googleId: id,
      role: role as 'ADMIN' | 'CUSTOMER',
    };
    
    const user = await this.authService.validateUser(userDetails);
    return user;
  }
}
