import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/infrastructure/services/auth.service';
import { MongoUserRepository } from 'src/infrastructure/database/repositories/user.repository'; // Assuming you have this service

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: MongoUserRepository, // To fetch user data
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const cookies = request.cookies;
    console.log(cookies)

    // if (!cookies || !cookies['access_token'] || !cookies['refresh_token'] ) {
    //   this.logger.warn('No tokens found in cookies');
    //   throw new UnauthorizedException('Authentication tokens are missing');
    // }

    const accessToken = cookies['access_token'];
    const refreshToken = cookies['refresh_token'];

    try {
      // Validate the access token
      const user = await this.authService.verifyToken(accessToken);
      request.user = user; // Attach decoded user data to the request
      return true; // Access token is valid, allow the request
    } catch (accessTokenError) {
      this.logger.warn('Access token is invalid or expired');

      //  Refresh Token checking
      try {
        const decodedRefreshToken = await this.authService.verifyToken(refreshToken);

        // comparing with refresh token in the database
        const userFromDb = await this.userService.findById(decodedRefreshToken.id);
        if (userFromDb.refreshToken !== refreshToken) {
          throw new UnauthorizedException('Invalid refresh token');
        }

        // Generatting a new access token
        const newTokens = await this.authService.generateTokens({
          id: userFromDb.id,
          email: userFromDb.email,
        });

        // Update the response cookies with the new access token
        response.cookie('access_token', newTokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        response.cookie('refresh_token', newTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        request.user = { id: decodedRefreshToken.id, email: decodedRefreshToken.email }; 
        return true; // Allow the request
      } catch (refreshTokenError) {
        this.logger.error('Refresh token is invalid or expired');
        throw new UnauthorizedException('Authentication failed');
      }
    }
  }
}
