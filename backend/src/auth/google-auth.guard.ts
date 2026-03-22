import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return {
      state: request.query.state,
    };
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const response = context.switchToHttp().getResponse();
      const state = request.query.state;
      
      const frontendUrl = state === 'admin' 
        ? process.env.FRONTEND_ADMIN_URL 
        : process.env.FRONTEND_CUSTOMER_URL;

      // If blocked, redirect with specific error code
      if (err instanceof UnauthorizedException && err.message.includes('disabled')) {
        return response.redirect(`${frontendUrl}/auth-success?error=account_disabled`);
      }

      return response.redirect(`${frontendUrl}/auth-success?error=auth_failed`);
    }
    return user;
  }
}
