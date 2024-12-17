import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/infrastructure/services/auth.service'; // Adjust the path as per your project structure

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const cookies = request.cookies; // Extract cookies from the request
    console.log("cookies",cookies)

    if (!cookies || !cookies['access_token']) {
      throw new UnauthorizedException('No access token found in the cookies');
    }
    const token = cookies['access_token']
    try {
      // Validate the token and extract user details
      const user = await this.authService.verifyToken(token);
      request.user = user; // Attach decoded user data (email, id, etc.)
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Authentication failed');
    }
  }
}
